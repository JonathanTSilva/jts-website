import { describe, it, expect } from 'vitest';
import { requireSections } from '../../../src/lib/content/contracts';
import { validateContent } from '../../../src/lib/content/validation';

describe('requireSections', () => {
  it('should return empty array when all headings are present', () => {
    const body = '## Intro\nSome content\n## Conclusion\nEnd';
    const headings = ['Intro', 'Conclusion'];
    expect(requireSections(body, headings)).toEqual([]);
  });

  it('should return missing headings', () => {
    const body = '## Intro\nSome content';
    const headings = ['Intro', 'Conclusion'];
    expect(requireSections(body, headings)).toEqual(['Conclusion']);
  });

  it('should be case sensitive', () => {
    const body = '## conclusion';
    const headings = ['Conclusion'];
    expect(requireSections(body, headings)).toEqual(['Conclusion']);
  });

  it('should accept any heading level (H1–H6)', () => {
    const body = '# Conclusion\nEnd';
    const headings = ['Conclusion'];
    expect(requireSections(body, headings)).toEqual([]);
  });

  it('should accept pipe-separated alternatives', () => {
    const body = '# Conclusão\nFim';
    const headings = ['Conclusion|Conclusão'];
    expect(requireSections(body, headings)).toEqual([]);
  });

  it('should return missing when no alternative matches', () => {
    const body = '## Outro\nTexto';
    const headings = ['Conclusion|Conclusão'];
    expect(requireSections(body, headings)).toEqual(['Conclusion|Conclusão']);
  });
});

describe('validateContent', () => {
  const validBlogFrontmatter = {
    slug: 'test-post',
    title: 'Test Post',
    language: 'en',
    translationKey: 'test-1',
    publishedAt: '2026-03-19',
    summary: 'A test post summary',
    tags: ['test']
  };

  it('should validate valid blog content', () => {
    const body = '## Conclusion\nBye';
    const result = validateContent('blog', validBlogFrontmatter, body);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail if frontmatter is missing required fields', () => {
    const invalidFrontmatter = { ...validBlogFrontmatter };
    (invalidFrontmatter as any).title = undefined;
    const body = '## Conclusion\nBye';
    const result = validateContent('blog', invalidFrontmatter, body);
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('Frontmatter: [title]');
  });

  it('should fail if required sections are missing', () => {
    const body = 'No conclusion here';
    const result = validateContent('blog', validBlogFrontmatter, body);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Content: Missing required section "## Conclusion"');
  });

  it('should accept H1 Conclusion', () => {
    const body = '# Conclusion\nBye';
    const result = validateContent('blog', validBlogFrontmatter, body);
    expect(result.success).toBe(true);
  });

  it('should accept H1 Conclusão', () => {
    const body = '# Conclusão\nFim';
    const result = validateContent('blog', validBlogFrontmatter, body);
    expect(result.success).toBe(true);
  });

  it('should accept ## Conclusão', () => {
    const body = '## Conclusão\nFim';
    const result = validateContent('blog', validBlogFrontmatter, body);
    expect(result.success).toBe(true);
  });

  it('should validate valid note content (no required sections)', () => {
    const validNoteFrontmatter = {
      slug: 'test-note',
      title: 'Test Note',
      language: 'pt-br',
      translationKey: 'note-1',
      publishedAt: '2026-03-19'
    };
    const body = 'Just some text';
    const result = validateContent('notes', validNoteFrontmatter, body);
    expect(result.success).toBe(true);
  });
});

describe('validateContent — book notes', () => {
  const baseBook = {
    slug: 'test-book',
    title: 'Test Book',
    language: 'en',
    translationKey: 'test-book',
    publishedAt: '2026-01-01',
    noteType: 'book',
    author: ['Author Name'],
    cover: 'https://example.com/cover.jpg',
  };

  it('accepts a valid book note', () => {
    const result = validateContent('notes', baseBook, 'Some content');
    expect(result.success).toBe(true);
  });

  it('fails when author is missing', () => {
    const { author: _, ...noAuthor } = baseBook;
    const result = validateContent('notes', noAuthor, 'Some content');
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.includes('author'))).toBe(true);
  });

  it('fails when cover is missing', () => {
    const { cover: _, ...noCover } = baseBook;
    const result = validateContent('notes', noCover, 'Some content');
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.includes('cover'))).toBe(true);
  });
});

describe('validateContent — mindmap notes', () => {
  const baseMindmap = {
    slug: 'test-map',
    title: 'Test Map',
    language: 'en',
    translationKey: 'test-map',
    publishedAt: '2026-01-01',
    noteType: 'mindmap',
  };

  it('accepts a mindmap note with H1', () => {
    const result = validateContent('notes', baseMindmap, '# Root\n\n## Branch');
    expect(result.success).toBe(true);
    expect(result.warnings ?? []).toHaveLength(0);
  });

  it('warns when mindmap has no H1', () => {
    const result = validateContent('notes', baseMindmap, '## Branch\n\nNo root');
    expect(result.warnings?.some(w => w.includes('H1'))).toBe(true);
  });
});
