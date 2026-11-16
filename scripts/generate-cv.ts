import { lstat, mkdtemp, rename, rm } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCv as generateCvProduction } from '../src/lib/cv/generate';
import { getCvOutput as getCvOutputProduction } from '../src/lib/cv/output-policy';
import type { CvProfileId } from '../src/lib/cv/types';

type PrivateProfileId = Exclude<CvProfileId, 'generic'>;
type CliRequest =
  | Readonly<{ profileId: 'generic'; mode: 'public' }>
  | Readonly<{ profileId: PrivateProfileId; mode: 'private' }>;

const privateProfiles = Object.freeze([
  'leadership',
  'embedded-rd',
  'devops',
] as const satisfies readonly PrivateProfileId[]);

const isPrivateProfile = (value: string): value is PrivateProfileId =>
  privateProfiles.some(profileId => profileId === value);

export const parseCvArguments = (args: readonly string[]): readonly CliRequest[] => {
  if (args.length === 0) throw new Error('Missing CV command arguments');

  if (args.length === 1) {
    if (args[0] === '--public') return [{ profileId: 'generic', mode: 'public' }];
    if (args[0] === '--all-private') {
      return privateProfiles.map(profileId => ({ profileId, mode: 'private' as const }));
    }
    if (args[0] === '--profile') throw new Error('Missing profile after --profile');
    throw new Error(`Unsupported CV argument: ${args[0]}`);
  }

  if (args.length === 2 && args[0] === '--profile') {
    const profileId = args[1]!;
    if (profileId === 'generic') throw new Error('The generic profile is not available through the private command');
    if (!isPrivateProfile(profileId)) throw new Error(`Unknown private CV profile: ${profileId}`);
    return [{ profileId, mode: 'private' }];
  }

  if (args.includes('--output')) throw new Error('Unsupported CV argument: --output');
  throw new Error('Conflicting, repeated, or extra CV arguments; use exactly one supported command');
};

interface CliDependencies {
  readonly getCvOutput: (request: CliRequest) => string;
  readonly generateCv: (request: CliRequest) => Promise<Readonly<{
    output: string;
    warnings: readonly Readonly<{ code: string; entityId: string; message: string }>[];
  }>>;
  readonly fs?: Readonly<{
    lstat: typeof lstat;
    mkdtemp: typeof mkdtemp;
    rename: typeof rename;
    rm: typeof rm;
  }>;
}

const productionDependencies: CliDependencies = {
  getCvOutput: getCvOutputProduction,
  generateCv: generateCvProduction,
};

interface ResolvedRequest {
  readonly request: CliRequest;
  readonly output: string;
}

interface Backup {
  readonly output: string;
  readonly directory?: string;
  readonly file?: string;
}

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error);

const resolveRequests = (
  requests: readonly CliRequest[],
  getCvOutput: CliDependencies['getCvOutput'],
): readonly ResolvedRequest[] => requests.map(request => {
  try {
    return { request, output: getCvOutput(request) };
  } catch (error) {
    throw new Error(`${request.profileId}: ${errorMessage(error)}`);
  }
});

const runTransactionalBatch = async (
  resolved: readonly ResolvedRequest[],
  dependencies: CliDependencies,
): Promise<readonly Awaited<ReturnType<CliDependencies['generateCv']>>[]> => {
  const fs = dependencies.fs ?? { lstat, mkdtemp, rename, rm };
  const backups: Backup[] = [];
  const results: Awaited<ReturnType<CliDependencies['generateCv']>>[] = [];
  const existingOutputs = new Set<string>();
  for (const { request, output } of resolved) {
    try {
      const details = await fs.lstat(output);
      if (details.isSymbolicLink()) throw new Error('existing output must not be a symlink');
      if (!details.isFile()) throw new Error('existing output must be a regular file');
      existingOutputs.add(output);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') continue;
      throw new Error(`${request.profileId}: ${errorMessage(error)}`);
    }
  }
  try {
    // Generation is sequential and may be observable by another same-account process,
    // but rollback guarantees the command's final on-disk state is never a mixed batch.
    for (const { output } of resolved) {
      if (!existingOutputs.has(output)) {
        backups.push({ output });
        continue;
      }
      const directory = await fs.mkdtemp(join(dirname(output), '.cv-batch-backup-'));
      try {
        const file = join(directory, basename(output));
        await fs.rename(output, file);
        backups.push({ output, directory, file });
      } catch (error) {
        await fs.rm(directory, { recursive: true, force: true });
        throw error;
      }
    }

    for (const { request, output } of resolved) {
      try {
        const result = await dependencies.generateCv(request);
        if (result.output !== output) throw new Error('generator returned an unexpected output path');
        results.push(result);
      } catch (error) {
        throw new Error(`${request.profileId}: ${errorMessage(error)}`);
      }
    }
  } catch (error) {
    const rollbackErrors: string[] = [];
    for (const backup of backups) {
      try {
        await fs.rm(backup.output, { force: true });
        if (backup.file) await fs.rename(backup.file, backup.output);
        if (backup.directory) await fs.rm(backup.directory, { recursive: true, force: true });
      } catch (rollbackError) {
        rollbackErrors.push(errorMessage(rollbackError));
      }
    }
    if (rollbackErrors.length) {
      throw new Error(`${errorMessage(error)}; rollback failed: ${rollbackErrors.join('; ')}`);
    }
    throw error;
  }
  await Promise.all(backups.map(backup => backup.directory
    ? fs.rm(backup.directory, { recursive: true, force: true })
    : Promise.resolve()));
  return results;
};

export const main = async (
  args: readonly string[] = process.argv.slice(2),
  dependencies: CliDependencies = productionDependencies,
): Promise<void> => {
  const requests = parseCvArguments(args);
  const resolved = resolveRequests(requests, dependencies.getCvOutput);
  const results = requests.length > 1
    ? await runTransactionalBatch(resolved, dependencies)
    : [await (async () => {
      const { request, output } = resolved[0]!;
      try {
        const result = await dependencies.generateCv(request);
        if (result.output !== output) throw new Error('generator returned an unexpected output path');
        return result;
      } catch (error) {
        throw new Error(`${request.profileId}: ${errorMessage(error)}`);
      }
    })()];
  for (let index = 0; index < resolved.length; index += 1) {
    const { request } = resolved[index]!;
    const result = results[index]!;
    for (const warning of result.warnings) {
      console.warn(`[${warning.code}] ${warning.entityId}: ${warning.message}`);
    }
    console.log(`Generated ${request.profileId} CV: ${result.output}`);
  }
};

export const isDirectInvocation = (entrypoint: string | undefined, moduleUrl: string): boolean => {
  if (!entrypoint) return false;
  try {
    return realpathSync(entrypoint) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
};

if (isDirectInvocation(process.argv[1], import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
