import type { CvProfile, CvProfileId } from './types';
export { profileIds } from './types';

const profile = (definition: CvProfile): CvProfile => Object.freeze({
  ...definition,
  themeOrder: Object.freeze([...definition.themeOrder]),
  sectionOrder: Object.freeze([...definition.sectionOrder]),
  limits: Object.freeze({ ...definition.limits }),
});

export const cvProfiles: Readonly<Record<CvProfileId, CvProfile>> = Object.freeze({
  generic: profile({
    id: 'generic', headline: 'Senior Embedded/R&D Engineer | Technical Leadership | DevOps',
    summary: 'Senior embedded and R&D engineer building reliable industrial and telecommunications systems, with technical leadership and DevOps experience.',
    themeOrder: ['embedded', 'research', 'leadership', 'devops', 'general'],
    sectionOrder: ['skills', 'experience', 'education', 'projects', 'publications'],
    limits: { highlightsPerRole: 4, projects: 3, publications: 3, skills: 18 },
  }),
  leadership: profile({
    id: 'leadership', headline: 'Technical Lead | Embedded & R&D Engineering',
    summary: 'Technical leader guiding embedded product development, engineering teams, and delivery practices for industrial systems.',
    themeOrder: ['leadership', 'embedded', 'devops', 'research', 'general'],
    sectionOrder: ['skills', 'experience', 'projects', 'education', 'publications'],
    limits: { highlightsPerRole: 4, projects: 3, publications: 2, skills: 16 },
  }),
  'embedded-rd': profile({
    id: 'embedded-rd', headline: 'Senior Embedded Software & R&D Engineer',
    summary: 'Embedded software and R&D engineer specializing in industrial systems, Linux, real-time platforms, networking, and applied research.',
    themeOrder: ['embedded', 'research', 'devops', 'leadership', 'general'],
    sectionOrder: ['skills', 'experience', 'projects', 'publications', 'education'],
    limits: { highlightsPerRole: 4, projects: 4, publications: 4, skills: 20 },
  }),
  devops: profile({
    id: 'devops', headline: 'Senior DevOps & Engineering Enablement Engineer',
    summary: 'Software engineer improving delivery through CI/CD, automation, Linux tooling, testing, and reliable engineering workflows.',
    themeOrder: ['devops', 'leadership', 'embedded', 'research', 'general'],
    sectionOrder: ['skills', 'experience', 'projects', 'education', 'publications'],
    limits: { highlightsPerRole: 4, projects: 4, publications: 2, skills: 18 },
  }),
});
