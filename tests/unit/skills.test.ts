import { describe, it, expect } from 'vitest';
import { getSkills } from '../../src/lib/skills';

describe('getSkills', () => {
  it('returns skills sorted by count descending', () => {
    const skills = getSkills();
    for (let i = 0; i < skills.length - 1; i++) {
      expect(skills[i].count).toBeGreaterThanOrEqual(skills[i + 1].count);
    }
  });

  it('returns at least one skill', () => {
    const skills = getSkills();
    expect(skills.length).toBeGreaterThan(0);
  });

  it('every skill has a non-empty tag and positive count', () => {
    const skills = getSkills();
    for (const skill of skills) {
      expect(skill.tag.length).toBeGreaterThan(0);
      expect(skill.count).toBeGreaterThan(0);
    }
  });

  it('top 5 skills all have count >= the 6th skill', () => {
    const skills = getSkills();
    if (skills.length < 6) return; // not enough data to assert
    const fifthCount = skills[4].count;
    const sixthCount = skills[5].count;
    expect(fifthCount).toBeGreaterThanOrEqual(sixthCount);
  });

  it('deduplicates tags across projects and experience', () => {
    const skills = getSkills();
    const tags = skills.map(s => s.tag);
    const uniqueTags = new Set(tags);
    expect(tags.length).toBe(uniqueTags.size);
  });
});
