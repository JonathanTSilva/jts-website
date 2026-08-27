import type { CvProfile, ResolvedCv, ResolvedHighlight } from '../cv/types';

export type CvQualityWarningCode =
  | 'long-highlight'
  | 'passive-opening'
  | 'vague-phrasing'
  | 'near-duplicate'
  | 'missing-observable-outcome'
  | 'missing-measurable-impact'
  | 'excessive-selected-skills'
  | 'weak-theme-relevance'
  | 'profile-mismatch';

export interface CvQualityWarning {
  readonly code: CvQualityWarningCode;
  readonly severity: 'warning';
  readonly entityId: string;
  readonly message: string;
}

const themeTerms: Readonly<Record<CvProfile['themeOrder'][number], readonly string[]>> = {
  general: ['engineer', 'engineers', 'engineering', 'software', 'system', 'systems', 'product', 'products', 'technical'],
  embedded: ['embedded', 'firmware', 'linux', 'rtos', 'hardware', 'protocol', 'protocols'],
  research: ['research', 'study', 'studies', 'studied', 'publication', 'publications', 'analysis', 'experiment', 'experiments', 'rd'],
  leadership: [
    'lead', 'leads', 'leading', 'leader', 'leaders', 'team', 'teams', 'mentor', 'mentors', 'mentored', 'mentoring',
    'manage', 'manages', 'managed', 'managing', 'management', 'manager', 'managers',
    'coordinate', 'coordinates', 'coordinated', 'coordinating', 'coordination',
  ],
  devops: [
    'devops', 'cicd', 'pipeline', 'pipelines', 'automation', 'automate', 'automates', 'automated', 'automating',
    'deploy', 'deploys', 'deployed', 'deploying', 'deployment', 'deployments',
    'test', 'tests', 'tested', 'testing', 'tester', 'testers', 'tooling',
  ],
};
const passiveOpening = /^(?:was|were|is|are|been|being)\b/i;
const vaguePhrasing = /\b(?:responsible for|worked on|helped(?: with| to)?|various|several tasks|important tasks)\b/i;
const outcomeVerb = String.raw`(?:reduc(?:e|ed|ing)|increas(?:e|ed|ing)|improv(?:e|ed|ing)|optim(?:ize|ized|izing)|achiev(?:e|ed|ing)|prevent(?:ed|ing)?|accelerat(?:e|ed|ing)|stabili(?:ze|zed|zing)|eliminat(?:e|ed|ing)|cut(?:ting)?|sav(?:e|ed|ing)|serv(?:e|ed|ing)|lower(?:ed|ing)?|decreas(?:e|ed|ing)|reach(?:ed|ing)?)`;
const observableOutcome = new RegExp(String.raw`\b${outcomeVerb}\b`, 'i');
const quantity = String.raw`(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)`;
const durationUnit = String.raw`(?:%|x|milliseconds?|ms|seconds?|minutes?|hours?|days?)`;
const measurableImpactPatterns = [
  new RegExp(String.raw`\bby\s+${quantity}\s*${durationUnit}(?=\s|[.,;:]|$)`, 'i'),
  new RegExp(String.raw`\b${outcomeVerb}\b.{0,60}\bfrom\s+${quantity}\s+to\s+${quantity}\b`, 'i'),
  new RegExp(String.raw`\b(?:serv(?:e|ed|ing)|support(?:ed|ing)?|reach(?:ed|ing)?)\s+${quantity}\s+(?:users?|customers?|devices?|sites?)\b`, 'i'),
  new RegExp(String.raw`\b${outcomeVerb}\b.{0,60}\bto\s+${quantity}\s*(?:milliseconds?|ms|seconds?|minutes?|hours?|days?)\b`, 'i'),
  new RegExp(String.raw`\b(?:sav(?:e|ed|ing)|generat(?:e|ed|ing)|earn(?:ed|ing)?)\s+(?:[$€£]\s*${quantity}|${quantity}\s*(?:usd|eur|gbp))\b`, 'i'),
  new RegExp(String.raw`\b${outcomeVerb}\b.{0,60}\b${quantity}\s*x\b`, 'i'),
];
const words = (text: string): string[] => text.toLowerCase().match(/[a-z0-9+#]+/g) ?? [];
const themeWords = (text: string): string[] => words(text.replace(/ci\s*\/\s*cd/gi, 'cicd').replace(/r\s*&\s*d/gi, 'rd'));
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
  const add = (code: CvQualityWarningCode, identity: string, message: string) => {
    const entityId = `${profile.id}:${identity}`;
    const key = `${code}:${entityId}`;
    if (seenWarnings.has(key)) return;
    seenWarnings.add(key);
    warnings.push({ code, severity: 'warning', entityId, message });
  };

  if (view.profileId !== profile.id) {
    add('profile-mismatch', `profile:${view.profileId}`, `Resolved profile ${view.profileId} does not match diagnostic profile ${profile.id}.`);
  }

  const highlights: Array<{ highlight: ResolvedHighlight; identity: string }> = [
    ...view.experience.flatMap(item => item.highlights.map(highlight => ({ highlight, identity: `experience:${item.id}:${highlight.id}` }))),
    ...view.projects.flatMap(item => item.highlights.map(highlight => ({ highlight, identity: `project:${item.id}:${highlight.id}` }))),
    ...view.education.flatMap(item => item.highlights.map(highlight => ({ highlight, identity: `education:${item.id}:${highlight.id}` }))),
  ];
  for (const { highlight, identity } of highlights) {
    if (highlight.text.length > 240 || words(highlight.text).length > 35) {
      add('long-highlight', identity, 'Highlight is longer than the recommended CV scan length.');
    }
    if (passiveOpening.test(highlight.text.trim())) {
      add('passive-opening', identity, 'Highlight opens with passive phrasing.');
    }
    if (vaguePhrasing.test(highlight.text)) {
      add('vague-phrasing', identity, 'Highlight contains vague phrasing.');
    }
    if (!observableOutcome.test(highlight.text)) {
      add('missing-observable-outcome', identity, 'Highlight does not state an observable outcome.');
    }
    if (!measurableImpactPatterns.some(pattern => pattern.test(highlight.text))) {
      add('missing-measurable-impact', identity, 'Highlight does not state a measurable impact.');
    }
  }

  for (let current = 1; current < highlights.length; current += 1) {
    for (let previous = 0; previous < current; previous += 1) {
      if (similarity(highlights[previous]!.highlight.text, highlights[current]!.highlight.text) >= 0.8) {
        add('near-duplicate', highlights[current]!.identity, `Highlight is near-duplicate of ${highlights[previous]!.identity}.`);
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
    const tokens = themeWords(`${project.title} ${project.description} ${project.role ?? ''} ${project.highlights.map(item => item.text).join(' ')}`);
    if (!terms.some(term => tokens.includes(term))) {
      add('weak-theme-relevance', `project:${project.id}`, `Project has weak relevance to the profile's primary ${primaryTheme} theme.`);
    }
  }

  return warnings;
};
