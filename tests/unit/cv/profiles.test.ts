import { describe, expect, it } from 'vitest';
import { cvProfiles, profileIds } from '../../../src/lib/cv/profiles';

describe('CV profiles', () => {
  it('defines exactly the four supported immutable profiles', () => {
    expect(profileIds).toEqual(['generic', 'leadership', 'embedded-rd', 'devops']);
    expect(Object.keys(cvProfiles).sort()).toEqual(['devops', 'embedded-rd', 'generic', 'leadership']);
    expect(Object.isFrozen(cvProfiles)).toBe(true);
    expect(Object.isFrozen(profileIds)).toBe(true);
    expect(Object.values(cvProfiles).every(Object.isFrozen)).toBe(true);
    expect(() => (profileIds as unknown as string[]).push('other')).toThrow(TypeError);
    expect(profileIds).toEqual(['generic', 'leadership', 'embedded-rd', 'devops']);
  });

  it('keeps the approved public positioning and English-only declarative copy', () => {
    expect(cvProfiles.generic.headline).toBe('Senior Embedded/R&D Engineer | Technical Leadership | DevOps');
    for (const profile of Object.values(cvProfiles)) {
      expect(profile.headline).toEqual(expect.any(String));
      expect(profile.summary).toEqual(expect.any(String));
      expect(profile).not.toHaveProperty('jobDescription');
    }
    expect(new Set(Object.values(cvProfiles).map(profile => profile.headline)).size).toBe(4);
    expect(new Set(Object.values(cvProfiles).map(profile => profile.summary)).size).toBe(4);
    expect(Object.fromEntries(profileIds.map(id => [id, [cvProfiles[id].headline, cvProfiles[id].summary]]))).toEqual({
      generic: [
        'Senior Embedded/R&D Engineer | Technical Leadership | DevOps',
        'Senior embedded and R&D engineer building reliable industrial and telecommunications systems, with technical leadership and DevOps experience.',
      ],
      leadership: [
        'Technical Lead | Embedded & R&D Engineering',
        'Technical leader guiding embedded product development, engineering teams, and delivery practices for industrial systems.',
      ],
      'embedded-rd': [
        'Senior Embedded Software & R&D Engineer',
        'Embedded software and R&D engineer specializing in industrial systems, Linux, real-time platforms, networking, and applied research.',
      ],
      devops: [
        'Senior DevOps & Engineering Enablement Engineer',
        'Software engineer improving delivery through CI/CD, automation, Linux tooling, testing, and reliable engineering workflows.',
      ],
    });
  });

  it('differentiates themes and declares section order and hard limits', () => {
    expect(cvProfiles.leadership.themeOrder[0]).toBe('leadership');
    expect(cvProfiles['embedded-rd'].themeOrder[0]).toBe('embedded');
    expect(cvProfiles.devops.themeOrder[0]).toBe('devops');
    expect(cvProfiles.generic.themeOrder.slice(0, 4)).toEqual(['embedded', 'research', 'leadership', 'devops']);
    expect(cvProfiles.leadership.headline).toMatch(/Technical Lead/);
    expect(cvProfiles['embedded-rd'].summary).toMatch(/Linux.*real-time.*networking.*research/i);
    expect(cvProfiles.devops.summary).toMatch(/CI\/CD.*automation.*Linux.*testing/i);
    expect(new Set(Object.values(cvProfiles).map(profile => profile.themeOrder.join(','))).size).toBe(4);
    expect(new Set(Object.values(cvProfiles).map(profile => profile.sectionOrder.join(','))).size).toBeGreaterThan(1);
    for (const profile of Object.values(cvProfiles)) {
      expect(profile.sectionOrder.length).toBeGreaterThan(0);
      expect(Object.keys(profile.limits).sort()).toEqual(['highlightsPerRole', 'projects', 'publications', 'skills']);
      expect(Object.values(profile.limits).every(limit => Number.isInteger(limit) && limit > 0)).toBe(true);
    }
  });
});
