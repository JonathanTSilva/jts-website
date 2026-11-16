import type { CareerDate, CareerDateRange, Person, WorkPosition } from '../../content/portfolio/schema';

export const profileIds = Object.freeze(['generic', 'leadership', 'embedded-rd', 'devops'] as const);
export type CvProfileId = (typeof profileIds)[number];
export type CareerTheme = WorkPosition['highlights'][number]['themes'][number];
export type CareerLink = Person['links'][number];
export type CvSectionKind = 'skills' | 'experience' | 'projects' | 'education' | 'publications';

export interface CvProfile {
  readonly id: CvProfileId;
  readonly headline: string;
  readonly summary: string;
  readonly themeOrder: readonly CareerTheme[];
  readonly sectionOrder: readonly CvSectionKind[];
  readonly limits: Readonly<{ highlightsPerRole: number; projects: number; publications: number; skills: number }>;
}

export interface ResolvedHighlight { readonly id: string; readonly text: string }
export interface ResolvedExperience {
  readonly id: string; readonly employer: string; readonly title: string; readonly location?: string;
  readonly dates: CareerDateRange; readonly verification: 'verified'; readonly highlights: readonly ResolvedHighlight[];
}
export interface ResolvedProject { readonly id: string; readonly title: string; readonly description: string; readonly role?: string; readonly dates?: CareerDateRange; readonly links: readonly CareerLink[]; readonly highlights: readonly ResolvedHighlight[] }
export interface ResolvedPublication { readonly id: string; readonly title: string; readonly authors: readonly string[]; readonly venue: string; readonly date: CareerDate; readonly type: string; readonly url?: string }
export interface ResolvedEducation { readonly id: string; readonly institution: string; readonly credential: string; readonly location?: string; readonly dates: CareerDateRange; readonly highlights: readonly ResolvedHighlight[] }
export interface ResolvedSkill { readonly id: string; readonly name: string }
export interface ResolvedSkillGroup { readonly id: string; readonly name: string; readonly skills: readonly ResolvedSkill[] }
export type ResolvedSection = Readonly<{ kind: CvSectionKind }>;
export interface ResolvedCv {
  readonly profileId: CvProfileId; readonly fullName: string; readonly headline: string; readonly summary: string;
  readonly location: string; readonly links: readonly CareerLink[]; readonly experience: readonly ResolvedExperience[];
  readonly projects: readonly ResolvedProject[]; readonly publications: readonly ResolvedPublication[];
  readonly education: readonly ResolvedEducation[]; readonly skills: readonly ResolvedSkillGroup[];
  readonly sections: readonly ResolvedSection[];
}
