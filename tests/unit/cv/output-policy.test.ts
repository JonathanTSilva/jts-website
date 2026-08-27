import { mkdtempSync, realpathSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getCvOutput } from '../../../src/lib/cv/output-policy';

describe('getCvOutput', () => {
  it('maps each profile to its one fixed production destination', () => {
    expect(getCvOutput({ profileId: 'generic', mode: 'public' })).toBe(resolve('public/assets/cv/jonathan-cv.pdf'));
    expect(getCvOutput({ profileId: 'leadership', mode: 'private' })).toBe(resolve('.cv-output/jonathan-tobias-cv-leadership.pdf'));
    expect(getCvOutput({ profileId: 'embedded-rd', mode: 'private' })).toBe(resolve('.cv-output/jonathan-tobias-cv-embedded-rd.pdf'));
    expect(getCvOutput({ profileId: 'devops', mode: 'private' })).toBe(resolve('.cv-output/jonathan-tobias-cv-devops.pdf'));
  });

  it('rejects crossing the public/private profile boundary', () => {
    // @ts-expect-error private profiles cannot select public production mode
    expect(() => getCvOutput({ profileId: 'leadership', mode: 'public' })).toThrow(/private profile/i);
    // @ts-expect-error the generic profile cannot select private production mode
    expect(() => getCvOutput({ profileId: 'generic', mode: 'private' })).toThrow(/generic profile/i);
  });

  it('requires test roots to be canonically contained by the system temp directory', () => {
    expect(() => getCvOutput({ profileId: 'generic', mode: 'test', testRoot: resolve('.') })).toThrow(/system temp/i);

    const root = mkdtempSync(join(realpathSync(tmpdir()), 'cv-policy-'));
    expect(getCvOutput({ profileId: 'generic', mode: 'test', testRoot: root }))
      .toBe(join(root, 'jonathan-cv.pdf'));
    expect(getCvOutput({ profileId: 'devops', mode: 'test', testRoot: root }))
      .toBe(join(root, 'jonathan-tobias-cv-devops.pdf'));
  });

  it('rejects prefix tricks and symlinks escaping system temp', () => {
    expect(() => getCvOutput({ profileId: 'generic', mode: 'test', testRoot: `${realpathSync(tmpdir())}-escape` }))
      .toThrow(/system temp/i);

    const root = mkdtempSync(join(realpathSync(tmpdir()), 'cv-policy-link-'));
    symlinkSync(resolve('.'), join(root, 'escape'));
    expect(() => getCvOutput({ profileId: 'generic', mode: 'test', testRoot: join(root, 'escape') }))
      .toThrow(/system temp/i);
  });

  it('does not expose an arbitrary output argument in the request type', () => {
    // @ts-expect-error arbitrary destinations are intentionally outside the API
    expect(() => getCvOutput({ profileId: 'generic', mode: 'public', output: resolve('dist/leak.pdf') })).toThrow(/unsupported.*output/i);
  });
});
