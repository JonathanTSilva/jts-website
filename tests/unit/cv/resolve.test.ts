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
  it('sorts ongoing work and education ahead of newer completed entries', () => {
    const input = fixture();
    input.positions[0]!.dates = { start: { value: '2020', precision: 'year' } };
    input.positions[1]!.dates = {
      start: { value: '2024', precision: 'year' },
      end: { value: '2025', precision: 'year' },
    };
    input.education.push(
      {
        id: 'education-current', institution: 'Current University', credential: { en: 'Current degree', 'pt-br': 'Curso atual' },
        dates: { start: { value: '2010', precision: 'year' } }, highlights: [], tags: [],
      },
      {
        id: 'education-completed', institution: 'Completed University', credential: { en: 'Completed degree', 'pt-br': 'Curso concluído' },
        dates: { start: { value: '2024', precision: 'year' }, end: { value: '2025', precision: 'year' } }, highlights: [], tags: [],
      },
    );

    const view = resolveCv(input, cvProfiles.generic);

    expect(view.experience.map(role => role.id)).toEqual(['older', 'newer']);
    expect(view.education.map(item => item.id)).toEqual(['education-current', 'education-completed']);
  });

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

  it('keeps every profile concise, differentiated, and rich in approved ATS terminology', () => {
    const views = Object.values(cvProfiles).map(profile => resolveCv(career, profile));
    expect(new Set(views.map(view => view.headline)).size).toBe(4);
    expect(new Set(views.map(view => view.summary)).size).toBe(4);
    for (const view of views) {
      expect(view.summary.length).toBeLessThanOrEqual(220);
      expect(view.experience.flatMap(role => role.highlights).every(item => item.text.length <= 240)).toBe(true);
    }
    expect(`${views[0]!.headline} ${views[0]!.summary}`).toMatch(/Embedded.*R&D.*leadership.*DevOps/i);
    const requiredTerms: Record<string, string[]> = {
      generic: ['Embedded Linux', 'RTOS', 'technical leadership', 'CI/CD', 'industrial automation', 'telecommunications'],
      leadership: ['team', 'embedded', 'CI/CD', 'industrial systems'],
      'embedded-rd': ['C/C++', 'Python', 'Embedded Linux', 'RTOS', 'cybersecurity', 'OPC UA'],
      devops: ['CI/CD', 'automation', 'Linux', 'testing', 'Git'],
    };
    for (const view of views) {
      const corpus = JSON.stringify(view).toLowerCase();
      for (const term of requiredTerms[view.profileId]!) expect(corpus).toContain(term.toLowerCase());
    }
  });

  it('resolves the exact verified canonical chronology and approved English fallback text', () => {
    const view = resolveCv(career, cvProfiles.generic);
    expect(view.experience.map(role => role.id)).toEqual([
      'act-digital-senior-embedded-software-engineer',
      'datacom-embedded-software-engineer',
      'nova-smar-rd-engineer',
    ]);
    expect(view.experience[0]!.highlights.map(highlight => highlight.id)).toEqual([
      'act-mission-critical-embedded-software', 'act-schneider-strategic-partnership',
      'act-industrial-protocols', 'act-real-time-latency',
    ]);
    expect(view.experience[0]!.highlights[0]!.text).toBe(
      'Develop and customize mission-critical software for Embedded Linux and RTOS platforms used in industrial switches and PLCs.',
    );
    const ids = view.experience.flatMap(role => role.highlights.map(highlight => highlight.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(view.sections.map(section => section.kind)).toEqual(['skills', 'experience', 'education', 'projects', 'publications']);
  });

  it('selects exact canonical projects and publications for materially different limits', () => {
    const generic = resolveCv(career, cvProfiles.generic);
    const embedded = resolveCv(career, cvProfiles['embedded-rd']);
    const devops = resolveCv(career, cvProfiles.devops);
    expect(generic.projects.map(project => project.id)).toEqual(['project-uanalyzer', 'project-forgenv', 'project-leetsheet']);
    expect(embedded.projects.map(project => project.id)).toEqual(['project-uanalyzer', 'project-forgenv', 'project-leetsheet', 'project-cloudcavitation']);
    expect(devops.projects.map(project => project.id)).toEqual(['project-uanalyzer', 'project-forgenv', 'project-leetsheet', 'project-qemulab']);
    expect(generic.publications.map(publication => publication.id)).toEqual([
      'publication-opc-ua-survey', 'publication-industrial-automation-cybersecurity', 'publication-pump-fault-diagnosis',
    ]);
    expect(embedded.publications.map(publication => publication.id)).toEqual([
      'publication-opc-ua-survey', 'publication-industrial-automation-cybersecurity',
      'publication-pump-fault-diagnosis', 'publication-web-motor-drive-sizing',
    ]);
  });

  it('materially differentiates canonical leadership, embedded, and DevOps emphasis', () => {
    const leadership = resolveCv(career, cvProfiles.leadership);
    const embedded = resolveCv(career, cvProfiles['embedded-rd']);
    const devops = resolveCv(career, cvProfiles.devops);
    const novaHighlights = (view: ReturnType<typeof resolveCv>) => view.experience.find(role => role.id === 'nova-smar-rd-engineer')!.highlights.map(item => item.id);
    expect(novaHighlights(leadership)).toEqual([
      'nova-product-development-leadership', 'nova-git-cicd-modernization',
      'nova-cybersecurity-compliance', 'nova-industrial-software',
    ]);
    expect(novaHighlights(embedded)).toEqual([
      'nova-product-development-leadership', 'nova-cybersecurity-compliance',
      'nova-industrial-software', 'nova-ml-automation-tools',
    ]);
    expect(novaHighlights(devops)).toEqual([
      'nova-git-cicd-modernization', 'nova-ml-automation-tools',
      'nova-product-development-leadership', 'nova-cybersecurity-compliance',
    ]);
    const skills = (view: ReturnType<typeof resolveCv>) => view.skills.flatMap(group => group.skills.map(skill => skill.id));
    expect(skills(leadership)).toEqual([
      'skill-technical-leadership', 'skill-leadership',
      'skill-embedded-linux', 'skill-embedded-systems', 'skill-linux', 'skill-yocto-project',
      'skill-c-cpp', 'skill-python',
      'skill-networking', 'skill-opc-ua', 'skill-dlr', 'skill-ethernet-ip',
      'skill-industrial-automation', 'skill-cybersecurity',
      'skill-git-cicd', 'skill-devops',
    ]);
    expect(skills(embedded)).toEqual([
      'skill-embedded-linux', 'skill-embedded-systems', 'skill-linux', 'skill-yocto-project',
      'skill-c-cpp', 'skill-python',
      'skill-networking', 'skill-opc-ua', 'skill-dlr', 'skill-ethernet-ip', 'skill-l2-protocols', 'skill-l3-protocols',
      'skill-industrial-automation', 'skill-cybersecurity', 'skill-iot', 'skill-machine-learning',
      'skill-git-cicd', 'skill-devops',
      'skill-technical-leadership', 'skill-leadership',
    ]);
    expect(skills(devops)).toEqual([
      'skill-c-cpp', 'skill-python',
      'skill-git-cicd', 'skill-devops', 'skill-tdd',
      'skill-technical-leadership', 'skill-leadership',
      'skill-embedded-linux', 'skill-embedded-systems', 'skill-linux', 'skill-yocto-project',
      'skill-networking', 'skill-opc-ua', 'skill-dlr', 'skill-ethernet-ip', 'skill-l2-protocols',
      'skill-industrial-automation', 'skill-cybersecurity',
    ]);
    expect(leadership.sections.map(section => section.kind)).toEqual(cvProfiles.leadership.sectionOrder);
    expect(embedded.sections.map(section => section.kind)).toEqual(cvProfiles['embedded-rd'].sectionOrder);
    expect(devops.sections.map(section => section.kind)).toEqual(cvProfiles.devops.sectionOrder);
  });
});
