import { describe, expect, it } from 'vitest';
import { collections } from '../../src/content.config';

describe('content collections', () => {
  it('declares every collection the site reads', () => {
    expect(Object.keys(collections).sort()).toEqual(
      ['blog', 'fixtureBlog', 'fixtureNotes', 'notes', 'now', 'portfolio'],
    );
  });

  it('gives each collection a loader and a schema', () => {
    for (const collection of Object.values(collections) as Array<{ loader?: unknown; schema?: unknown }>) {
      expect(collection.loader).toBeDefined();
      expect(collection.schema).toBeDefined();
    }
  });
});
