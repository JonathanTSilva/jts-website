export interface LocalizedString {
  en: string;
  "pt-br": string;
}

export interface Project {
  title: LocalizedString;
  description: LocalizedString;
  tags: string[];
  link?: string;
  github?: string;
  role?: LocalizedString;
  year?: number;
  featured?: boolean;           // spans 2 columns in bento grid
  icon?: string;                // emoji or single character, e.g. "⚙️"
  status?: 'Active' | 'Archived' | 'Featured' | 'Private' | 'In Progress'; // for filtering and display purposes
  image?: string;
}

export type ProjectEntry = Project;

export interface Publication {
  title: LocalizedString;
  publisher: string;
  date: string; // ISO string or human readable
  link?: string;
  type: "article" | "paper" | "book" | "talk" | "conference" | "journal";
}

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
