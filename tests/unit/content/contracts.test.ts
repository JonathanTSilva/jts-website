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

  it('should be case sensitive and require exact match with ## prefix', () => {
    const body = '# Intro\n## conclusion';
    const headings = ['Intro', 'Conclusion'];
    expect(requireSections(body, headings)).toEqual(['Intro', 'Conclusion']);
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
