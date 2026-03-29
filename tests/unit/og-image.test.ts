import { describe, expect, it } from 'vitest';
import { DEFAULT_OG_AUTHOR, DEFAULT_OG_AUTHOR_ROLE, DEFAULT_OG_DOMAIN } from '../../src/lib/ogImage';

describe('ogImage defaults', () => {
  it('uses refreshed public identity defaults', () => {
    expect(DEFAULT_OG_AUTHOR).toBe('Jonathan Tobias');
    expect(DEFAULT_OG_AUTHOR_ROLE).toBe('Senior Embedded Software Engineer');
    expect(DEFAULT_OG_DOMAIN).toBe('jontobias.com');
  });
});
