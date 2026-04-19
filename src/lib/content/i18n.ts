/**
 * Build a category translation map from a set of bilingual content items.
 *
 * Scans all items grouped by translationKey. When a group has members in both
 * `sourceLocale` and `targetLocale` with different category strings, the
 * mapping sourceCategory → targetCategory is recorded.
 *
 * Use this to normalise fallback-locale items so their category matches the
 * locale of the current page.
 */
export function buildCategoryMap<
  T extends {
    data: { translationKey: string; language: string; category?: string | null | undefined };
  }
>(allItems: T[], sourceLocale: string, targetLocale: string): Map<string, string> {
  const map = new Map<string, string>();

  // Group by translationKey
  const groups = new Map<string, T[]>();
  for (const item of allItems) {
    const key = item.data.translationKey;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  // For each bilingual pair, record source → target category mapping
  for (const group of groups.values()) {
    const sourceItem = group.find((i) => i.data.language === sourceLocale);
    const targetItem = group.find((i) => i.data.language === targetLocale);
    const sourceCat = sourceItem?.data.category;
    const targetCat = targetItem?.data.category;
    if (sourceCat && targetCat && sourceCat !== targetCat) {
      map.set(sourceCat, targetCat);
    }
  }

  return map;
}
