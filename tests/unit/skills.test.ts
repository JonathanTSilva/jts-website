import { describe, expect, it } from 'vitest';
import { career } from '../../src/content/portfolio/career';
import { getWebsiteSkills } from '../../src/lib/career/website';

describe('website skills', () => {
  it('has stable unique IDs and curated priority order', () => {
    const groups = getWebsiteSkills(career, 'en');
    expect(groups.map(({ id }) => id)).toEqual(['embedded-platforms', 'languages', 'networking-protocols', 'devops-tooling', 'leadership', 'research']);
    const skills = groups.flatMap(({ skills }) => skills);
    expect(new Set(skills.map(({ id }) => id)).size).toBe(skills.length);
    expect(skills.every(({ id, name }) => id.length > 0 && name.length > 0)).toBe(true);
  });

  it('is independent of pending work tags', () => {
    const fixture = structuredClone(career);
    fixture.positions.find(({ verification }) => verification === 'pending')!.tags.push('Pending-only skill');
    expect(getWebsiteSkills(fixture, 'en')).toEqual(getWebsiteSkills(career, 'en'));
  });
});
