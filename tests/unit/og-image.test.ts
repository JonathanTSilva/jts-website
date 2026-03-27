import { describe, expect, it } from 'vitest';
import { DEFAULT_OG_AUTHOR, DEFAULT_OG_SITE_NAME } from '../../src/lib/ogImage';

describe('ogImage defaults', () => {
  it('uses refreshed public identity defaults', () => {
    expect(DEFAULT_OG_AUTHOR).toBe('Jonathan Tobias');
    expect(DEFAULT_OG_SITE_NAME).toBe('www.jontobias.com');
  });
});
