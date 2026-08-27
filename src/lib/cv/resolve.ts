import type { CareerData, CareerDateRange, CareerHighlight } from '../../content/portfolio/schema';
import type {
  CareerTheme, CvProfile, ResolvedCv, ResolvedHighlight, ResolvedSkillGroup,
} from './types';

const normalizedDate = (range: CareerDateRange | undefined): string => {
  if (!range) return '0000-00';
  if (!range.end) return '9999-12';
  const date = range.end;
  return date.precision === 'year' ? `${date.value}-12` : date.value;
};

const themeRank = (themes: readonly CareerTheme[], profile: CvProfile): number => {
  const ranks = themes.map(theme => profile.themeOrder.indexOf(theme)).filter(rank => rank >= 0);
  return ranks.length ? Math.min(...ranks) : profile.themeOrder.length;
};

const byPriorityThemeDateId = (
  profile: CvProfile,
  left: { readonly priority: number; readonly themes: readonly CareerTheme[]; readonly id: string; readonly dates?: CareerDateRange | undefined },
  right: { readonly priority: number; readonly themes: readonly CareerTheme[]; readonly id: string; readonly dates?: CareerDateRange | undefined },
): number => right.priority - left.priority
  || themeRank(left.themes, profile) - themeRank(right.themes, profile)
  || normalizedDate(right.dates).localeCompare(normalizedDate(left.dates))
  || left.id.localeCompare(right.id);

const selectHighlights = (
  highlights: readonly CareerHighlight[], profile: CvProfile, seen: Set<string>, limit = profile.limits.highlightsPerRole,
): ResolvedHighlight[] => {
  const selected: ResolvedHighlight[] = [];
  for (const highlight of [...highlights].sort((left, right) => themeRank(left.themes, profile) - themeRank(right.themes, profile)
    || right.priority - left.priority || left.id.localeCompare(right.id))) {
    if (selected.length >= limit) break;
    if (seen.has(highlight.id)) continue;
    seen.add(highlight.id);
    selected.push({ id: highlight.id, text: highlight.cvText ?? highlight.webText.en });
  }
  return selected;
};

export const resolveCv = (career: CareerData, profile: CvProfile): ResolvedCv => {
  const employers = new Map(career.employers.map(employer => [employer.id, employer]));
  const seenHighlights = new Set<string>();
  const experience = [...career.positions]
    .filter(position => position.verification === 'verified')
    .sort((left, right) => normalizedDate(right.dates).localeCompare(normalizedDate(left.dates)) || left.id.localeCompare(right.id))
    .map(position => {
      const employer = employers.get(position.employerId);
      if (!employer) throw new Error(`Unknown employer: ${position.employerId}`);
      return {
        id: position.id, employer: employer.name, title: position.title.en,
        ...(position.location?.en ? { location: position.location.en } : {}), dates: structuredClone(position.dates),
        verification: 'verified' as const, highlights: selectHighlights(position.highlights, profile, seenHighlights),
      };
    });

  const projects = [...career.projects]
    .sort((left, right) => byPriorityThemeDateId(profile, left, right))
    .slice(0, profile.limits.projects)
    .map(project => ({
      id: project.id, title: project.title.en, description: project.description.en,
      ...(project.role?.en ? { role: project.role.en } : {}), ...(project.dates ? { dates: structuredClone(project.dates) } : {}),
      links: project.links.map(link => ({ ...link })), highlights: selectHighlights(project.highlights, profile, seenHighlights),
    }));

  const publications = [...career.publications]
    .sort((left, right) => byPriorityThemeDateId(
      profile,
      { ...left, dates: { start: left.date, end: left.date } },
      { ...right, dates: { start: right.date, end: right.date } },
    ))
    .slice(0, profile.limits.publications)
    .map(publication => ({
      id: publication.id, title: publication.title.en, authors: [...publication.authors], venue: publication.venue,
      date: { ...publication.date }, type: publication.type, ...(publication.url ? { url: publication.url } : {}),
    }));

  const education = [...career.education]
    .sort((left, right) => normalizedDate(right.dates).localeCompare(normalizedDate(left.dates)) || left.id.localeCompare(right.id))
    .map(item => ({
      id: item.id, institution: item.institution, credential: item.credential.en,
      ...(item.location?.en ? { location: item.location.en } : {}), dates: structuredClone(item.dates),
      highlights: selectHighlights(item.highlights, profile, seenHighlights),
    }));

  const selectedSkills = career.skillGroups.flatMap(group => group.skills.map(skill => ({ group, skill })))
    .sort((left, right) => right.skill.priority - left.skill.priority
      || themeRank(left.skill.themes, profile) - themeRank(right.skill.themes, profile)
      || right.group.priority - left.group.priority || left.skill.id.localeCompare(right.skill.id))
    .slice(0, profile.limits.skills);
  const selectedIds = new Set(selectedSkills.map(({ skill }) => skill.id));
  const selectedGroupRank = (group: CareerData['skillGroups'][number]): number => {
    const ranks = group.skills.filter(skill => selectedIds.has(skill.id)).map(skill => themeRank(skill.themes, profile));
    return ranks.length ? Math.min(...ranks) : profile.themeOrder.length + 1;
  };
  const skills: ResolvedSkillGroup[] = [...career.skillGroups]
    .sort((left, right) => {
      return selectedGroupRank(left) - selectedGroupRank(right) || right.priority - left.priority || left.id.localeCompare(right.id);
    })
    .map(group => ({
      id: group.id, name: group.name.en,
      skills: [...group.skills].filter(skill => selectedIds.has(skill.id))
        .sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id))
        .map(skill => ({ id: skill.id, name: skill.name })),
    }))
    .filter(group => group.skills.length > 0);

  return {
    profileId: profile.id, fullName: career.person.fullName, headline: profile.headline, summary: profile.summary,
    location: career.person.location.en, links: career.person.links.map(link => ({ ...link })),
    experience, projects, publications, education, skills,
    sections: profile.sectionOrder.map(kind => ({ kind })),
  };
};
