import { getImage } from 'astro:assets';

/** Width of the optimized cover. Shown at most 8rem wide, so this covers 3x displays. */
const COVER_WIDTH = 400;

export interface ResolvedCover {
  src: string;
  width: number;
  height: number;
}

// The card and the layout ask for the same cover; fetch and optimize each URL once per build.
const cache = new Map<string, Promise<ResolvedCover | null>>();

async function load(url: string): Promise<ResolvedCover | null> {
  try {
    const image = await getImage({ src: url, inferSize: true, format: 'webp', width: COVER_WIDTH });
    const width = Number(image.attributes.width);
    const height = Number(image.attributes.height);
    if (!image.src || !width || !height) throw new Error('no dimensions');
    return { src: image.src, width, height };
  } catch {
    // A dead or slow cover host must never fail the build: the page shows a placeholder.
    // Also the path for a host missing from image.remotePatterns in astro.config.mjs.
    console.warn(`cover unavailable: ${url} (dead host, or host not in image.remotePatterns)`);
    return null;
  }
}

/**
 * Fetches a remote book cover at build time and returns the optimized local
 * image (served from /_astro/), or null when the cover cannot be fetched.
 */
export function resolveCover(url: string): Promise<ResolvedCover | null> {
  let result = cache.get(url);
  if (!result) {
    result = load(url);
    cache.set(url, result);
  }
  return result;
}
