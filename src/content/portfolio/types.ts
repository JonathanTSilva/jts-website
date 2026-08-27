export type {
  CareerData, CareerDate, CareerDateRange, CareerHighlight, Education, Employer,
  Locale, LocalizedString, Person, Project as CanonicalProject, Publication as CanonicalPublication,
  SkillGroup, WorkPosition,
} from './schema';
export type Theme = import('./schema').CareerHighlight['themes'][number];
import type { LocalizedString, Project as CanonicalProject, Publication as CanonicalPublication } from './schema';

export interface LegacyProjectFields {
  link?: string;
  github?: string;
  icon?: string;                // emoji or single character, e.g. "⚙️"
}

export type Project = CanonicalProject & LegacyProjectFields;
export type ProjectEntry = Project;

export interface LegacyPublicationFields {
  title: LocalizedString;
  publisher: string;
  date: string; // ISO string or human readable
  link?: string;
  type: "article" | "paper" | "book" | "talk" | "conference" | "journal";
}

// TODO(Task 3): replace this compatibility shape with CanonicalPublication in Astro consumers.
export type Publication = Omit<CanonicalPublication, 'date' | 'url' | 'venue'> & LegacyPublicationFields;
export type PublicationEntry = Publication;

export interface ExperienceEntry {
  type: 'work' | 'education';   // required — backfill all work entries
  title: LocalizedString;
  company: string;              // company name for work, institution name for education
  location: LocalizedString;
  startDate: string;            // YYYY-MM
  endDate?: string;             // YYYY-MM or undefined = Present
  description: LocalizedString[];
  tags: string[];
}
