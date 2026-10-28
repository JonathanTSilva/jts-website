import { mkdirSync, mkdtempSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
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

  it('rejects a redirected test root even when its symlink target remains in system temp', () => {
    const base = mkdtempSync(join(realpathSync(tmpdir()), 'cv-policy-root-link-'));
    const target = join(base, 'target');
    mkdirSync(target);
    symlinkSync(target, join(base, 'redirect'));
    expect(() => getCvOutput({ profileId: 'generic', mode: 'test', testRoot: join(base, 'redirect') }))
      .toThrow(/redirect/i);
  });

  it('rejects a pre-existing output filename symlink instead of returning its target', () => {
    const root = mkdtempSync(join(realpathSync(tmpdir()), 'cv-policy-file-link-'));
    const target = join(root, 'target.pdf');
    writeFileSync(target, 'not a cv');
    symlinkSync(target, join(root, 'jonathan-cv.pdf'));
    expect(() => getCvOutput({ profileId: 'generic', mode: 'test', testRoot: root }))
      .toThrow(/output.*redirect/i);
  });

  it('rejects broken symlinks at the test root or exact output filename', () => {
    const base = mkdtempSync(join(realpathSync(tmpdir()), 'cv-policy-broken-link-'));
    symlinkSync(join(base, 'missing-root'), join(base, 'broken-root'));
    expect(() => getCvOutput({ profileId: 'generic', mode: 'test', testRoot: join(base, 'broken-root') }))
      .toThrow(/symlink|redirect/i);

    const root = join(base, 'root');
    mkdirSync(root);
    symlinkSync(join(base, 'missing.pdf'), join(root, 'jonathan-cv.pdf'));
    expect(() => getCvOutput({ profileId: 'generic', mode: 'test', testRoot: root }))
      .toThrow(/output.*symlink|output.*redirect/i);
  });

  it('rejects traversal syntax even when normalization remains inside a dedicated temp root', () => {
    const root = mkdtempSync(join(realpathSync(tmpdir()), 'cv-policy-traversal-'));
    const child = join(root, 'child');
    mkdirSync(child);
    expect(() => getCvOutput({ profileId: 'generic', mode: 'test', testRoot: `${child}/..` }))
      .toThrow(/traversal|redirect/i);
  });

  it('does not expose an arbitrary output argument in the request type', () => {
    // @ts-expect-error arbitrary destinations are intentionally outside the API
    expect(() => getCvOutput({ profileId: 'generic', mode: 'public', output: resolve('dist/leak.pdf') })).toThrow(/unsupported.*output/i);
  });

  it('rejects unknown discriminants before branching or filename indexing', () => {
    expect(() => getCvOutput({ profileId: 'generic', mode: 'preview' } as never)).toThrow(/unknown mode.*preview/i);
    expect(() => getCvOutput({ profileId: 'other', mode: 'private' } as never)).toThrow(/unknown profile.*other/i);
  });

  it('requires a plain request with exact own enumerable data properties', () => {
    const inherited = Object.create({ output: resolve('dist/leak.pdf') }) as { profileId: 'generic'; mode: 'public' };
    inherited.profileId = 'generic';
    inherited.mode = 'public';
    expect(() => getCvOutput(inherited)).toThrow(/plain object|inherited/i);

    const hidden = { profileId: 'generic', mode: 'public' } as const;
    Object.defineProperty(hidden, 'output', { value: resolve('dist/leak.pdf'), enumerable: false });
    expect(() => getCvOutput(hidden)).toThrow(/non-enumerable|unsupported.*output/i);

    expect(() => getCvOutput({ profileId: 'generic', mode: 'public', extra: true } as never))
      .toThrow(/unsupported.*extra/i);
  });
});
