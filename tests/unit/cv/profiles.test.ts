import { describe, expect, it } from 'vitest';
import { cvProfiles, profileIds } from '../../../src/lib/cv/profiles';

describe('CV profiles', () => {
  it('defines exactly the four supported immutable profiles', () => {
    expect(profileIds).toEqual(['generic', 'leadership', 'embedded-rd', 'devops']);
    expect(Object.keys(cvProfiles).sort()).toEqual(['devops', 'embedded-rd', 'generic', 'leadership']);
    expect(Object.isFrozen(cvProfiles)).toBe(true);
    expect(Object.isFrozen(profileIds)).toBe(true);
    expect(Object.values(cvProfiles).every(Object.isFrozen)).toBe(true);
    for (const profile of Object.values(cvProfiles)) {
      expect(Object.isFrozen(profile.themeOrder)).toBe(true);
      expect(Object.isFrozen(profile.sectionOrder)).toBe(true);
      expect(Object.isFrozen(profile.limits)).toBe(true);
    }
    expect(() => (profileIds as unknown as string[]).push('other')).toThrow(TypeError);
    expect(() => (cvProfiles.generic.themeOrder as unknown as string[]).push('general')).toThrow(TypeError);
    expect(() => (cvProfiles.generic.sectionOrder as unknown as string[]).push('experience')).toThrow(TypeError);
    expect(() => { (cvProfiles.generic.limits as { skills: number }).skills = 1; }).toThrow(TypeError);
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
        'Senior embedded software and R&D engineer delivering industrial automation and telecommunications systems with Embedded Linux, RTOS, networking, technical leadership, and CI/CD experience.',
      ],
      leadership: [
        'Technical Lead | Embedded & R&D Engineering',
        'Technical leader coordinating embedded product development and engineering teams, with hands-on experience in industrial systems, Git migrations, CI/CD, and applied R&D.',
      ],
      'embedded-rd': [
        'Senior Embedded Software & R&D Engineer',
        'Embedded software and R&D engineer specializing in C/C++, Python, Embedded Linux, RTOS, industrial and telecommunications protocols, cybersecurity, and applied research.',
      ],
      devops: [
        'DevOps & Engineering Enablement | Senior Embedded Software Engineer',
        'Software engineer improving embedded and R&D delivery through CI/CD, automation, Linux tooling, unit and integration testing, and reliable engineering workflows.',
      ],
    });
  });

  it('differentiates themes and declares section order and hard limits', () => {
    expect(cvProfiles.leadership.themeOrder[0]).toBe('leadership');
    expect(cvProfiles['embedded-rd'].themeOrder[0]).toBe('embedded');
    expect(cvProfiles.devops.themeOrder[0]).toBe('devops');
    expect(cvProfiles.generic.themeOrder.slice(0, 4)).toEqual(['embedded', 'research', 'leadership', 'devops']);
    expect(cvProfiles.leadership.headline).toMatch(/Technical Lead/);
    expect(cvProfiles['embedded-rd'].summary).toMatch(/C\/C\+\+.*Python.*Linux.*RTOS.*protocols.*research/i);
    expect(cvProfiles.devops.summary).toMatch(/CI\/CD.*automation.*Linux.*testing/i);
    expect(cvProfiles.devops.headline).toBe('DevOps & Engineering Enablement | Senior Embedded Software Engineer');
    expect(new Set(Object.values(cvProfiles).map(profile => profile.themeOrder.join(','))).size).toBe(4);
    expect(new Set(Object.values(cvProfiles).map(profile => profile.sectionOrder.join(','))).size).toBeGreaterThan(1);
    for (const profile of Object.values(cvProfiles)) {
      expect(profile.sectionOrder.length).toBeGreaterThan(0);
      expect(Object.keys(profile.limits).sort()).toEqual(['highlightsPerRole', 'projects', 'publications', 'skills']);
      expect(Object.values(profile.limits).every(limit => Number.isInteger(limit) && limit > 0)).toBe(true);
    }
  });
});
