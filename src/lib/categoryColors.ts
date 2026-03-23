export const CATEGORY_COLORS: Record<string, string> = {
  'Engineering':          '#22c55e',
  'Engenharia':           '#22c55e',
  'Real-Time Systems':    '#f59e0b',
  'Software Engineering': '#3b82f6',
};

export function getCategoryColor(
  category: string | undefined,
  colorToken?: string | undefined,
): string {
  return colorToken ?? (category ? CATEGORY_COLORS[category] : undefined) ?? 'var(--accent)';
}
