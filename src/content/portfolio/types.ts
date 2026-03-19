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
  year: number;
}

export interface Publication {
  title: LocalizedString;
  publisher: string;
  date: string; // ISO string or human readable
  link?: string;
  type: "article" | "paper" | "book" | "talk";
}

export interface ExperienceEntry {
  title: LocalizedString;
  company: string;
  location: LocalizedString;
  startDate: string;
  endDate?: string; // empty means Present
  description: LocalizedString[];
  tags: string[];
}
