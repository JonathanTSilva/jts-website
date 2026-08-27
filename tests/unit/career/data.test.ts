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
    expect(projects.find(project => project.title.en === 'Sizer')?.image)
      .toBe('/assets/images/projects/sizer.png');
  });

  it('preserves publication count, titles, and links', () => {
    expect(career.publications).toHaveLength(4);
    expect(publications.find(publication => publication.title.en.startsWith('A Survey'))?.link)
      .toBe('https://ieeexplore.ieee.org/document/10375053');
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
