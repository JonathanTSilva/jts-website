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
}

const productionDependencies: CliDependencies = {
  getCvOutput: getCvOutputProduction,
  generateCv: generateCvProduction,
};

export const main = async (
  args: readonly string[] = process.argv.slice(2),
  dependencies: CliDependencies = productionDependencies,
): Promise<void> => {
  for (const request of parseCvArguments(args)) {
    const expectedOutput = dependencies.getCvOutput(request);
    const result = await dependencies.generateCv(request);
    if (result.output !== expectedOutput) throw new Error('CV generator returned an unexpected output path');
    for (const warning of result.warnings) {
      console.warn(`[${warning.code}] ${warning.entityId}: ${warning.message}`);
    }
    console.log(`Generated ${request.profileId} CV: ${result.output}`);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
