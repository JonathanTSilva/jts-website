export const categoryColors: Record<string, string> = {
  'Software Engineering': '#1e3a8a',
  'Embedded Systems': '#1e3a8a',
  'Web Development': '#1e3a8a',
  'Career': '#1e3a8a',
  'Life': '#1e3a8a',
  'Engineering': '#064e3b',
  'Real-Time Systems': '#78350f',
  'default': '#1e3a8a'
};

export function getCategoryColor(
  category: string | undefined,
  colorToken?: string | undefined,
): string {
  const defaultColor = categoryColors.default || '#1e3a8a';
  if (colorToken) return colorToken;
  if (!category) return defaultColor;
  return categoryColors[category] || defaultColor;
}
