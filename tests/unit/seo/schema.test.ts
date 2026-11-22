import { describe, expect, it } from 'vitest';
import { generateArticleSchema, serializeJsonLd } from '../../../src/lib/seo/schema';
import { SITE_URL } from '../../../src/lib/site';

const base = {
  title: 'A Post',
  description: 'About a post',
  url: 'https://www.jontobias.com/blog/a-post/',
  publishedAt: new Date('2026-04-20'),
};

describe('generateArticleSchema', () => {
  it('describes the author, language and canonical page', () => {
    const schema = generateArticleSchema({ ...base, locale: 'en' });
    expect(schema.author).toEqual({ '@type': 'Person', name: 'Jonathan Tobias', url: SITE_URL });
    expect(schema.inLanguage).toBe('en');
    expect(schema.mainEntityOfPage).toBe(base.url);
    expect(schema.headline).toBe(base.title);
    expect(schema.description).toBe(base.description);
    expect(schema.datePublished).toBe('2026-04-20T00:00:00.000Z');
  });

  it('uses pt-BR as the language of Portuguese pages', () => {
    expect(generateArticleSchema({ ...base, locale: 'pt-br' }).inLanguage).toBe('pt-BR');
  });

  it('dateModified falls back to the published date', () => {
    const schema = generateArticleSchema({ ...base, locale: 'en' });
    expect(schema.dateModified).toBe(base.publishedAt.toISOString());
  });

  it('dateModified is the updated date when set', () => {
    const updatedAt = new Date('2026-05-01');
    const schema = generateArticleSchema({ ...base, updatedAt, locale: 'en' });
    expect(schema.dateModified).toBe(updatedAt.toISOString());
    expect(schema.datePublished).toBe(base.publishedAt.toISOString());
  });

  it('includes the image only when given', () => {
    expect(generateArticleSchema({ ...base, locale: 'en' }).image).toBeUndefined();
    const withImage = generateArticleSchema({ ...base, image: 'https://www.jontobias.com/og/x.png', locale: 'en' });
    expect(withImage.image).toBe('https://www.jontobias.com/og/x.png');
  });
});

describe('serializeJsonLd', () => {
  it('cannot close the script element', () => {
    const out = serializeJsonLd({ t: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ t: '</script><script>alert(1)</script>' });
  });
});
