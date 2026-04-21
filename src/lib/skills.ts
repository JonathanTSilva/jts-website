import { projects } from '../content/portfolio/projects';
import { experience } from '../content/portfolio/experience';

interface SkillEntry {
  tag: string;
  count: number;
}

export function getSkills(): SkillEntry[] {
  const counts = new Map<string, number>();

  for (const project of projects) {
    for (const tag of project.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  for (const entry of experience) {
    for (const tag of entry.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
