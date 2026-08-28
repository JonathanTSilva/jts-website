import { mkdtemp, mkdir, symlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, test } from 'vitest';

import { validatePopplerOutput } from '../../../scripts/check-cv-poppler';
import { validateCvDist } from '../../../scripts/check-cv-dist';

const validInfo = [
  'Pages: 2',
  'Page    1 size: 595.92 x 842.04 pts (A4)',
  'Page    2 size: 595.92 x 842.04 pts (A4)',
].join('\n');
const validText = [
  'Jonathan Tobias da Silva', 'Skills', 'Experience', 'Nova Smar',
  'Education', 'University of São Paulo', 'Projects', 'Publications',
].join('\n');

describe('Poppler CV validation', () => {
  test('accepts one or two A4 pages with ordered anchors and standard headings', () => {
    expect(() => validatePopplerOutput(validInfo, validText)).not.toThrow();
  });

  test.each([
    ['Pages: 3\nPage    1 size: 595.92 x 842.04 pts (A4)', validText, /one or two pages/i],
    ['Pages: 1\nPage    1 size: 612 x 792 pts', validText, /A4/i],
    ['Pages: 2\nPage    1 size: 595.92 x 842.04 pts (A4)', validText, /every page|2.*size/i],
    ['Pages: 2\nPage    1 size: 595.92 x 842.04 pts (A4)\nPage    2 size: 612 x 792 pts', validText, /A4/i],
    [validInfo, validText.replace('Nova Smar\nEducation\nUniversity of São Paulo', 'University of São Paulo\nEducation\nNova Smar'), /anchor.*order|order.*anchor/i],
    [validInfo, validText.replace('Skills\n', ''), /Skills/],
    [validInfo, validText.replace('Skills\n', 'My Skills include embedded Linux\n'), /Skills/],
    [validInfo, validText.replace('Education\nUniversity', 'Projects\nEducation\nUniversity').replace('\nProjects\nPublications', '\nPublications'), /heading order/i],
    [validInfo, `${validText}\n\\csuse`, /template artifact/i],
    [validInfo, `${validText}\n�`, /replacement glyph/i],
  ])('rejects invalid Poppler output', (info, text, message) => {
    expect(() => validatePopplerOutput(info, text)).toThrow(message);
  });
});

describe('deploy CV boundary', () => {
  const makeDist = async () => mkdtemp(join(tmpdir(), 'cv-dist-'));
  const put = async (root: string, path: string, content = 'safe') => {
    await mkdir(join(root, path, '..'), { recursive: true });
    await writeFile(join(root, path), content);
  };

  test('allows only the generic PDF at its exact deploy path', async () => {
    const root = await makeDist();
    await put(root, 'assets/cv/jonathan-cv.pdf');
    await put(root, 'index.html', '<main>Portfolio</main>');
    await expect(validateCvDist(root)).resolves.toBeUndefined();
  });

  test.each([
    'resume.pdf',
    'nested/jonathan-cv.pdf',
    'assets/cv/jonathan-cv-leadership.pdf',
    'downloads/embedded-rd/profile.html',
    'devops/index.html',
    'notes/myleadershipcv.txt',
    'pages/devopsresume.html',
    'assets/xembedded-rdy.txt',
  ])('rejects private or extra deploy artifact %s', async path => {
    const root = await makeDist();
    await put(root, 'assets/cv/jonathan-cv.pdf');
    await put(root, path);
    await expect(validateCvDist(root)).rejects.toThrow(/deploy boundary|private profile/i);
  });

  test.each([
    '<select name="cv-profile"><option>generic</option><option>leadership</option></select>',
    '<a href="/cv/devops">Choose CV profile</a>',
    '<script>window.profile = "embedded-rd"</script>',
    '<h1>Technical Lead | Embedded &amp; R&amp;D Engineering</h1>',
    '<meta name="cv-profile-id" content="devops">',
  ])('rejects selector or private-profile content embedded in public HTML', async content => {
    const root = await makeDist();
    await put(root, 'assets/cv/jonathan-cv.pdf');
    await put(root, 'index.html', content);
    await expect(validateCvDist(root)).rejects.toThrow(/private profile|selector/i);
  });

  test.each([
    ['assets/cv/jonathan-cv.pdf', 'generic PDF'],
    ['assets/linked.txt', 'deploy entry'],
    ['linked-directory', 'deploy entry'],
  ])('rejects symlinked %s without following it', async (path, message) => {
    const root = await makeDist();
    await put(root, 'real.bin');
    await put(root, 'assets/cv/placeholder.txt');
    await symlink(path.endsWith('.pdf') ? resolve(root, 'real.bin') : resolve(root, 'outside'), join(root, path), path === 'linked-directory' ? 'dir' : 'file');
    await expect(validateCvDist(root)).rejects.toThrow(new RegExp(message, 'i'));
  });
});
