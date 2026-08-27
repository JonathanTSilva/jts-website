import { describe, expect, it } from 'vitest';

import { career } from '../../../src/content/portfolio/career';
import { experience } from '../../../src/content/portfolio/experience';
import { projects } from '../../../src/content/portfolio/projects';
import { publications } from '../../../src/content/portfolio/publications';
import { careerDataSchema } from '../../../src/content/portfolio/schema';

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
    expect(projects.find(project => project.title.en === 'Forgenv')?.github)
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
    expect(publications.find(publication => publication.title.en.startsWith('A Survey'))?.link)
      .toBe('https://ieeexplore.ieee.org/document/10375053');
    expect(career.publications.find(publication => publication.id === 'publication-web-motor-drive-sizing')?.legacyHttpUrl)
      .toBe('http://ocs.ifsp.edu.br/index.php/conict/xconict/paper/view/5795/1289');
  });

  it('derives project compatibility values from their canonical source', () => {
    for (const project of projects) {
      const canonical = career.projects.find(item => item.id === project.id)!;
      expect(project.status).toBe(canonical.status);
      expect(project.featured).toBe(canonical.featured);
      expect(project.image).toBe(canonical.image);
      expect(project.link).toBe(canonical.legacyLinks?.[0]?.url ?? canonical.links.find(link => link.kind === 'website')?.url);
      expect(project.github).toBe(canonical.links.find(link => link.kind === 'github')?.url);
    }
  });

  it('derives publication compatibility values from their canonical source', () => {
    for (const publication of publications) {
      const canonical = career.publications.find(item => item.id === publication.id)!;
      expect(publication.publisher).toBe(canonical.venue);
      expect(publication.date).toBe(canonical.date.value);
      expect(publication.link).toBe(canonical.url ?? canonical.legacyHttpUrl);
    }
  });

  it('provides a derived legacy experience view for current consumers', () => {
    expect(experience.some(entry => entry.type === 'work' && entry.company === 'Datacom')).toBe(true);
    expect(experience.some(entry => entry.type === 'education' && entry.company.includes('USP'))).toBe(true);
  });

  it('preserves every current project and experience tag in the curated skill taxonomy', () => {
    const currentTags = new Set([...projects, ...experience].flatMap(item => item.tags));
    const curatedSkills = new Set(career.skillGroups.flatMap(group => group.skills.map(skill => skill.name)));
    expect([...currentTags].filter(tag => !curatedSkills.has(tag))).toEqual([]);
  });
});
