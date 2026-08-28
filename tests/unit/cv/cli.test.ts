import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isDirectInvocation, main, parseCvArguments } from '../../../scripts/generate-cv';

const temporaryRoots: string[] = [];
const temporaryRoot = async () => {
  const root = await mkdtemp(join(tmpdir(), 'jts-cv-cli-'));
  temporaryRoots.push(root);
  return root;
};

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(temporaryRoots.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

describe('parseCvArguments', () => {
  it.each(['leadership', 'embedded-rd', 'devops'] as const)(
    'accepts the private %s profile command',
    profileId => {
      expect(parseCvArguments(['--profile', profileId])).toEqual([
        { profileId, mode: 'private' },
      ]);
    },
  );

  it('accepts the all-private command in a fixed order', () => {
    expect(parseCvArguments(['--all-private'])).toEqual([
      { profileId: 'leadership', mode: 'private' },
      { profileId: 'embedded-rd', mode: 'private' },
      { profileId: 'devops', mode: 'private' },
    ]);
  });

  it('accepts the independent public command', () => {
    expect(parseCvArguments(['--public'])).toEqual([
      { profileId: 'generic', mode: 'public' },
    ]);
  });

  it.each([
    [[], /missing/i],
    [['--profile'], /missing.*profile/i],
    [['--profile', 'generic'], /generic.*private/i],
    [['--profile', 'unknown'], /unknown.*profile/i],
    [['--output', 'somewhere.pdf'], /unsupported/i],
    [['--profile', 'devops', '--output', 'somewhere.pdf'], /unsupported/i],
    [['--profile', 'devops', '--all-private'], /conflicting|exactly/i],
    [['--public', '--all-private'], /conflicting|exactly/i],
    [['--profile', 'devops', '--profile', 'leadership'], /repeated|exactly/i],
    [['--all-private', '--all-private'], /repeated|exactly/i],
    [['--public', '--public'], /repeated|exactly/i],
    [['--profile', 'devops', 'extra'], /extra|exactly/i],
  ] as const)('rejects invalid arguments %j', (args, message) => {
    expect(() => parseCvArguments([...args])).toThrow(message);
  });
});

describe('main', () => {
  it('resolves the fixed output policy and generates each requested CV', async () => {
    const getCvOutput = vi.fn(request => `/fixed/${request.profileId}.pdf`);
    const generateCv = vi.fn(async request => ({
      output: `/fixed/${request.profileId}.pdf`,
      verification: {},
      warnings: [],
    }));

    await main(['--all-private'], { getCvOutput, generateCv });

    expect(getCvOutput).toHaveBeenCalledTimes(3);
    expect(generateCv).toHaveBeenCalledTimes(3);
    expect(generateCv.mock.calls.map(([request]) => request)).toEqual([
      { profileId: 'leadership', mode: 'private' },
      { profileId: 'embedded-rd', mode: 'private' },
      { profileId: 'devops', mode: 'private' },
    ]);
  });

  it('does not run generation merely because the module is imported', () => {
    expect(typeof main).toBe('function');
  });

  it('prints quality warnings as readable diagnostics', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await main(['--public'], {
      getCvOutput: vi.fn(() => '/fixed/public.pdf'),
      generateCv: vi.fn(async () => ({
        output: '/fixed/public.pdf',
        verification: {} as never,
        warnings: [{
          code: 'missing-measurable-impact',
          severity: 'warning',
          entityId: 'generic:experience:role:highlight',
          message: 'Highlight does not state a measurable impact.',
        }],
      })),
    });

    expect(warn).toHaveBeenCalledWith(
      '[missing-measurable-impact] generic:experience:role:highlight: Highlight does not state a measurable impact.',
    );
  });

  it('restores every prior private output when the second generator rejects', async () => {
    const root = await temporaryRoot();
    const outputs = Object.fromEntries(['leadership', 'embedded-rd', 'devops'].map(id => [id, join(root, `${id}.pdf`)]));
    await writeFile(outputs.leadership!, 'old leadership', { mode: 0o640 });
    await writeFile(outputs['embedded-rd']!, 'old embedded', { mode: 0o600 });
    const generateCv = vi.fn(async request => {
      if (request.profileId === 'embedded-rd') throw new Error('browser failed');
      await writeFile(outputs[request.profileId]!, `new ${request.profileId}`);
      return { output: outputs[request.profileId]!, warnings: [] };
    });
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(main(['--all-private'], {
      getCvOutput: request => outputs[request.profileId]!, generateCv,
    })).rejects.toThrow(/embedded-rd.*browser failed/i);

    expect(generateCv.mock.calls.map(([request]) => request.profileId)).toEqual(['leadership', 'embedded-rd']);
    expect(await readFile(outputs.leadership!, 'utf8')).toBe('old leadership');
    expect((await stat(outputs.leadership!)).mode & 0o777).toBe(0o640);
    expect(await readFile(outputs['embedded-rd']!, 'utf8')).toBe('old embedded');
    await expect(stat(outputs.devops!)).rejects.toMatchObject({ code: 'ENOENT' });
    expect((await readdir(root)).filter(name => name.includes('backup'))).toEqual([]);
    expect(log).not.toHaveBeenCalled();
  });

  it('does not alter files or start generation when output resolution rejects', async () => {
    const root = await temporaryRoot();
    const leadership = join(root, 'leadership.pdf');
    await writeFile(leadership, 'original');
    const generateCv = vi.fn();
    const getCvOutput = vi.fn(request => {
      if (request.profileId === 'embedded-rd') throw new Error('policy rejected');
      return join(root, `${request.profileId}.pdf`);
    });

    await expect(main(['--all-private'], { getCvOutput, generateCv }))
      .rejects.toThrow(/embedded-rd.*policy rejected/i);

    expect(generateCv).not.toHaveBeenCalled();
    expect(await readFile(leadership, 'utf8')).toBe('original');
    expect((await readdir(root)).filter(name => name.includes('backup'))).toEqual([]);
  });

  it('rolls back and fails fast when a generator returns the wrong output', async () => {
    const root = await temporaryRoot();
    const getCvOutput = vi.fn(request => join(root, `${request.profileId}.pdf`));
    const generateCv = vi.fn(async request => {
      const output = getCvOutput(request);
      await writeFile(output, `new ${request.profileId}`);
      return { output: request.profileId === 'embedded-rd' ? join(root, 'wrong.pdf') : output, warnings: [] };
    });

    await expect(main(['--all-private'], { getCvOutput, generateCv }))
      .rejects.toThrow(/embedded-rd.*unexpected output/i);

    expect(generateCv.mock.calls.map(([request]) => request.profileId)).toEqual(['leadership', 'embedded-rd']);
    expect(await readdir(root)).toEqual([]);
  });

  it('removes backups after a successful all-private generation', async () => {
    const root = await temporaryRoot();
    const getCvOutput = vi.fn(request => join(root, `${request.profileId}.pdf`));
    await writeFile(getCvOutput({ profileId: 'leadership', mode: 'private' }), 'old');
    const generateCv = vi.fn(async request => {
      const output = getCvOutput(request);
      await writeFile(output, `new ${request.profileId}`);
      return { output, warnings: [] };
    });

    await main(['--all-private'], { getCvOutput, generateCv });

    expect((await readdir(root)).sort()).toEqual(['devops.pdf', 'embedded-rd.pdf', 'leadership.pdf']);
    expect(await readFile(join(root, 'leadership.pdf'), 'utf8')).toBe('new leadership');
  });

  it('runs the real entrypoint and reports invalid arguments concisely', () => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', resolve('scripts/generate-cv.ts'), '--profile', 'generic'], {
      cwd: resolve('.'), encoding: 'utf8', env: {
        HOME: process.env.HOME,
        PATH: process.env.PATH,
        NODE_NO_WARNINGS: '1',
      },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr.trim()).toBe('The generic profile is not available through the private command');
  });

  it('recognizes a symlink alias of the entrypoint canonically', async () => {
    const root = await temporaryRoot();
    const source = resolve('scripts/generate-cv.ts');
    const alias = join(root, 'generate-cv-alias.ts');
    await symlink(source, alias);

    expect(isDirectInvocation(alias, pathToFileURL(source).href)).toBe(true);
  });
});
