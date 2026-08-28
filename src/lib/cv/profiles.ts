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
    summary: 'Senior embedded software and R&D engineer delivering industrial automation and telecommunications systems with Embedded Linux, RTOS, networking, technical leadership, and CI/CD experience.',
    themeOrder: ['embedded', 'research', 'leadership', 'devops', 'general'],
    sectionOrder: ['skills', 'experience', 'education', 'projects', 'publications'],
    limits: { highlightsPerRole: 4, projects: 3, publications: 3, skills: 18 },
  }),
  leadership: profile({
    id: 'leadership', headline: 'Technical Lead | Embedded & R&D Engineering',
    summary: 'Technical leader coordinating embedded product development and engineering teams, with hands-on experience in industrial systems, Git migrations, CI/CD, and applied R&D.',
    themeOrder: ['leadership', 'embedded', 'devops', 'research', 'general'],
    sectionOrder: ['skills', 'experience', 'projects', 'education', 'publications'],
    limits: { highlightsPerRole: 4, projects: 3, publications: 2, skills: 16 },
  }),
  'embedded-rd': profile({
    id: 'embedded-rd', headline: 'Senior Embedded Software & R&D Engineer',
    summary: 'Embedded software and R&D engineer specializing in C/C++, Python, Embedded Linux, RTOS, industrial and telecommunications protocols, cybersecurity, and applied research.',
    themeOrder: ['embedded', 'research', 'devops', 'leadership', 'general'],
    sectionOrder: ['skills', 'experience', 'projects', 'publications', 'education'],
    limits: { highlightsPerRole: 4, projects: 4, publications: 4, skills: 20 },
  }),
  devops: profile({
    id: 'devops', headline: 'Senior DevOps & Engineering Enablement Engineer',
    summary: 'Software engineer improving embedded and R&D delivery through CI/CD, automation, Linux tooling, unit and integration testing, and reliable engineering workflows.',
    themeOrder: ['devops', 'leadership', 'embedded', 'research', 'general'],
    sectionOrder: ['skills', 'experience', 'projects', 'education', 'publications'],
    limits: { highlightsPerRole: 4, projects: 4, publications: 2, skills: 18 },
  }),
});
