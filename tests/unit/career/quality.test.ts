import { describe, expect, it } from 'vitest';
import { getCvQualityWarnings } from '../../../src/lib/career/quality';
import { cvProfiles } from '../../../src/lib/cv/profiles';
import type { ResolvedCv } from '../../../src/lib/cv/types';

const view = (): ResolvedCv => ({
  profileId: 'devops', fullName: 'Test Person', headline: 'Engineer', summary: 'Summary', location: 'Brazil', links: [],
  experience: [{
    id: 'role', employer: 'Employer', title: 'Engineer', dates: { start: { value: '2020', precision: 'year' } }, verification: 'verified',
    highlights: [
      { id: 'passive', text: 'Was responsible for various important engineering tasks.' },
      { id: 'long', text: `Built ${'reliable delivery tooling '.repeat(20)}for engineers.` },
      { id: 'duplicate-a', text: 'Automated release pipelines for product teams.' },
      { id: 'duplicate-b', text: 'Automated release pipelines for the product teams.' },
    ],
  }],
  projects: [{ id: 'unfocused', title: 'Painting Portfolio', description: 'A gallery of watercolor art.', links: [], highlights: [] }],
  publications: [], education: [],
  skills: [{ id: 'skills', name: 'Skills', skills: Array.from({ length: 19 }, (_, index) => ({ id: `skill-${index}`, name: `Skill ${index}` })) }],
  sections: [],
});

describe('getCvQualityWarnings', () => {
  it('reports every advisory quality class with stable profile/entity identifiers', () => {
    const warnings = getCvQualityWarnings(view(), cvProfiles.devops);
    expect(new Set(warnings.map(warning => warning.code))).toEqual(new Set([
      'long-highlight', 'passive-opening', 'vague-phrasing', 'near-duplicate',
      'missing-observable-outcome', 'excessive-selected-skills', 'weak-theme-relevance',
    ]));
    expect(warnings.every(warning => warning.severity === 'warning')).toBe(true);
    expect(warnings.every(warning => warning.entityId.startsWith('devops:'))).toBe(true);
  });

  it('is deterministic, de-duplicates warnings, and never changes the supplied content', () => {
    const input = view();
    const before = structuredClone(input);
    const first = getCvQualityWarnings(input, cvProfiles.devops);
    expect(getCvQualityWarnings(input, cvProfiles.devops)).toEqual(first);
    expect(new Set(first.map(warning => `${warning.code}:${warning.entityId}`)).size).toBe(first.length);
    expect(input).toEqual(before);
  });

  it('returns warnings instead of throwing or synthesizing replacement text', () => {
    const warnings = getCvQualityWarnings(view(), cvProfiles.devops);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.every(warning => !('replacement' in warning))).toBe(true);
  });
});
