import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import {
  careerDataSchema,
  careerDateRangeSchema,
  careerDateSchema,
  careerHighlightSchema,
  careerLinkSchema,
  employerSchema,
  localizedStringSchema,
  projectSchema,
  publicationSchema,
} from '../../../src/content/portfolio/schema';

const text = (en = 'English', pt = 'Português') => ({ en, 'pt-br': pt });

const validCareer = (): z.input<typeof careerDataSchema> => ({
  person: {
    id: 'jonathan-tobias',
    fullName: 'Jonathan Tobias',
    location: text('Brazil', 'Brasil'),
    headline: text('Engineer', 'Engenheiro'),
    summary: text('Builds reliable systems.', 'Constrói sistemas confiáveis.'),
    links: [{ kind: 'website', label: 'jtobias.com.br', url: 'https://jtobias.com.br' }],
  },
  employers: [{ id: 'example-inc', name: 'Example Inc', location: text('Remote', 'Remoto') }],
  positions: [{
    id: 'software-engineer',
    employerId: 'example-inc',
    title: text('Software Engineer', 'Engenheiro de Software'),
    dates: { start: { value: '2024-01', precision: 'month' } },
    highlights: [],
    tags: ['TypeScript'],
  }],
  education: [],
  projects: [],
  publications: [],
  skillGroups: [],
});

describe('career schema', () => {
  it('requires both localized strings', () => {
    expect(() => localizedStringSchema.parse({ en: 'Only English' })).toThrow();
  });

  it('accepts a verified highlight with optional CV wording', () => {
    expect(careerHighlightSchema.parse({
      id: 'reduced-test-time',
      webText: { en: 'Reduced manual testing time.', 'pt-br': 'Reduziu o tempo de testes manuais.' },
      cvText: 'Reduced manual testing time through internal automation tools.',
      themes: ['devops'],
      priority: 80,
    }).cvText).toContain('automation');
  });

  it('allows CV consumers to fall back to English web text', () => {
    const highlight = careerHighlightSchema.parse({
      id: 'reliable-systems',
      webText: text('Built reliable systems.', 'Construiu sistemas confiáveis.'),
      themes: ['general'],
      priority: 50,
    });
    expect(highlight.cvText ?? highlight.webText.en).toBe('Built reliable systems.');
  });

  it('rejects unstable IDs', () => {
    expect(() => careerHighlightSchema.parse({
      id: 'Not Stable', webText: text(), themes: ['general'], priority: 50,
    })).toThrow();
  });

  it('rejects unexpected fields in canonical objects', () => {
    expect(() => careerHighlightSchema.parse({
      id: 'reliable-systems',
      webText: text(),
      themes: ['general'],
      priority: 50,
      typoPriority: 100,
    })).toThrow(/unrecognized key/i);
  });

  it('accepts only renderable URLs matching the required link kind', () => {
    expect(careerLinkSchema.parse({ kind: 'email', label: 'Email', url: 'mailto:me@example.com' }).kind).toBe('email');
    expect(careerLinkSchema.parse({ kind: 'github', label: 'GitHub', url: 'https://github.com/example' }).kind).toBe('github');
    expect(() => careerLinkSchema.parse({ kind: 'website', label: 'Site', url: 'javascript:alert(1)' })).toThrow();
    expect(() => careerLinkSchema.parse({ kind: 'email', label: 'Email', url: 'https://example.com' })).toThrow();
    expect(() => careerLinkSchema.parse({ kind: 'github', label: 'GitHub', url: 'mailto:me@example.com' })).toThrow();
  });

  it('returns a validation failure instead of throwing for a malformed HTTPS link', () => {
    expect(() => careerLinkSchema.safeParse({
      kind: 'website', label: 'Site', url: 'not a url',
    })).not.toThrow();
    expect(careerLinkSchema.safeParse({
      kind: 'website', label: 'Site', url: 'not a url',
    }).success).toBe(false);
  });

  it('rejects unsafe employer and publication URLs', () => {
    expect(() => employerSchema.parse({
      id: 'example-inc', name: 'Example Inc', website: 'javascript:alert(1)',
    })).toThrow();
    expect(() => publicationSchema.parse({
      id: 'example-paper',
      title: text(),
      authors: ['Example Author'],
      venue: 'Example Journal',
      date: { value: '2025', precision: 'year' },
      type: 'journal',
      url: 'javascript:alert(1)',
      themes: ['research'],
      priority: 50,
    })).toThrow();
  });

  it('enforces declared date precision', () => {
    expect(() => careerDateSchema.parse({ value: '2025-01', precision: 'year' })).toThrow(/year precision/i);
    expect(() => careerDateSchema.parse({ value: '2025', precision: 'month' })).toThrow(/month precision/i);
  });

  it('rejects an end date before a start date', () => {
    expect(() => careerDateRangeSchema.parse({
      start: { value: '2025-01', precision: 'month' },
      end: { value: '2024-12', precision: 'month' },
    })).toThrow(/end date/i);
  });

  it('validates URLs', () => {
    expect(() => projectSchema.parse({
      id: 'example-project', title: text(), description: text(), links: [{ kind: 'website', label: 'Demo', url: 'not a url' }],
      highlights: [], tags: [], themes: ['general'], priority: 50,
    })).toThrow();
  });

  it('accepts only HTTP historical references as non-renderable project links', () => {
    const project = {
      id: 'legacy-project', title: text(), description: text(), links: [], highlights: [], tags: [],
      themes: ['general'], priority: 50,
      legacyLinks: [{ label: 'Historical demo', url: 'http://legacy.example.com/demo' }],
    };
    expect(projectSchema.parse(project).legacyLinks).toEqual(project.legacyLinks);
    for (const url of ['https://example.com', 'javascript:alert(1)', 'data:text/plain,unsafe']) {
      expect(() => projectSchema.parse({ ...project, legacyLinks: [{ label: 'Unsafe', url }] })).toThrow();
    }
  });

  it('accepts only HTTP historical references as non-renderable publication URLs', () => {
    const publication = {
      id: 'legacy-paper', title: text(), authors: ['Example Author'], venue: 'Example Venue',
      date: { value: '2020', precision: 'year' }, type: 'paper', themes: ['research'], priority: 50,
      legacyHttpUrl: 'http://legacy.example.com/paper',
    };
    expect(publicationSchema.parse(publication).legacyHttpUrl).toBe(publication.legacyHttpUrl);
    for (const legacyHttpUrl of ['https://example.com', 'javascript:alert(1)', 'data:text/plain,unsafe']) {
      expect(() => publicationSchema.parse({ ...publication, legacyHttpUrl })).toThrow();
    }
  });

  it('rejects duplicate IDs across the aggregate', () => {
    const career = validCareer();
    career.employers[0]!.id = career.person.id;
    expect(() => careerDataSchema.parse(career)).toThrow(/duplicate id/i);
  });

  it('reports the exact path of a duplicate top-level entity ID', () => {
    const career = validCareer();
    career.employers[0]!.id = career.person.id;
    const result = careerDataSchema.safeParse(career);
    expect(result.error?.issues[0]?.path).toEqual(['employers', 0, 'id']);
  });

  it('reports the exact path of a duplicate nested highlight ID', () => {
    const career = validCareer();
    const highlight: z.input<typeof careerHighlightSchema> = {
      id: 'same-highlight',
      webText: text(),
      themes: ['general'],
      priority: 50,
    };
    career.positions[0]!.highlights = [highlight, highlight];
    const result = careerDataSchema.safeParse(career);
    expect(result.error?.issues[0]?.path).toEqual(['positions', 0, 'highlights', 1, 'id']);
  });

  it('rejects positions referencing unknown employers', () => {
    const career = validCareer();
    career.positions[0]!.employerId = 'missing-employer';
    expect(() => careerDataSchema.parse(career)).toThrow(/unknown employer/i);
  });

  it('validates chronological ranges in aggregate entities', () => {
    const career = validCareer();
    career.positions[0]!.dates = {
      start: { value: '2025-01', precision: 'month' },
      end: { value: '2024-12', precision: 'month' },
    };
    expect(() => careerDataSchema.parse(career)).toThrow(/end date/i);
  });
});
