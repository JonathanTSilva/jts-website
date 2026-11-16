import { describe, it, expect } from 'vitest';
import { career } from '../../src/content/portfolio/career';
import { getWebsiteProjects } from '../../src/lib/career/website';

describe('home projects selection', () => {
  it('returns at most 4 projects', () => {
    expect(getWebsiteProjects(career, 'en', { home: true }).length).toBeLessThanOrEqual(4);
  });

  it('featured projects appear first', () => {
    const selected = getWebsiteProjects(career, 'en', { home: true });
    expect(selected.findIndex(p => !p.featured)).toBe(selected.filter(p => p.featured).length);
  });

  it('fills up to 4 with non-featured when fewer than 4 featured exist', () => {
    const featuredCount = career.projects.filter(p => p.featured).length;
    if (featuredCount < 4) {
      expect(getWebsiteProjects(career, 'en', { home: true }).length).toBe(Math.min(4, career.projects.length));
    }
  });

  it('every selected project has a title and description', () => {
    for (const p of getWebsiteProjects(career, 'en', { home: true })) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
    }
  });
});
