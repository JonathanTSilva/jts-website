import { z } from 'zod';

const stableIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const nonEmptyStringSchema = z.string().trim().min(1);

export const localeSchema = z.enum(['en', 'pt-br']);

export const localizedStringSchema = z.object({
  en: nonEmptyStringSchema,
  'pt-br': nonEmptyStringSchema,
}).strict();

export const themeSchema = z.enum(['general', 'embedded', 'research', 'leadership', 'devops']);

export const careerHighlightSchema = z.object({
  id: stableIdSchema,
  webText: localizedStringSchema,
  cvText: nonEmptyStringSchema.optional(),
  themes: z.array(themeSchema).min(1),
  priority: z.number().int().min(0).max(100),
}).strict();

export const careerDateSchema = z.object({
  value: z.string().regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/),
  precision: z.enum(['year', 'month']),
}).strict().superRefine((date, ctx) => {
  if (date.precision === 'year' && date.value.length !== 4) {
    ctx.addIssue({ code: 'custom', message: 'year precision requires YYYY' });
  }
  if (date.precision === 'month' && date.value.length !== 7) {
    ctx.addIssue({ code: 'custom', message: 'month precision requires YYYY-MM' });
  }
});

export const careerDateRangeSchema = z.object({
  start: careerDateSchema,
  end: careerDateSchema.optional(),
}).strict().superRefine(({ start, end }, ctx) => {
  const startMonth = start.precision === 'year' ? `${start.value}-01` : start.value;
  const endMonth = end?.precision === 'year' ? `${end.value}-12` : end?.value;
  if (endMonth && endMonth < startMonth) {
    ctx.addIssue({ code: 'custom', message: 'end date precedes start date' });
  }
});

const httpsUrlSchema = z.url({ protocol: /^https$/ });
// Historical references are retained for factual review only and must never be rendered as safe links.
const legacyHttpUrlSchema = z.url({ protocol: /^http$/ });
const legacyLinkSchema = z.object({ label: nonEmptyStringSchema, url: legacyHttpUrlSchema }).strict();
const mailtoUrlSchema = z.string().refine((url) => {
  if (!url.startsWith('mailto:')) return false;
  return z.email().safeParse(url.slice('mailto:'.length)).success;
}, { message: 'email link requires a mailto URL' });

export const careerLinkSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('email'), label: nonEmptyStringSchema, url: mailtoUrlSchema }).strict(),
  z.object({ kind: z.literal('website'), label: nonEmptyStringSchema, url: httpsUrlSchema }).strict(),
  z.object({ kind: z.literal('linkedin'), label: nonEmptyStringSchema, url: httpsUrlSchema }).strict(),
  z.object({ kind: z.literal('github'), label: nonEmptyStringSchema, url: httpsUrlSchema }).strict(),
  z.object({ kind: z.literal('orcid'), label: nonEmptyStringSchema, url: httpsUrlSchema }).strict(),
]);

export const personSchema = z.object({
  id: stableIdSchema,
  fullName: nonEmptyStringSchema,
  location: localizedStringSchema,
  headline: localizedStringSchema,
  summary: localizedStringSchema,
  links: z.array(careerLinkSchema),
}).strict();

export const employerSchema = z.object({
  id: stableIdSchema,
  name: nonEmptyStringSchema,
  location: localizedStringSchema.optional(),
  website: httpsUrlSchema.optional(),
}).strict();

export const workPositionSchema = z.object({
  id: stableIdSchema,
  employerId: stableIdSchema,
  title: localizedStringSchema,
  location: localizedStringSchema.optional(),
  dates: careerDateRangeSchema,
  highlights: z.array(careerHighlightSchema),
  tags: z.array(nonEmptyStringSchema),
  verification: z.enum(['verified', 'pending']),
}).strict();

export const educationSchema = z.object({
  id: stableIdSchema,
  institution: nonEmptyStringSchema,
  credential: localizedStringSchema,
  location: localizedStringSchema.optional(),
  dates: careerDateRangeSchema,
  highlights: z.array(careerHighlightSchema),
  tags: z.array(nonEmptyStringSchema),
}).strict();

export const projectSchema = z.object({
  id: stableIdSchema,
  title: localizedStringSchema,
  description: localizedStringSchema,
  role: localizedStringSchema.optional(),
  dates: careerDateRangeSchema.optional(),
  links: z.array(careerLinkSchema).default([]),
  highlights: z.array(careerHighlightSchema),
  tags: z.array(nonEmptyStringSchema),
  themes: z.array(themeSchema).min(1),
  priority: z.number().int().min(0).max(100),
  featured: z.boolean().optional(),
  status: z.enum(['Active', 'Archived', 'Featured', 'Private', 'In Progress']).optional(),
  image: nonEmptyStringSchema.optional(),
  year: z.number().int().optional(),
  legacyLinks: z.array(legacyLinkSchema).optional(),
}).strict();

export const publicationSchema = z.object({
  id: stableIdSchema,
  title: localizedStringSchema,
  authors: z.array(nonEmptyStringSchema).min(1),
  venue: nonEmptyStringSchema,
  date: careerDateSchema,
  type: z.enum(['article', 'paper', 'book', 'talk', 'conference', 'journal']),
  url: httpsUrlSchema.optional(),
  legacyHttpUrl: legacyHttpUrlSchema.optional(),
  themes: z.array(themeSchema).min(1),
  priority: z.number().int().min(0).max(100),
}).strict();

export const skillSchema = z.object({
  id: stableIdSchema,
  name: nonEmptyStringSchema,
  themes: z.array(themeSchema).min(1),
  priority: z.number().int().min(0).max(100),
}).strict();

export const skillGroupSchema = z.object({
  id: stableIdSchema,
  name: localizedStringSchema,
  priority: z.number().int().min(0).max(100),
  skills: z.array(skillSchema).min(1),
}).strict();

export const careerDataSchema = z.object({
  person: personSchema,
  employers: z.array(employerSchema),
  positions: z.array(workPositionSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  publications: z.array(publicationSchema),
  skillGroups: z.array(skillGroupSchema),
}).strict().superRefine((career, ctx) => {
  const ids = new Set<string>();
  const recordId = (id: string, path: PropertyKey[]) => {
    if (ids.has(id)) ctx.addIssue({ code: 'custom', path, message: `duplicate id: ${id}` });
    ids.add(id);
  };

  recordId(career.person.id, ['person', 'id']);
  career.employers.forEach((entity, index) => recordId(entity.id, ['employers', index, 'id']));
  career.positions.forEach((entity, index) => recordId(entity.id, ['positions', index, 'id']));
  career.education.forEach((entity, index) => recordId(entity.id, ['education', index, 'id']));
  career.projects.forEach((entity, index) => recordId(entity.id, ['projects', index, 'id']));
  career.publications.forEach((entity, index) => recordId(entity.id, ['publications', index, 'id']));
  career.positions.forEach((entity, entityIndex) => {
    entity.highlights.forEach((highlight, highlightIndex) => {
      recordId(highlight.id, ['positions', entityIndex, 'highlights', highlightIndex, 'id']);
    });
  });
  career.education.forEach((entity, entityIndex) => {
    entity.highlights.forEach((highlight, highlightIndex) => {
      recordId(highlight.id, ['education', entityIndex, 'highlights', highlightIndex, 'id']);
    });
  });
  career.projects.forEach((entity, entityIndex) => {
    entity.highlights.forEach((highlight, highlightIndex) => {
      recordId(highlight.id, ['projects', entityIndex, 'highlights', highlightIndex, 'id']);
    });
  });
  career.skillGroups.forEach((group, groupIndex) => {
    recordId(group.id, ['skillGroups', groupIndex, 'id']);
    group.skills.forEach((skill, skillIndex) => {
      recordId(skill.id, ['skillGroups', groupIndex, 'skills', skillIndex, 'id']);
    });
  });

  const employerIds = new Set(career.employers.map(({ id }) => id));
  career.positions.forEach((position, index) => {
    if (!employerIds.has(position.employerId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['positions', index, 'employerId'],
        message: `unknown employer: ${position.employerId}`,
      });
    }
  });

});

export type Locale = z.infer<typeof localeSchema>;
export type LocalizedString = z.infer<typeof localizedStringSchema>;
export type CareerHighlight = z.infer<typeof careerHighlightSchema>;
export type CareerDate = z.infer<typeof careerDateSchema>;
export type CareerDateRange = z.infer<typeof careerDateRangeSchema>;
export type Person = z.infer<typeof personSchema>;
export type Employer = z.infer<typeof employerSchema>;
export type WorkPosition = z.infer<typeof workPositionSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Publication = z.infer<typeof publicationSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type CareerData = z.infer<typeof careerDataSchema>;
