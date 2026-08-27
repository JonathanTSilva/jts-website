import { describe, expect, it } from 'vitest';
import { cvProfiles, profileIds } from '../../../src/lib/cv/profiles';

describe('CV profiles', () => {
  it('defines exactly the four supported immutable profiles', () => {
    expect(profileIds).toEqual(['generic', 'leadership', 'embedded-rd', 'devops']);
    expect(Object.keys(cvProfiles).sort()).toEqual(['devops', 'embedded-rd', 'generic', 'leadership']);
    expect(Object.isFrozen(cvProfiles)).toBe(true);
    expect(Object.values(cvProfiles).every(Object.isFrozen)).toBe(true);
  });

  it('keeps the approved public positioning and English-only declarative copy', () => {
    expect(cvProfiles.generic.headline).toBe('Senior Embedded/R&D Engineer | Technical Leadership | DevOps');
    for (const profile of Object.values(cvProfiles)) {
      expect(profile.headline).toEqual(expect.any(String));
      expect(profile.summary).toEqual(expect.any(String));
      expect(profile).not.toHaveProperty('jobDescription');
    }
  });

  it('differentiates themes and declares section order and hard limits', () => {
    expect(cvProfiles.leadership.themeOrder[0]).toBe('leadership');
    expect(cvProfiles['embedded-rd'].themeOrder[0]).toBe('embedded');
    expect(cvProfiles.devops.themeOrder[0]).toBe('devops');
    expect(new Set(Object.values(cvProfiles).map(profile => profile.sectionOrder.join(','))).size).toBeGreaterThan(1);
    for (const profile of Object.values(cvProfiles)) {
      expect(profile.sectionOrder.length).toBeGreaterThan(0);
      expect(Object.keys(profile.limits).sort()).toEqual(['highlightsPerRole', 'projects', 'publications', 'skills']);
      expect(Object.values(profile.limits).every(limit => Number.isInteger(limit) && limit > 0)).toBe(true);
    }
  });
});
