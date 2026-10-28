import { readdir, readFile } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cvProfiles } from '../src/lib/cv/profiles';

const allowedPdf = 'assets/cv/jonathan-cv.pdf';
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const privateProfiles = Object.values(cvProfiles).filter(profile => profile.id !== 'generic');
const privateIds = privateProfiles.map(profile => escapeRegExp(profile.id)).join('|');
// Words like "devops" or "leadership" are legitimate blog/notes slugs, so a path is only
// private when it pairs a profile ID with a CV marker; "embedded-rd" is CV-only vocabulary.
const privateProfilePathPattern = new RegExp(`embedded-rd|(?:cv|resume|profile).*(?:${privateIds})|(?:${privateIds}).*(?:cv|resume|profile)`, 'i');
const selectorPattern = /(?:cv[-_ ]?profile|choose\s+(?:a\s+)?cv\s+profile|profile\s*selector)/i;
const privatePayloadPattern = new RegExp(
  [...privateProfiles.map(profile => escapeRegExp(profile.headline)), `profile(?:Id)?["'\\s:=]+(?:${privateIds})`].join('|'),
  'i',
);

type DeployFile = Readonly<{ path: string; absolutePath: string }>;

const filesBelow = async (root: string, directory = root): Promise<DeployFile[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const path = resolve(directory, entry.name);
    const deployPath = relative(root, path).split(sep).join('/');
    if (entry.isSymbolicLink()) {
      if (deployPath === allowedPdf) throw new Error(`CV deploy boundary requires the generic PDF to be a regular file: ${deployPath}`);
      throw new Error(`CV deploy boundary rejected symlink deploy entry: ${deployPath}`);
    }
    if (entry.isDirectory()) return filesBelow(root, path);
    if (!entry.isFile()) throw new Error(`CV deploy boundary rejected non-regular deploy entry: ${deployPath}`);
    return [{ path: deployPath, absolutePath: path }];
  }));
  return nested.flat();
};

export const validateCvDist = async (distPath: string): Promise<void> => {
  const root = resolve(distPath);
  const files = await filesBelow(root);
  for (const { path: file, absolutePath } of files) {
    if (extname(file).toLowerCase() === '.pdf' && file !== allowedPdf) {
      throw new Error(`CV deploy boundary rejected unexpected PDF: ${file}`);
    }
    if (privateProfilePathPattern.test(file)) {
      throw new Error(`CV deploy boundary rejected private profile artifact: ${file}`);
    }
    if (extname(file).toLowerCase() === '.html') {
      const html = await readFile(absolutePath, 'utf8');
      const normalizedHtml = html.replace(/&amp;/gi, '&');
      if (selectorPattern.test(normalizedHtml) || privatePayloadPattern.test(normalizedHtml)) {
        throw new Error(`CV deploy boundary rejected a private profile selector or payload in: ${file}`);
      }
    }
  }
  if (!files.some(file => file.path === allowedPdf)) throw new Error(`CV deploy boundary is missing required regular public PDF: ${allowedPdf}`);
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const distPath = process.argv[2];
  if (!distPath) throw new Error('Usage: check-cv-dist.ts <dist-directory>');
  await validateCvDist(distPath);
  console.log(`CV deploy boundary check passed: ${distPath}`);
}
