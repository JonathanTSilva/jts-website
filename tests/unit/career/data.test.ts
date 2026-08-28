import { describe, expect, it } from 'vitest';

import { career } from '../../../src/content/portfolio/career';
import { careerDataSchema } from '../../../src/content/portfolio/schema';
import { getWebsiteProjects, getWebsitePublications, getWebsiteTimeline } from '../../../src/lib/career/website';

describe('canonical career data', () => {
  it('preserves the public identity and contact endpoints', () => {
    expect(career.person.fullName).toBe('Jonathan Tobias da Silva');
    expect(career.person.links.map(link => link.kind)).toEqual(expect.arrayContaining([
      'email', 'website', 'linkedin', 'github', 'orcid',
    ]));
  });

  it('represents Nova Smar as the one owner-approved flattened role', () => {
    const novaSmar = career.positions.filter(position => position.employerId === 'nova-smar');
    expect(novaSmar.map(position => ({
      id: position.id, title: position.title.en, start: position.dates.start.value,
      end: position.dates.end?.value, verification: position.verification,
    }))).toEqual([
      { id: 'nova-smar-rd-engineer', title: 'R&D Engineer', start: '2021-01', end: '2024-09', verification: 'verified' },
    ]);
    expect(career.positions.map(position => position.id).join(' ')).not.toMatch(/analyst|assistant|intern/);
    expect(getWebsiteTimeline(career, 'en').filter(entry => entry.kind === 'work' && entry.organization === 'Nova Smar')).toHaveLength(1);
  });

  it('uses exact approved employment facts and customer allocation relationship', () => {
    const act = career.positions.find(position => position.id === 'act-digital-senior-embedded-software-engineer')!;
    const datacom = career.positions.find(position => position.id === 'datacom-embedded-software-engineer')!;
    expect(career.employers.find(employer => employer.id === act.employerId)?.name).toBe('Act Digital');
    expect(act.highlights.find(highlight => highlight.id === 'act-schneider-strategic-partnership')?.webText.en)
      .toMatch(/Schneider Electric.*customer.*allocated.*Innovation and Technology.*Network Service Platform/i);
    expect(datacom).toMatchObject({
      title: { en: 'Embedded Software Engineer' },
      dates: { start: { value: '2024-09' }, end: { value: '2026-02' } },
    });
  });

  it('uses globally unique IDs for all top-level and nested entities', () => {
    const ids = [
      career.person.id,
      ...career.employers.map(item => item.id),
      ...career.positions.flatMap(item => [item.id, ...item.highlights.map(highlight => highlight.id)]),
      ...career.education.flatMap(item => [item.id, ...item.highlights.map(highlight => highlight.id)]),
      ...career.projects.flatMap(item => [item.id, ...item.highlights.map(highlight => highlight.id)]),
      ...career.publications.map(item => item.id),
      ...career.skillGroups.flatMap(group => [group.id, ...group.skills.map(skill => skill.id)]),
    ];
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('parses the canonical aggregate', () => {
    expect(careerDataSchema.parse(career)).toEqual(career);
  });

  it('preserves project count and important links and facts', () => {
    expect(career.projects).toHaveLength(13);
    expect(career.projects.find(project => project.title.en === 'Forgenv')?.links.find(link => link.kind === 'github')?.url)
      .toBe('https://github.com/JonathanTSilva/forgenv');
    const sizer = career.projects.find(project => project.title.en === 'Sizer');
    expect(sizer).toMatchObject({ image: '/assets/images/projects/sizer.png', status: 'Archived' });
    expect(sizer?.legacyLinks).toBeUndefined();
    expect(career.projects.find(project => project.title.en === 'Forgenv')).toMatchObject({
      featured: true, status: 'In Progress',
    });
  });

  it('preserves publication count, titles, and links', () => {
    expect(career.publications).toHaveLength(4);
    expect(career.publications.find(publication => publication.title.en.startsWith('A Survey'))?.url)
      .toBe('https://ieeexplore.ieee.org/document/10375053');
    expect(career.publications.find(publication => publication.id === 'publication-industrial-automation-cybersecurity')?.title.en)
      .toBe('Strengthening Industrial Automation: Best Practices in Cybersecurity');
    expect(career.publications.find(publication => publication.id === 'publication-web-motor-drive-sizing')).toMatchObject({
      date: { value: '2020', precision: 'year' },
    });
  });

  it('preserves every current project and experience tag in the curated skill taxonomy', () => {
    const currentTags = new Set([...career.projects, ...career.positions, ...career.education].flatMap(item => item.tags));
    const curatedSkills = new Set(career.skillGroups.flatMap(group => group.skills.map(skill => skill.name)));
    expect([...currentTags].filter(tag => !curatedSkills.has(tag))).toEqual([]);
  });

  it('does not expose historical HTTP references as compatibility links', () => {
    expect(getWebsiteProjects(career, 'en').find(project => project.id === 'project-sizer')?.websiteUrl).toBeUndefined();
    expect(career.projects.find(project => project.id === 'project-sizer')?.legacyLinks).toBeUndefined();
    expect(getWebsitePublications(career, 'en').find(publication => publication.id === 'publication-web-motor-drive-sizing')?.url).toBeUndefined();
    expect(career.publications.find(publication => publication.id === 'publication-web-motor-drive-sizing')?.legacyHttpUrl).toBeUndefined();
  });

  it('uses the exact stable skill group order', () => {
    expect(career.skillGroups.map(group => group.id)).toEqual([
      'languages', 'embedded-platforms', 'networking-protocols', 'devops-tooling', 'leadership', 'research',
    ]);
  });

});
