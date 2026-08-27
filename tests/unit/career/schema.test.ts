import { describe, expect, it } from 'vitest';
import {
  careerDataSchema,
  careerDateRangeSchema,
  careerDateSchema,
  careerHighlightSchema,
  localizedStringSchema,
  projectSchema,
} from '../../../src/content/portfolio/schema';

const text = (en = 'English', pt = 'Português') => ({ en, 'pt-br': pt });

const validCareer = () => ({
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
    dates: {
      start: { value: '2024-01', precision: 'month' },
      end: undefined as { value: string; precision: string } | undefined,
    },
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
      id: 'example-project', title: text(), description: text(), links: [{ label: 'Demo', url: 'not a url' }],
      highlights: [], tags: [], themes: ['general'], priority: 50,
    })).toThrow();
  });

  it('rejects duplicate IDs across the aggregate', () => {
    const career = validCareer();
    career.employers[0]!.id = career.person.id;
    expect(() => careerDataSchema.parse(career)).toThrow(/duplicate id/i);
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
