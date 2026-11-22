import { describe, it, expect, vi, beforeEach } from 'vitest';

const getImage = vi.fn();
vi.mock('astro:assets', () => ({ getImage: (...args: unknown[]) => getImage(...args) }));

import { resolveCover } from '../../../src/lib/content/cover';

describe('resolveCover', () => {
  beforeEach(() => {
    getImage.mockReset();
    vi.restoreAllMocks();
  });

  it('returns the optimized src, width and height', async () => {
    getImage.mockResolvedValue({
      src: '/_astro/cover.abc123.webp',
      attributes: { width: 400, height: 600 },
      options: {},
    });

    const cover = await resolveCover('https://example.com/ok.jpg');

    expect(cover).toEqual({ src: '/_astro/cover.abc123.webp', width: 400, height: 600 });
    expect(getImage).toHaveBeenCalledWith({
      src: 'https://example.com/ok.jpg',
      inferSize: true,
      format: 'webp',
      width: 400,
    });
  });

  it('returns null and logs the URL when the image cannot be fetched', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getImage.mockRejectedValue(new Error('timeout'));

    const cover = await resolveCover('https://example.com/dead.jpg');

    expect(cover).toBeNull();
    expect(warn).toHaveBeenCalledWith('cover unavailable: https://example.com/dead.jpg');
  });

  it('returns null when the result has no usable dimensions', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    getImage.mockResolvedValue({ src: '/_astro/x.webp', attributes: {}, options: {} });
    expect(await resolveCover('https://example.com/nodims.jpg')).toBeNull();
  });

  it('fetches each URL only once', async () => {
    getImage.mockResolvedValue({
      src: '/_astro/once.webp',
      attributes: { width: 400, height: 600 },
      options: {},
    });
    await resolveCover('https://example.com/once.jpg');
    await resolveCover('https://example.com/once.jpg');
    expect(getImage).toHaveBeenCalledTimes(1);
  });
});
