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

export function getCategoryColor(category: string | undefined): string {
  if (!category) return categoryColors.default;
  return categoryColors[category] || categoryColors.default;
}
