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

const assertNever = (value: never): never => {
  throw new Error(`Unsupported CV section kind: ${String(value)}`);
};

const sectionContent = (view: ResolvedCv, kind: CvSectionKind): string => {
  switch (kind) {
    case 'skills': return renderSkills(view.skills);
    case 'experience': return renderExperience(view.experience);
    case 'projects': return renderProjects(view.projects);
    case 'education': return renderEducation(view.education);
    case 'publications': return renderPublications(view.publications);
    default: return assertNever(kind);
  }
};

const sectionHasContent = (view: ResolvedCv, kind: CvSectionKind): boolean => {
  switch (kind) {
    case 'skills': return view.skills.length > 0;
    case 'experience': return view.experience.length > 0;
    case 'projects': return view.projects.length > 0;
    case 'education': return view.education.length > 0;
    case 'publications': return view.publications.length > 0;
    default: return assertNever(kind);
  }
};

const requireText = (value: string, field: string): void => {
  if (!value.trim()) throw new Error(`${field} must not be empty`);
};

const validateView = (view: ResolvedCv): void => {
  requireText(view.fullName, 'fullName');
  requireText(view.headline, 'headline');
  requireText(view.summary, 'summary');
  requireText(view.location, 'location');
  view.links.forEach((link, index) => {
    requireText(link.label, `link ${index} label`);
    requireText(link.url, `link ${index} URL`);
  });

  view.experience.forEach((item, index) => {
    requireText(item.title, `experience ${index} title`);
    requireText(item.employer, `experience ${index} employer`);
    if (item.location !== undefined) requireText(item.location, `experience ${index} location`);
    item.highlights.forEach((highlight, highlightIndex) => requireText(highlight.text, `experience ${index} highlight ${highlightIndex}`));
  });
  view.projects.forEach((item, index) => {
    requireText(item.title, `project ${index} title`);
    requireText(item.description, `project ${index} description`);
    if (item.role !== undefined) requireText(item.role, `project ${index} role`);
    item.links.forEach((link, linkIndex) => {
      requireText(link.label, `project ${index} link ${linkIndex} label`);
      requireText(link.url, `project ${index} link ${linkIndex} URL`);
    });
    item.highlights.forEach((highlight, highlightIndex) => requireText(highlight.text, `project ${index} highlight ${highlightIndex}`));
  });
  view.education.forEach((item, index) => {
    requireText(item.institution, `education ${index} institution`);
    requireText(item.credential, `education ${index} credential`);
    if (item.location !== undefined) requireText(item.location, `education ${index} location`);
    item.highlights.forEach((highlight, highlightIndex) => requireText(highlight.text, `education ${index} highlight ${highlightIndex}`));
  });
  view.publications.forEach((item, index) => {
    requireText(item.title, `publication ${index} title`);
    requireText(item.venue, `publication ${index} venue`);
    requireText(item.type, `publication ${index} type`);
    if (!item.authors.length) throw new Error(`publication ${index} authors must not be empty`);
    item.authors.forEach((author, authorIndex) => requireText(author, `publication ${index} author ${authorIndex}`));
    if (item.url !== undefined) requireText(item.url, `publication ${index} URL`);
  });
  view.skills.forEach((group, index) => {
    requireText(group.name, `skill group ${index} name`);
    if (!group.skills.length) throw new Error(`skill group ${index} skills must not be empty`);
    group.skills.forEach((skill, skillIndex) => requireText(skill.name, `skill group ${index} skill ${skillIndex}`));
  });

  const seenSections = new Set<CvSectionKind>();
  for (const { kind } of view.sections) {
    if (seenSections.has(kind)) throw new Error(`Duplicate CV section kind: ${kind}`);
    seenSections.add(kind);
  }
};

export const renderCvHtml = (view: ResolvedCv): string => {
  validateView(view);
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
