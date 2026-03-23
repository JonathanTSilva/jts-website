import { getCategoryColor } from './categoryColors';

export function getNoteAccentColor(
  colorToken: string | undefined,
  category: string | undefined,
): string {
  return getCategoryColor(category, colorToken);
}
