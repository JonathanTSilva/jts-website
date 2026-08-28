import { describe, expect, it, vi } from 'vitest';
import { main, parseCvArguments } from '../../../scripts/generate-cv';

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
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

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
    warn.mockRestore();
    log.mockRestore();
  });
});
