import { z } from 'zod';

const stableIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const nonEmptyStringSchema = z.string().trim().min(1);

export const localeSchema = z.enum(['en', 'pt-br']);

export const localizedStringSchema = z.object({
  en: nonEmptyStringSchema,
  'pt-br': nonEmptyStringSchema,
});

export const themeSchema = z.enum(['general', 'embedded', 'research', 'leadership', 'devops']);

export const careerHighlightSchema = z.object({
  id: stableIdSchema,
  webText: localizedStringSchema,
  cvText: nonEmptyStringSchema.optional(),
  themes: z.array(themeSchema).min(1),
  priority: z.number().int().min(0).max(100),
});

export const careerDateSchema = z.object({
  value: z.string().regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/),
  precision: z.enum(['year', 'month']),
}).superRefine((date, ctx) => {
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
}).superRefine(({ start, end }, ctx) => {
  const startMonth = start.precision === 'year' ? `${start.value}-01` : start.value;
  const endMonth = end?.precision === 'year' ? `${end.value}-12` : end?.value;
  if (endMonth && endMonth < startMonth) {
    ctx.addIssue({ code: 'custom', message: 'end date precedes start date' });
  }
});

export const careerLinkSchema = z.object({
  kind: z.enum(['email', 'website', 'linkedin', 'github', 'orcid', 'other']).optional(),
  label: nonEmptyStringSchema,
  url: z.url(),
});

export const personSchema = z.object({
  id: stableIdSchema,
  fullName: nonEmptyStringSchema,
  location: localizedStringSchema,
  headline: localizedStringSchema,
  summary: localizedStringSchema,
  links: z.array(careerLinkSchema),
});

export const employerSchema = z.object({
  id: stableIdSchema,
  name: nonEmptyStringSchema,
  location: localizedStringSchema.optional(),
  website: z.url().optional(),
});

export const workPositionSchema = z.object({
  id: stableIdSchema,
  employerId: stableIdSchema,
  title: localizedStringSchema,
  location: localizedStringSchema.optional(),
  dates: careerDateRangeSchema,
  highlights: z.array(careerHighlightSchema),
  tags: z.array(nonEmptyStringSchema),
});

export const educationSchema = z.object({
  id: stableIdSchema,
  institution: nonEmptyStringSchema,
  credential: localizedStringSchema,
  location: localizedStringSchema.optional(),
  dates: careerDateRangeSchema,
  highlights: z.array(careerHighlightSchema),
  tags: z.array(nonEmptyStringSchema),
});

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
});

export const publicationSchema = z.object({
  id: stableIdSchema,
  title: localizedStringSchema,
  authors: z.array(nonEmptyStringSchema).min(1),
  venue: nonEmptyStringSchema,
  date: careerDateSchema,
  type: z.enum(['article', 'paper', 'book', 'talk', 'conference', 'journal']),
  url: z.url().optional(),
  themes: z.array(themeSchema).min(1),
  priority: z.number().int().min(0).max(100),
});

export const skillSchema = z.object({
  id: stableIdSchema,
  name: nonEmptyStringSchema,
  themes: z.array(themeSchema).min(1),
  priority: z.number().int().min(0).max(100),
});

export const skillGroupSchema = z.object({
  id: stableIdSchema,
  name: localizedStringSchema,
  priority: z.number().int().min(0).max(100),
  skills: z.array(skillSchema).min(1),
});

const chronologicalEntities = ['positions', 'education', 'projects'] as const;

export const careerDataSchema = z.object({
  person: personSchema,
  employers: z.array(employerSchema),
  positions: z.array(workPositionSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  publications: z.array(publicationSchema),
  skillGroups: z.array(skillGroupSchema),
}).superRefine((career, ctx) => {
  const ids = new Set<string>();
  const recordId = (id: string, path: PropertyKey[]) => {
    if (ids.has(id)) ctx.addIssue({ code: 'custom', path, message: `duplicate id: ${id}` });
    ids.add(id);
  };

  recordId(career.person.id, ['person', 'id']);
  const collections = [career.employers, career.positions, career.education, career.projects, career.publications];
  for (const collection of collections) {
    for (const entity of collection) recordId(entity.id, ['id']);
  }
  for (const entity of [...career.positions, ...career.education, ...career.projects]) {
    for (const highlight of entity.highlights) recordId(highlight.id, ['highlights', 'id']);
  }
  for (const group of career.skillGroups) {
    recordId(group.id, ['skillGroups', 'id']);
    for (const skill of group.skills) recordId(skill.id, ['skillGroups', 'skills', 'id']);
  }

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

  for (const collectionName of chronologicalEntities) {
    career[collectionName].forEach((entity, index) => {
      if (!entity.dates) return;
      const result = careerDateRangeSchema.safeParse(entity.dates);
      for (const issue of result.error?.issues ?? []) {
        ctx.addIssue({ ...issue, path: [collectionName, index, 'dates', ...issue.path] });
      }
    });
  }
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
