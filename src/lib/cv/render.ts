import type { CareerDate, CareerDateRange } from '../../content/portfolio/schema';
import type {
  CareerLink, CvSectionKind, ResolvedCv, ResolvedEducation, ResolvedExperience,
  ResolvedProject, ResolvedPublication, ResolvedSkillGroup,
} from './types';
import { cvPrintStyles } from './print-styles';

export const standardSectionHeading: Readonly<Record<CvSectionKind, string>> = Object.freeze({
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
  publications: 'Publications',
});

const escapeHtml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const safeHref = (value: string): string | undefined => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === 'https:' || protocol === 'mailto:' ? value : undefined;
  } catch {
    return undefined;
  }
};

const renderLink = (link: CareerLink): string => {
  const label = escapeHtml(link.label);
  const href = safeHref(link.url);
  return href ? `<a href="${escapeHtml(href)}">${label}</a>` : `<span>${label}</span>`;
};

const monthNames = Object.freeze([
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]);
const formatDate = (date: CareerDate): string => date.precision === 'year'
  ? date.value
  : `${monthNames[Number(date.value.slice(5, 7)) - 1]} ${date.value.slice(0, 4)}`;
const formatRange = (range: CareerDateRange): string =>
  `${formatDate(range.start)} – ${range.end ? formatDate(range.end) : 'Present'}`;
const list = (items: readonly string[]): string => items.length ? `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>` : '';

const renderExperience = (items: readonly ResolvedExperience[]): string => items.map(item => `
<article class="role">
  <div class="role-heading"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.employer)}</p></div>
  <p class="meta">${escapeHtml(formatRange(item.dates))}${item.location ? ` | ${escapeHtml(item.location)}` : ''}</p>
  ${list(item.highlights.map(highlight => escapeHtml(highlight.text)))}
</article>`).join('');

const renderProjects = (items: readonly ResolvedProject[]): string => items.map(item => `
<article class="role">
  <div class="role-heading"><h3>${escapeHtml(item.title)}</h3>${item.role ? `<p>${escapeHtml(item.role)}</p>` : ''}</div>
  ${item.dates ? `<p class="meta">${escapeHtml(formatRange(item.dates))}</p>` : ''}
  <p>${escapeHtml(item.description)}</p>
  ${item.links.length ? `<p>${item.links.map(renderLink).join(' | ')}</p>` : ''}
  ${list(item.highlights.map(highlight => escapeHtml(highlight.text)))}
</article>`).join('');

const renderEducation = (items: readonly ResolvedEducation[]): string => items.map(item => `
<article class="education-item role">
  <h3>${escapeHtml(item.credential)}</h3>
  <p>${escapeHtml(item.institution)} | ${escapeHtml(formatRange(item.dates))}${item.location ? ` | ${escapeHtml(item.location)}` : ''}</p>
  ${list(item.highlights.map(highlight => escapeHtml(highlight.text)))}
</article>`).join('');

const renderPublications = (items: readonly ResolvedPublication[]): string => list(items.map(item => {
  const citation = `${item.authors.join(', ')}. ${item.title}. ${item.venue}, ${formatDate(item.date)}. ${item.type}.`;
  const href = item.url && safeHref(item.url);
  return href ? `<a href="${escapeHtml(href)}">${escapeHtml(citation)}</a>` : escapeHtml(citation);
}));

const renderSkills = (groups: readonly ResolvedSkillGroup[]): string => groups.map(group => `
<div class="skill-group"><h3>${escapeHtml(group.name)}</h3><ul class="skill-list">${group.skills.map(skill => `<li>${escapeHtml(skill.name)}</li>`).join('')}</ul></div>`).join('');

const sectionContent = (view: ResolvedCv, kind: CvSectionKind): string => {
  if (kind === 'skills') return renderSkills(view.skills);
  if (kind === 'experience') return renderExperience(view.experience);
  if (kind === 'projects') return renderProjects(view.projects);
  if (kind === 'education') return renderEducation(view.education);
  return renderPublications(view.publications);
};

const sectionHasContent = (view: ResolvedCv, kind: CvSectionKind): boolean => view[kind].length > 0;

export const renderCvHtml = (view: ResolvedCv): string => {
  const sections = view.sections
    .filter(section => sectionHasContent(view, section.kind))
    .map(section => `<section aria-labelledby="section-${escapeHtml(section.kind)}"><h2 id="section-${escapeHtml(section.kind)}">${standardSectionHeading[section.kind]}</h2>${sectionContent(view, section.kind)}</section>`)
    .join('');
  const contacts = [escapeHtml(view.location), ...view.links.map(renderLink)];

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(view.fullName)} — CV</title><style>${cvPrintStyles}</style></head>
<body><main class="cv">
<div class="identity"><h1>${escapeHtml(view.fullName)}</h1><p>${escapeHtml(view.headline)}</p><ul class="contact-list">${contacts.map(contact => `<li>${contact}</li>`).join('')}</ul><p>${escapeHtml(view.summary)}</p></div>
${sections}
</main></body>
</html>`;
};
