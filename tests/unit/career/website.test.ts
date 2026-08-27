import { describe, expect, it } from 'vitest';
import { career } from '../../../src/content/portfolio/career';
import { getWebsiteProjects, getWebsitePublications, getWebsiteSkills, getWebsiteTimeline } from '../../../src/lib/career/website';

describe('career website adapters', () => {
  it('combines verified work and education into localized reverse chronological views', () => {
    const en = getWebsiteTimeline(career, 'en');
    const pt = getWebsiteTimeline(career, 'pt-br');
    expect(en.map(({ id }) => id)).toEqual(['act-digital-senior-embedded-software-engineer', 'datacom-embedded-software-engineer', 'usp-msc-electrical-engineering', 'nova-smar-rd-engineer', 'ifsp-bsc-electrical-engineering', 'etec-technical-administration']);
    expect(en.filter(({ id }) => id === 'nova-smar-rd-engineer')).toHaveLength(1);
    expect(en.some(({ id }) => /intern|assistant|analyst/.test(id))).toBe(false);
    expect(en[0]).toMatchObject({ kind: 'work', title: 'Senior Embedded Software Engineer', location: 'Remote', startDate: '02/2026', endDate: 'Present' });
    expect(pt[0]).toMatchObject({ title: 'Engenheiro Sênior de Software Embarcado', location: 'Remoto', endDate: 'Atual' });
    expect(en[0]!.highlights[0]).toContain('Schneider Electric');
    expect(en.find(({ id }) => id === 'usp-msc-electrical-engineering')).toMatchObject({ startDate: '2022', endDate: '2025' });
    expect('verification' in en[0]!).toBe(false);
  });

  it('keeps same-employer roles adjacent under stable tie breaking', () => {
    const fixture = structuredClone(career);
    const nova = fixture.positions.find(({ id }) => id === 'nova-smar-rd-engineer')!;
    fixture.positions.push({ ...nova, id: 'nova-smar-second-role', verification: 'verified' });
    const ids = getWebsiteTimeline(fixture, 'en').map(({ id }) => id);
    expect(Math.abs(ids.indexOf(nova.id) - ids.indexOf('nova-smar-second-role'))).toBe(1);
  });

  it('uses declared group and skill priorities without frequency counts', () => {
    const groups = getWebsiteSkills(career, 'en');
    expect(groups[0]!.id).toBe('embedded-platforms');
    expect(groups[0]!.skills.slice(0, 3).map(({ id }) => id)).toEqual(['skill-embedded-linux', 'skill-embedded-systems', 'skill-linux']);
    expect(groups.flatMap(({ skills }) => skills).every(skill => !('count' in skill))).toBe(true);
  });

  it('selects at most four home projects deterministically with featured first', () => {
    const first = getWebsiteProjects(career, 'en', { home: true });
    expect(first).toHaveLength(4);
    expect(first).toEqual(getWebsiteProjects(career, 'en', { home: true }));
    expect(first.slice(0, 3).every(({ featured }) => featured)).toBe(true);
  });

  it('exposes only canonical HTTPS publication links', () => {
    const publications = getWebsitePublications(career, 'en');
    expect(publications.every(({ url }) => !url || url.startsWith('https://'))).toBe(true);
    expect(publications.find(({ id }) => id === 'publication-web-motor-drive-sizing')?.url).toBeUndefined();
  });
});
