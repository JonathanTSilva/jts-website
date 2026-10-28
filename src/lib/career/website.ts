import type { CareerData, Locale } from '../../content/portfolio/schema';

export interface WebsiteTimelineItem { readonly id: string; readonly kind: 'work' | 'education'; readonly title: string; readonly organization: string; readonly location: string; readonly startDate: string; readonly endDate: string; readonly highlights: readonly string[]; readonly tags: readonly string[]; }
export interface WebsiteSkill { readonly id: string; readonly name: string; readonly priority: number; }
export interface WebsiteSkillGroup { readonly id: string; readonly name: string; readonly priority: number; readonly skills: readonly WebsiteSkill[]; }
export interface WebsiteProject { readonly id: string; readonly title: string; readonly description: string; readonly tags: readonly string[]; readonly featured: boolean; readonly status?: string | undefined; readonly image?: string | undefined; readonly year?: number | undefined; readonly githubUrl?: string | undefined; readonly websiteUrl?: string | undefined; }
export interface WebsitePublication { readonly id: string; readonly title: string; readonly venue: string; readonly date: string; readonly type: string; readonly url?: string; }

const formatDate = (value: string) => value.length === 7 ? `${value.slice(5)}/${value.slice(0, 4)}` : value;

export function getWebsiteTimeline(career: CareerData, locale: Locale): readonly WebsiteTimelineItem[] {
  const employers = new Map(career.employers.map(employer => [employer.id, employer]));
  const work = career.positions.filter(position => position.verification === 'verified').map(position => ({
    id: position.id, kind: 'work' as const, employerId: position.employerId, sortDate: position.dates.start.value,
    title: position.title[locale], organization: employers.get(position.employerId)?.name ?? '',
    location: position.location?.[locale] ?? employers.get(position.employerId)?.location?.[locale] ?? '',
    startDate: formatDate(position.dates.start.value), endDate: position.dates.end ? formatDate(position.dates.end.value) : locale === 'en' ? 'Present' : 'Atual',
    highlights: position.highlights.map(item => item.webText[locale]), tags: [...position.tags],
  }));
  const education = career.education.map(item => ({
    id: item.id, kind: 'education' as const, employerId: item.institution, sortDate: item.dates.start.value,
    title: item.credential[locale], organization: item.institution, location: item.location?.[locale] ?? '',
    startDate: formatDate(item.dates.start.value), endDate: item.dates.end ? formatDate(item.dates.end.value) : locale === 'en' ? 'Present' : 'Atual',
    highlights: item.highlights.map(highlight => highlight.webText[locale]), tags: [...item.tags],
  }));
  type SortableTimelineItem = (typeof work)[number] | (typeof education)[number];
  const workByEmployer = Map.groupBy(work, item => item.employerId);
  const blocks: { id: string; kindPriority: number; newestStart: string; items: SortableTimelineItem[] }[] = [
    ...[...workByEmployer.entries()].map(([employerId, items]) => ({
      id: employerId,
      kindPriority: 0,
      newestStart: items.reduce((latest, item) => item.sortDate > latest ? item.sortDate : latest, ''),
      items: items.sort((a, b) => b.sortDate.localeCompare(a.sortDate) || a.id.localeCompare(b.id)),
    })),
    ...education.map(item => ({ id: item.id, kindPriority: 1, newestStart: item.sortDate, items: [item] })),
  ];
  // Blocks sort by their newest role; stable kind/ID ties keep output deterministic.
  return blocks
    .sort((a, b) => b.newestStart.localeCompare(a.newestStart) || a.kindPriority - b.kindPriority || a.id.localeCompare(b.id))
    .flatMap(block => block.items)
    .map(({ sortDate: _, employerId: __, ...item }) => item);
}

export function getWebsiteSkills(career: CareerData, locale: Locale = 'en'): readonly WebsiteSkillGroup[] {
  return career.skillGroups.map(group => ({ id: group.id, name: group.name[locale], priority: group.priority, skills: group.skills.map(skill => ({ id: skill.id, name: skill.name, priority: skill.priority })).sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id)) })).sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
}

export function getWebsiteProjects(career: CareerData, locale: Locale, options: { home?: boolean } = {}): readonly WebsiteProject[] {
  const views = career.projects.map(project => ({ id: project.id, title: project.title[locale], description: project.description[locale], tags: [...project.tags], featured: project.featured === true, status: project.status, image: project.image, year: project.year, githubUrl: project.links.find(link => link.kind === 'github')?.url, websiteUrl: project.links.find(link => link.kind === 'website')?.url }));
  return options.home ? [...views.filter(project => project.featured), ...views.filter(project => !project.featured)].slice(0, 4) : views;
}

export function getWebsitePublications(career: CareerData, locale: Locale): readonly WebsitePublication[] {
  return career.publications.map(publication => ({ id: publication.id, title: publication.title[locale], venue: publication.venue, date: formatDate(publication.date.value), type: publication.type, ...(publication.url?.startsWith('https://') ? { url: publication.url } : {}) }));
}
