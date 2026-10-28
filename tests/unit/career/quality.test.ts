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
      'missing-observable-outcome', 'missing-measurable-impact', 'excessive-selected-skills', 'weak-theme-relevance',
    ]));
    expect(warnings.every(warning => warning.severity === 'warning')).toBe(true);
    expect(warnings.every(warning => warning.entityId.startsWith('devops:'))).toBe(true);
  });

  it('is deterministic, de-duplicates warnings, and never changes the supplied content', () => {
    const input = structuredClone(view()) as any;
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

  it('separates observable outcomes from measurable impact with positive and negative controls', () => {
    const input = structuredClone(view()) as any;
    input.experience[0]!.highlights = [
      { id: 'measured', text: 'Reduced build time by 40%.' },
      { id: 'observable', text: 'Improved system reliability for production users.' },
      { id: 'incidental-numbers', text: 'Delivered firmware for the 2024 release across 3 modules.' },
      { id: 'no-outcome', text: 'Built embedded firmware.' },
    ];
    const warnings = getCvQualityWarnings(input, cvProfiles.devops);
    const codes = (id: string) => warnings.filter(warning => warning.entityId.endsWith(`:${id}`)).map(warning => warning.code);
    expect(codes('measured')).not.toContain('missing-observable-outcome');
    expect(codes('measured')).not.toContain('missing-measurable-impact');
    expect(codes('observable')).not.toContain('missing-observable-outcome');
    expect(codes('observable')).toContain('missing-measurable-impact');
    expect(codes('incidental-numbers')).toEqual(expect.arrayContaining(['missing-observable-outcome', 'missing-measurable-impact']));
    expect(codes('no-outcome')).toEqual(expect.arrayContaining(['missing-observable-outcome', 'missing-measurable-impact']));
  });

  it('recognizes contextual measurable impact without accepting incidental numbers', () => {
    const input = structuredClone(view()) as any;
    input.experience[0]!.highlights = [
      { id: 'percent', text: 'Reduced build time by 40%.' },
      { id: 'before-after', text: 'Reduced defects from 10 to 2.' },
      { id: 'audience', text: 'Served 1,000 users.' },
      { id: 'target-unit', text: 'Cut latency to 50 ms.' },
      { id: 'currency', text: 'Saved $20,000.' },
      { id: 'multiplier', text: 'Improved throughput 2x.' },
      { id: 'year', text: 'Delivered the 2024 release.' },
      { id: 'version', text: 'Released firmware version 2.0.' },
      { id: 'module-count', text: 'Delivered firmware across 3 modules.' },
    ];
    const warnings = getCvQualityWarnings(input, cvProfiles.devops);
    const codes = (id: string) => warnings.filter(warning => warning.entityId.endsWith(`:${id}`)).map(warning => warning.code);
    for (const id of ['percent', 'before-after', 'audience', 'target-unit', 'currency', 'multiplier']) {
      expect(codes(id), id).not.toContain('missing-measurable-impact');
      expect(codes(id), id).not.toContain('missing-observable-outcome');
    }
    for (const id of ['year', 'version', 'module-count']) {
      expect(codes(id), id).toContain('missing-measurable-impact');
    }
  });

  it('uses token boundaries and simple morphology for theme relevance', () => {
    const input = structuredClone(view()) as any;
    input.projects = [
      { id: 'relevant', title: 'Deployment automation', description: 'Automated pipelines and testing workflows.', links: [], highlights: [] },
      { id: 'substring-only', title: 'Contest entry', description: 'A watercolor delivery truck.', links: [], highlights: [] },
    ];
    const warnings = getCvQualityWarnings(input, cvProfiles.devops);
    expect(warnings.some(warning => warning.code === 'weak-theme-relevance' && warning.entityId.endsWith(':relevant'))).toBe(false);
    expect(warnings.some(warning => warning.code === 'weak-theme-relevance' && warning.entityId.endsWith(':substring-only'))).toBe(true);
  });

  it('accepts only explicit theme word-family variants', () => {
    const warningsForProjects = (projects: ResolvedCv['projects'], profile = cvProfiles.devops) => {
      const input = structuredClone(view()) as any;
      input.profileId = profile.id;
      input.projects = projects;
      return getCvQualityWarnings(input, profile).filter(warning => warning.code === 'weak-theme-relevance');
    };
    const project = (id: string, description: string) => ({ id, title: id, description, links: [], highlights: [] });

    expect(warningsForProjects([project('testing', 'Testing pipelines.')])).toHaveLength(0);
    expect(warningsForProjects([project('testament', 'A testament to painted delivery trucks.')])).toHaveLength(1);

    const leadership = cvProfiles.leadership;
    expect(warningsForProjects([project('managed', 'Managed engineering work.')], leadership)).toHaveLength(0);
    expect(warningsForProjects([project('management', 'Engineering management.')], leadership)).toHaveLength(0);

    const general = { ...cvProfiles.devops, themeOrder: ['general'] as const };
    expect(warningsForProjects([project('systems', 'Reliable systems engineering.')], general)).toHaveLength(0);
    expect(warningsForProjects([project('systematic', 'A systematic art catalog.')], general)).toHaveLength(1);
  });

  it('keeps parent-qualified highlight identities and warns instead of throwing on profile mismatch', () => {
    const input = structuredClone(view()) as any;
    input.experience.push({
      ...input.experience[0]!, id: 'other-role',
      highlights: [{ id: 'passive', text: 'Was responsible for another task.' }],
    });
    input.profileId = 'generic';
    const warnings = getCvQualityWarnings(input, cvProfiles.devops);
    expect(warnings.filter(warning => warning.code === 'passive-opening').map(warning => warning.entityId)).toEqual([
      'devops:experience:role:passive', 'devops:experience:other-role:passive',
    ]);
    expect(warnings).toContainEqual(expect.objectContaining({
      code: 'profile-mismatch', severity: 'warning', entityId: 'devops:profile:generic',
    }));
  });
});
