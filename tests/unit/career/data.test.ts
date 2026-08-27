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

  it('represents the Nova Smar progression as distinct positions', () => {
    const novaSmar = career.positions.filter(position => position.employerId === 'nova-smar');
    expect(novaSmar.length).toBeGreaterThan(1);
    expect(new Set(novaSmar.map(position => position.id)).size).toBe(novaSmar.length);
  });

  it('keeps the website-primary Nova role verified and PDF split roles pending', () => {
    const novaPositions = career.positions.filter(position => position.employerId === 'nova-smar');
    expect(novaPositions.map(position => ({
      id: position.id, title: position.title.en, start: position.dates.start.value,
      end: position.dates.end?.value, verification: position.verification,
    }))).toEqual([
      { id: 'nova-smar-rd-engineer', title: 'R&D Engineer', start: '2021-01', end: '2024-09', verification: 'verified' },
      { id: 'nova-smar-rd-electronic-intelligence-analyst', title: 'R&D Electronic Intelligence Analyst', start: '2023', end: '2024', verification: 'pending' },
      { id: 'nova-smar-rd-electronic-intelligence-assistant', title: 'R&D Electronic Intelligence Assistant', start: '2022', end: '2023', verification: 'pending' },
      { id: 'nova-smar-rd-intern', title: 'R&D Intern', start: '2021', end: '2021', verification: 'pending' },
    ]);
    expect(getWebsiteTimeline(career, 'en').filter(entry => entry.kind === 'work' && entry.organization === 'Nova Smar')).toHaveLength(1);
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
    expect(sizer?.legacyLinks).toEqual([{
      label: 'Historical live site', url: 'http://sizer.ti.srt.ifsp.edu.br/',
    }]);
    expect(career.projects.find(project => project.title.en === 'Forgenv')).toMatchObject({
      featured: true, status: 'In Progress',
    });
  });

  it('preserves publication count, titles, and links', () => {
    expect(career.publications).toHaveLength(4);
    expect(career.publications.find(publication => publication.title.en.startsWith('A Survey'))?.url)
      .toBe('https://ieeexplore.ieee.org/document/10375053');
    expect(career.publications.find(publication => publication.id === 'publication-web-motor-drive-sizing')?.legacyHttpUrl)
      .toBe('http://ocs.ifsp.edu.br/index.php/conict/xconict/paper/view/5795/1289');
  });

  it('preserves every current project and experience tag in the curated skill taxonomy', () => {
    const currentTags = new Set([...career.projects, ...career.positions, ...career.education].flatMap(item => item.tags));
    const curatedSkills = new Set(career.skillGroups.flatMap(group => group.skills.map(skill => skill.name)));
    expect([...currentTags].filter(tag => !curatedSkills.has(tag))).toEqual([]);
  });

  it('does not expose historical HTTP references as compatibility links', () => {
    expect(getWebsiteProjects(career, 'en').find(project => project.id === 'project-sizer')?.websiteUrl).toBeUndefined();
    expect(career.projects.find(project => project.id === 'project-sizer')?.legacyLinks?.[0]?.url)
      .toBe('http://sizer.ti.srt.ifsp.edu.br/');
    expect(getWebsitePublications(career, 'en').find(publication => publication.id === 'publication-web-motor-drive-sizing')?.url).toBeUndefined();
    expect(career.publications.find(publication => publication.id === 'publication-web-motor-drive-sizing')?.legacyHttpUrl)
      .toBe('http://ocs.ifsp.edu.br/index.php/conict/xconict/paper/view/5795/1289');
  });

  it('uses the exact stable skill group order', () => {
    expect(career.skillGroups.map(group => group.id)).toEqual([
      'languages', 'embedded-platforms', 'networking-protocols', 'devops-tooling', 'leadership', 'research',
    ]);
  });

});
