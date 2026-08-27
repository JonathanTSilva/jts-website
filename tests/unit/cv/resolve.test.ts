import { describe, expect, it } from 'vitest';
import { career } from '../../../src/content/portfolio/career';
import { careerDataSchema, type CareerData } from '../../../src/content/portfolio/schema';
import { cvProfiles } from '../../../src/lib/cv/profiles';
import { resolveCv } from '../../../src/lib/cv/resolve';

const fixture = (): CareerData => careerDataSchema.parse({
  person: { id: 'person', fullName: 'Test Person', location: { en: 'Somewhere', 'pt-br': 'Algum lugar' }, headline: { en: 'Engineer', 'pt-br': 'Engenheiro' }, summary: { en: 'Summary', 'pt-br': 'Resumo' }, links: [{ kind: 'website', label: 'example.com', url: 'https://example.com' }] },
  employers: [{ id: 'employer', name: 'Employer' }],
  positions: [
    { id: 'older', employerId: 'employer', title: { en: 'Older', 'pt-br': 'Antigo' }, dates: { start: { value: '2020', precision: 'year' }, end: { value: '2021', precision: 'year' } }, verification: 'verified', tags: [], highlights: [
      { id: 'fallback', webText: { en: 'English fallback.', 'pt-br': 'Fallback.' }, themes: ['embedded'], priority: 90 },
    ] },
    { id: 'newer', employerId: 'employer', title: { en: 'Newer', 'pt-br': 'Novo' }, dates: { start: { value: '2024-01', precision: 'month' } }, verification: 'verified', tags: [], highlights: [
      { id: 'lead', webText: { en: 'Website leadership.', 'pt-br': 'Liderança.' }, cvText: 'CV leadership.', themes: ['leadership'], priority: 100 },
      { id: 'embedded', webText: { en: 'Embedded work.', 'pt-br': 'Embarcados.' }, themes: ['embedded'], priority: 70 },
      { id: 'shared', webText: { en: 'Selected once.', 'pt-br': 'Selecionado.' }, themes: ['embedded'], priority: 99 },
    ] },
    { id: 'pending', employerId: 'employer', title: { en: 'Pending', 'pt-br': 'Pendente' }, dates: { start: { value: '2025', precision: 'year' } }, verification: 'pending', tags: [], highlights: [] },
  ],
  education: [],
  projects: [
    { id: 'project-low', title: { en: 'Low', 'pt-br': 'Baixo' }, description: { en: 'Low.', 'pt-br': 'Baixo.' }, links: [], highlights: [], tags: [], themes: ['embedded'], priority: 1 },
    { id: 'project-high', title: { en: 'High', 'pt-br': 'Alto' }, description: { en: 'High.', 'pt-br': 'Alto.' }, links: [], highlights: [], tags: [], themes: ['embedded'], priority: 99 },
  ],
  publications: [],
  skillGroups: [{ id: 'group', name: { en: 'Skills', 'pt-br': 'Habilidades' }, priority: 50, skills: [
    { id: 'skill-low', name: 'Low', themes: ['embedded'], priority: 1 },
    { id: 'skill-high', name: 'High', themes: ['embedded'], priority: 99 },
    { id: 'skill-lead', name: 'Lead', themes: ['leadership'], priority: 100 },
  ] }],
});

describe('resolveCv', () => {
  it('resolves verified facts in deterministic chronology with theme-aware, deduplicated highlights', () => {
    const input = fixture();
    input.positions[0]!.highlights.push({ id: 'shared', webText: { en: 'Duplicate.', 'pt-br': 'Duplicado.' }, themes: ['embedded'], priority: 100 });
    const profile = { ...cvProfiles['embedded-rd'], limits: { ...cvProfiles['embedded-rd'].limits, highlightsPerRole: 2 } };
    const view = resolveCv(input, profile);
    expect(view.profileId).toBe('embedded-rd');
    expect(view.experience.map(role => role.id)).toEqual(['newer', 'older']);
    expect(view.experience.flatMap(role => role.highlights.map(item => item.id))).toEqual(['shared', 'embedded', 'fallback']);
    expect(view.experience[1]!.highlights[0]!.text).toBe('English fallback.');
    expect(view.experience.some(role => role.id === 'pending')).toBe(false);
    expect(view.sections.map(section => section.kind)).toEqual(profile.sectionOrder);
  });

  it('uses hard limits and excludes lower-priority projects and skills', () => {
    const profile = { ...cvProfiles['embedded-rd'], limits: { ...cvProfiles['embedded-rd'].limits, projects: 1, skills: 2 } };
    const view = resolveCv(fixture(), profile);
    expect(view.projects.map(item => item.id)).toEqual(['project-high']);
    expect(view.skills.flatMap(group => group.skills.map(skill => skill.id))).toEqual(['skill-lead', 'skill-high']);
  });

  it('is repeatable and never mutates canonical or profile inputs', () => {
    const input = fixture();
    const before = structuredClone(input);
    const profileBefore = structuredClone(cvProfiles.devops);
    const first = resolveCv(input, cvProfiles.devops);
    expect(resolveCv(input, cvProfiles.devops)).toEqual(first);
    expect(input).toEqual(before);
    expect(cvProfiles.devops).toEqual(profileBefore);
  });

  it('integrates with the canonical dataset without pending roles or presentation markup', () => {
    const view = resolveCv(career, cvProfiles.generic);
    expect(view.experience.length).toBeGreaterThan(0);
    expect(view.experience.every(role => role.verification === 'verified')).toBe(true);
    expect(JSON.stringify(view)).not.toMatch(/<\/?[a-z][^>]*>/i);
  });
});
