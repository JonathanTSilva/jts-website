const categoryColors: Record<string, string> = {
  'Engineering':       '#22c55e',
  'Engenharia':        '#22c55e',
  'Real-Time Systems': '#f59e0b',
};

export function getNoteAccentColor(
  colorToken: string | undefined,
  category: string | undefined
): string {
  return colorToken ?? (category ? categoryColors[category] : undefined) ?? 'var(--accent)';
}
