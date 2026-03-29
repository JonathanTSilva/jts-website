import { describe, it, expect } from 'vitest';
import { projects } from '../../src/content/portfolio/projects';

// Mirrors the selection logic in HomeSections.astro
function selectHomeProjects(max = 4) {
  const featured = projects.filter(p => p.status === 'Featured');
  return featured.length >= max
    ? featured.slice(0, max)
    : [
        ...featured,
        ...projects.filter(p => p.status !== 'Featured').slice(0, max - featured.length),
      ];
}

describe('home projects selection', () => {
  it('returns at most 4 projects', () => {
    expect(selectHomeProjects().length).toBeLessThanOrEqual(4);
  });

  it('featured projects appear first', () => {
    const selected = selectHomeProjects();
    const featuredProjects = projects.filter(p => p.status === 'Featured');
    featuredProjects.forEach(fp => {
      if (selected.some(s => s.title.en === fp.title.en)) {
        const idx = selected.findIndex(s => s.title.en === fp.title.en);
        const nonFeaturedBefore = selected.slice(0, idx).filter(s => s.status !== 'Featured');
        expect(nonFeaturedBefore.length).toBe(0);
      }
    });
  });

  it('fills up to 4 with non-featured when fewer than 4 featured exist', () => {
    const featuredCount = projects.filter(p => p.status === 'Featured').length;
    if (featuredCount < 4) {
      expect(selectHomeProjects().length).toBe(Math.min(4, projects.length));
    }
  });

  it('every selected project has a title and description', () => {
    for (const p of selectHomeProjects()) {
      expect(p.title.en.length).toBeGreaterThan(0);
      expect(p.description.en.length).toBeGreaterThan(0);
    }
  });
});
