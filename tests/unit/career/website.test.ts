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

  it('keeps distinct-date employer progression adjacent and internally reverse chronological', () => {
    const fixture = structuredClone(career);
    const nova = fixture.positions.find(({ id }) => id === 'nova-smar-rd-engineer')!;
    fixture.positions.push({
      ...nova,
      id: 'nova-smar-later-role',
      dates: { ...nova.dates, start: { value: '2023-06', precision: 'month' } },
      verification: 'verified',
    });
    const ids = getWebsiteTimeline(fixture, 'en').map(({ id }) => id);
    expect(ids.slice(ids.indexOf('nova-smar-later-role'), ids.indexOf('nova-smar-later-role') + 2)).toEqual([
      'nova-smar-later-role',
      'nova-smar-rd-engineer',
    ]);
    expect(ids.indexOf('usp-msc-electrical-engineering')).toBeGreaterThan(ids.indexOf('nova-smar-rd-engineer'));
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

describe('career website adapters: fallbacks and ties', () => {
  type Career = typeof career;
  const base = (): Career => structuredClone(career);

  it('falls back through position, employer and empty locations and names', () => {
    const fixture = base();
    const verified = fixture.positions.filter(({ verification }) => verification === 'verified');
    const [withLocation, withoutLocation, orphan] = [verified[0]!, verified[1]!, verified[2]!];
    fixture.positions = [
      { ...withLocation, id: 'p-own', location: { en: 'Own place', 'pt-br': 'Lugar' } },
      { ...withoutLocation, id: 'p-employer' },
      { ...orphan, id: 'p-orphan', employerId: 'unknown-employer' },
    ];
    delete (fixture.positions[1] as { location?: unknown }).location;
    delete (fixture.positions[2] as { location?: unknown }).location;
    fixture.employers = fixture.employers.map((employer) =>
      employer.id === withoutLocation.employerId ? { ...employer, location: { en: 'Employer city', 'pt-br': 'Cidade' } } : employer,
    );
    fixture.education = [];
    const items = new Map(getWebsiteTimeline(fixture, 'en').map((item) => [item.id, item]));
    expect(items.get('p-own')!.location).toBe('Own place');
    expect(items.get('p-employer')!.location).toBe('Employer city');
    expect(items.get('p-orphan')).toMatchObject({ organization: '', location: '' });
  });

  it('formats open-ended education without a location', () => {
    const fixture = base();
    const school = { ...fixture.education[0]! };
    delete (school as { location?: unknown }).location;
    delete (school as { dates: { end?: unknown } }).dates.end;
    fixture.education = [school];
    fixture.positions = [];
    expect(getWebsiteTimeline(fixture, 'en')[0]).toMatchObject({ location: '', endDate: 'Present' });
  });

  it('orders equal start dates by kind and then by id, and roles of one employer by id', () => {
    const fixture = base();
    const verified = fixture.positions.find(({ verification }) => verification === 'verified')!;
    const date = { start: { value: '2024-01', precision: 'month' as const } };
    fixture.positions = [
      { ...verified, id: 'z-role', employerId: 'emp-z', dates: date },
      { ...verified, id: 'a-role', employerId: 'emp-a', dates: date },
      { ...verified, id: 'm-role-2', employerId: 'emp-a', dates: date },
    ];
    fixture.employers = [
      ...fixture.employers,
      { ...fixture.employers[0]!, id: 'emp-z' },
      { ...fixture.employers[0]!, id: 'emp-a' },
    ];
    const school = fixture.education[0]!;
    fixture.education = [
      { ...school, id: 'school-b', dates: date },
      { ...school, id: 'school-a', dates: date },
    ];
    expect(getWebsiteTimeline(fixture, 'en').map(({ id }) => id)).toEqual([
      'a-role', 'm-role-2', 'z-role', 'school-a', 'school-b',
    ]);
  });

  it('keeps https publication links only and renders a month date', () => {
    const fixture = base();
    const publication = fixture.publications[0]!;
    fixture.publications = [
      { ...publication, id: 'secure', url: 'https://example.com/p', date: { value: '2024-05', precision: 'month' } },
      { ...publication, id: 'insecure', url: 'http://example.com/p' },
      { ...publication, id: 'none', url: undefined },
    ];
    const [secure, insecure, none] = getWebsitePublications(fixture, 'en');
    expect(secure).toMatchObject({ url: 'https://example.com/p', date: '05/2024' });
    expect('url' in insecure!).toBe(false);
    expect('url' in none!).toBe(false);
  });

  it('prefers featured projects on the home page and returns the first four', () => {
    const fixture = base();
    const project = fixture.projects[0]!;
    fixture.projects = Array.from({ length: 6 }, (_, index) => ({
      ...project,
      id: `project-${index}`,
      featured: index >= 4,
      links: index === 0 ? [{ kind: 'github', label: 'GH', url: 'https://github.com/x' }, { kind: 'website', label: 'W', url: 'https://x.dev' }] : [],
    })) as Career['projects'];
    const home = getWebsiteProjects(fixture, 'en', { home: true });
    expect(home.map(({ id }) => id)).toEqual(['project-4', 'project-5', 'project-0', 'project-1']);
    const all = getWebsiteProjects(fixture, 'en');
    expect(all).toHaveLength(6);
    expect(all[0]).toMatchObject({ githubUrl: 'https://github.com/x', websiteUrl: 'https://x.dev' });
    expect(all[1]!.githubUrl).toBeUndefined();
    expect(getWebsiteSkills(fixture).length).toBeGreaterThan(0);
  });
});
