import { readdir, readFile } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const allowedPdf = 'assets/cv/jonathan-cv.pdf';
const privateProfilePattern = /(?:^|[^a-z])(leadership|embedded-rd|devops)(?:[^a-z]|$)/i;
const selectorPattern = /(?:cv[-_ ]?profile|choose\s+(?:a\s+)?cv\s+profile|profile\s*selector)/i;

const filesBelow = async (root: string, directory = root): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesBelow(root, path) : [relative(root, path).split(sep).join('/')];
  }));
  return nested.flat();
};

export const validateCvDist = async (distPath: string): Promise<void> => {
  const root = resolve(distPath);
  const files = await filesBelow(root);
  for (const file of files) {
    if (extname(file).toLowerCase() === '.pdf' && file !== allowedPdf) {
      throw new Error(`CV deploy boundary rejected unexpected PDF: ${file}`);
    }
    if (privateProfilePattern.test(file)) {
      throw new Error(`CV deploy boundary rejected private profile artifact: ${file}`);
    }
    if (extname(file).toLowerCase() === '.html') {
      const html = await readFile(resolve(root, file), 'utf8');
      if (selectorPattern.test(html) || /(?:window\.)?profile\s*=\s*["'](?:leadership|embedded-rd|devops)["']/i.test(html)) {
        throw new Error(`CV deploy boundary rejected a private profile selector or payload in: ${file}`);
      }
    }
  }
  if (!files.includes(allowedPdf)) throw new Error(`CV deploy boundary is missing required public PDF: ${allowedPdf}`);
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const distPath = process.argv[2];
  if (!distPath) throw new Error('Usage: check-cv-dist.ts <dist-directory>');
  await validateCvDist(distPath);
  console.log(`CV deploy boundary check passed: ${distPath}`);
}
