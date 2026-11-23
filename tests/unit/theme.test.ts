import { runInNewContext } from 'node:vm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getTheme, toggleTheme } from '../../src/lib/theme/theme';
import { themeInlineScript } from '../../src/lib/theme/theme-inline-script';

function memoryStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    store,
  };
}

function stubBrowser(initial: Record<string, string>, prefersDark: boolean) {
  const storage = memoryStorage(initial);
  const attributes = new Map<string, string>();
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('window', { matchMedia: () => ({ matches: prefersDark }) });
  vi.stubGlobal('document', {
    documentElement: { setAttribute: (name: string, value: string) => void attributes.set(name, value) },
  });
  return { storage, attributes };
}

describe('theme helpers', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  it('reads the stored preference first', () => {
    stubBrowser({ 'theme-preference': 'dark' }, false);
    expect(getTheme()).toBe('dark');
  });

  it('falls back to the system preference', () => {
    stubBrowser({}, true);
    expect(getTheme()).toBe('dark');
    stubBrowser({}, false);
    expect(getTheme()).toBe('light');
  });

  it('falls back to the system preference when localStorage is unavailable', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });
    expect(getTheme()).toBe('dark');
  });

  it('toggles and persists the theme', () => {
    const { storage, attributes } = stubBrowser({ 'theme-preference': 'light' }, false);
    expect(toggleTheme()).toBe('dark');
    expect(storage.store.get('theme-preference')).toBe('dark');
    expect(attributes.get('data-theme')).toBe('dark');
    expect(toggleTheme()).toBe('light');
    expect(attributes.get('data-theme')).toBe('light');
  });
});

describe('themeInlineScript', () => {
  function run(initial: Record<string, string>, prefersDark: boolean, withStorage = true) {
    const storage = memoryStorage(initial);
    const attributes = new Map<string, string>();
    const context: Record<string, unknown> = {
      window: { matchMedia: () => ({ matches: prefersDark }) },
      document: {
        documentElement: { setAttribute: (name: string, value: string) => void attributes.set(name, value) },
      },
    };
    if (withStorage) context.localStorage = storage;
    runInNewContext(themeInlineScript, context);
    return { storage, attributes };
  }

  it('applies a stored dark preference', () => {
    expect(run({ 'theme-preference': 'dark' }, false).attributes.get('data-theme')).toBe('dark');
  });

  it('derives the theme from the system and persists it', () => {
    const dark = run({}, true);
    expect(dark.attributes.get('data-theme')).toBe('dark');
    expect(dark.storage.store.get('theme-preference')).toBe('dark');
    const light = run({}, false);
    expect(light.attributes.get('data-theme')).toBe('light');
    expect(light.storage.store.get('theme-preference')).toBe('light');
  });

  it('still sets the theme when localStorage is unavailable', () => {
    expect(run({}, true, false).attributes.get('data-theme')).toBe('dark');
  });
});
