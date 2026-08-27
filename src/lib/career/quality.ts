import type { CvProfile, ResolvedCv, ResolvedHighlight } from '../cv/types';

export type CvQualityWarningCode =
  | 'long-highlight'
  | 'passive-opening'
  | 'vague-phrasing'
  | 'near-duplicate'
  | 'missing-observable-outcome'
  | 'excessive-selected-skills'
  | 'weak-theme-relevance';

export interface CvQualityWarning {
  readonly code: CvQualityWarningCode;
  readonly severity: 'warning';
  readonly entityId: string;
  readonly message: string;
}

const themeTerms: Readonly<Record<CvProfile['themeOrder'][number], readonly string[]>> = {
  general: ['engineer', 'software', 'system', 'product', 'technical'],
  embedded: ['embedded', 'firmware', 'linux', 'rtos', 'hardware', 'protocol'],
  research: ['research', 'r&d', 'study', 'publication', 'analysis', 'experiment'],
  leadership: ['lead', 'leader', 'team', 'mentor', 'manage', 'coordinate'],
  devops: ['devops', 'ci/cd', 'pipeline', 'automation', 'delivery', 'deploy', 'test', 'tooling'],
};
const passiveOpening = /^(?:was|were|is|are|been|being)\b/i;
const vaguePhrasing = /\b(?:responsible for|worked on|helped(?: with| to)?|various|several tasks|important tasks)\b/i;
const observableOutcome = /(?:\d|%|\b(?:reduc(?:e|ed|ing)|increas(?:e|ed|ing)|improv(?:e|ed|ing)|optim(?:ize|ized|izing)|deliver(?:ed|ing)?|enabl(?:e|ed|ing)|ensur(?:e|ed|ing)|achiev(?:e|ed|ing)|prevent(?:ed|ing)?|accelerat(?:e|ed|ing)|stabili(?:ze|zed|zing))\b)/i;
const words = (text: string): string[] => text.toLowerCase().match(/[a-z0-9+#]+/g) ?? [];
const comparableWords = (text: string): Set<string> => new Set(words(text).filter(word => !['a', 'an', 'and', 'for', 'of', 'the', 'to'].includes(word)));
const similarity = (left: string, right: string): number => {
  const a = comparableWords(left);
  const b = comparableWords(right);
  const overlap = [...a].filter(word => b.has(word)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : overlap / union;
};

export const getCvQualityWarnings = (view: ResolvedCv, profile: CvProfile): CvQualityWarning[] => {
  const warnings: CvQualityWarning[] = [];
  const seenWarnings = new Set<string>();
  const add = (code: CvQualityWarningCode, id: string, message: string) => {
    const entityId = `${profile.id}:${id}`;
    const key = `${code}:${entityId}`;
    if (seenWarnings.has(key)) return;
    seenWarnings.add(key);
    warnings.push({ code, severity: 'warning', entityId, message });
  };

  const highlights: ResolvedHighlight[] = [
    ...view.experience.flatMap(item => item.highlights),
    ...view.projects.flatMap(item => item.highlights),
    ...view.education.flatMap(item => item.highlights),
  ];
  for (const highlight of highlights) {
    if (highlight.text.length > 240 || words(highlight.text).length > 35) {
      add('long-highlight', highlight.id, 'Highlight is longer than the recommended CV scan length.');
    }
    if (passiveOpening.test(highlight.text.trim())) {
      add('passive-opening', highlight.id, 'Highlight opens with passive phrasing.');
    }
    if (vaguePhrasing.test(highlight.text)) {
      add('vague-phrasing', highlight.id, 'Highlight contains vague phrasing.');
    }
    if (!observableOutcome.test(highlight.text)) {
      add('missing-observable-outcome', highlight.id, 'Highlight does not state an observable outcome.');
    }
  }

  for (let current = 1; current < highlights.length; current += 1) {
    for (let previous = 0; previous < current; previous += 1) {
      if (similarity(highlights[previous]!.text, highlights[current]!.text) >= 0.8) {
        add('near-duplicate', highlights[current]!.id, `Highlight is near-duplicate of ${highlights[previous]!.id}.`);
        break;
      }
    }
  }

  const selectedSkillCount = view.skills.reduce((total, group) => total + group.skills.length, 0);
  if (selectedSkillCount > profile.limits.skills) {
    add('excessive-selected-skills', 'skills', `Profile selects ${selectedSkillCount} skills; its limit is ${profile.limits.skills}.`);
  }

  const primaryTheme = profile.themeOrder[0] ?? 'general';
  const terms = themeTerms[primaryTheme];
  for (const project of view.projects) {
    const content = `${project.title} ${project.description} ${project.role ?? ''} ${project.highlights.map(item => item.text).join(' ')}`.toLowerCase();
    if (!terms.some(term => content.includes(term))) {
      add('weak-theme-relevance', project.id, `Project has weak relevance to the profile's primary ${primaryTheme} theme.`);
    }
  }

  return warnings;
};
