import { describe, it, expect } from 'vitest';
import { generateSeo, SITE_NAME } from '../../src/lib/seo/metadata';

const BASE_URL = 'https://www.jontobias.com';

describe('generateSeo — canonical generation', () => {
  it('generates canonical for EN path /about', () => {
    const result = generateSeo({ locale: 'en', currentPath: '/about' });
    expect(result.canonical).toBe(`${BASE_URL}/about`);
  });

  it('generates canonical for PT-BR path /pt-br/sobre', () => {
    const result = generateSeo({ locale: 'pt-br', currentPath: '/pt-br/sobre' });
    expect(result.canonical).toBe(`${BASE_URL}/pt-br/sobre`);
  });

  it('explicit canonical prop overrides computed path', () => {
    const result = generateSeo({ locale: 'en', currentPath: '/about', canonical: '/custom-page' });
    expect(result.canonical).toBe(`${BASE_URL}/custom-page`);
  });
});

describe('generateSeo — alternate locale generation', () => {
  it('EN path /blog generates en and pt-br alternates', () => {
    const result = generateSeo({ locale: 'en', currentPath: '/blog' });
    const en = result.alternateLocales.find((a) => a.locale === 'en');
    const ptbr = result.alternateLocales.find((a) => a.locale === 'pt-br');
    expect(en?.href).toBe(`${BASE_URL}/blog`);
    expect(ptbr?.href).toBe(`${BASE_URL}/pt-br/blog`);
  });

  it('PT-BR path /pt-br/blog generates same two alternates as EN /blog', () => {
    const result = generateSeo({ locale: 'pt-br', currentPath: '/pt-br/blog' });
    const en = result.alternateLocales.find((a) => a.locale === 'en');
    const ptbr = result.alternateLocales.find((a) => a.locale === 'pt-br');
    expect(en?.href).toBe(`${BASE_URL}/blog`);
    expect(ptbr?.href).toBe(`${BASE_URL}/pt-br/blog`);
  });

  it('root path / generates correct alternates', () => {
    const result = generateSeo({ locale: 'en', currentPath: '/' });
    const en = result.alternateLocales.find((a) => a.locale === 'en');
    const ptbr = result.alternateLocales.find((a) => a.locale === 'pt-br');
    expect(en?.href).toBe(`${BASE_URL}/`);
    expect(ptbr?.href).toBe(`${BASE_URL}/pt-br/`);
  });

  it('includes x-default alternate pointing to EN URL', () => {
    const result = generateSeo({ locale: 'en', currentPath: '/blog' });
    const xDefault = result.alternateLocales.find((a) => a.locale === 'x-default');
    expect(xDefault).toBeDefined();
    expect(xDefault?.href).toBe(`${BASE_URL}/blog`);
  });

  it('x-default for root path points to EN root URL', () => {
    const result = generateSeo({ locale: 'en', currentPath: '/' });
    const xDefault = result.alternateLocales.find((a) => a.locale === 'x-default');
    expect(xDefault?.href).toBe(`${BASE_URL}/`);
  });

  it('x-default from PT-BR path also points to EN URL', () => {
    const result = generateSeo({ locale: 'pt-br', currentPath: '/pt-br/sobre' });
    const xDefault = result.alternateLocales.find((a) => a.locale === 'x-default');
    expect(xDefault?.href).toBe(`${BASE_URL}/sobre`);
  });
});

describe('generateSeo — page-type-aware title/description defaults', () => {
  it('home pageType EN uses site name and profession as title', () => {
    const result = generateSeo({ locale: 'en', pageType: 'home' });
    expect(result.title).toBe(`${SITE_NAME} | Senior Embedded Software Engineer`);
  });

  it('home pageType PT-BR uses PT profession', () => {
    const result = generateSeo({ locale: 'pt-br', pageType: 'home' });
    expect(result.title).toBe(`${SITE_NAME} | Engenheiro Sênior de Software Embarcado`);
  });

  it('blog-index pageType EN returns "Blog | Tobias"', () => {
    const result = generateSeo({ locale: 'en', pageType: 'blog-index' });
    expect(result.title).toBe(`Blog | ${SITE_NAME}`);
  });

  it('blog-index pageType PT-BR returns "Blog | Tobias"', () => {
    const result = generateSeo({ locale: 'pt-br', pageType: 'blog-index' });
    expect(result.title).toBe(`Blog | ${SITE_NAME}`);
  });

  it('notes-index pageType EN returns "Notes | Tobias"', () => {
    const result = generateSeo({ locale: 'en', pageType: 'notes-index' });
    expect(result.title).toBe(`Notes | ${SITE_NAME}`);
  });

  it('notes-index pageType PT-BR returns "Notas | Tobias"', () => {
    const result = generateSeo({ locale: 'pt-br', pageType: 'notes-index' });
    expect(result.title).toBe(`Notas | ${SITE_NAME}`);
  });

  it('portfolio pageType EN returns "Portfolio | Tobias"', () => {
    const result = generateSeo({ locale: 'en', pageType: 'portfolio' });
    expect(result.title).toBe(`Portfolio | ${SITE_NAME}`);
  });

  it('portfolio pageType PT-BR returns "Portfólio | Tobias"', () => {
    const result = generateSeo({ locale: 'pt-br', pageType: 'portfolio' });
    expect(result.title).toBe(`Portfólio | ${SITE_NAME}`);
  });

  it('now pageType EN returns "Now | Tobias"', () => {
    const result = generateSeo({ locale: 'en', pageType: 'now' });
    expect(result.title).toBe(`Now | ${SITE_NAME}`);
  });

  it('now pageType PT-BR returns "Agora | Tobias"', () => {
    const result = generateSeo({ locale: 'pt-br', pageType: 'now' });
    expect(result.title).toBe(`Agora | ${SITE_NAME}`);
  });

  it('explicit title always wins over pageType default', () => {
    const result = generateSeo({ locale: 'en', pageType: 'blog-index', title: 'My Custom Title' });
    expect(result.title).toBe(`My Custom Title | ${SITE_NAME}`);
  });

  it('explicit description always wins over pageType default', () => {
    const result = generateSeo({ locale: 'en', pageType: 'blog-index', description: 'My custom description' });
    expect(result.description).toBe('My custom description');
  });

  it('omitting pageType preserves existing generic behavior (no explicit title)', () => {
    const result = generateSeo({ locale: 'en' });
    expect(result.title).toBe(`${SITE_NAME} | Senior Embedded Software Engineer`);
  });

  it('omitting pageType with explicit title uses title | SITE_NAME format', () => {
    const result = generateSeo({ locale: 'en', title: 'Some Article' });
    expect(result.title).toBe(`Some Article | ${SITE_NAME}`);
  });

  it('blog-index pageType provides a non-empty default description', () => {
    const result = generateSeo({ locale: 'en', pageType: 'blog-index' });
    expect(result.description.length).toBeGreaterThan(0);
  });

  it('legal pageType EN returns "Legal | Tobias"', () => {
    const result = generateSeo({ locale: 'en', pageType: 'legal' });
    expect(result.title).toBe(`Legal | ${SITE_NAME}`);
  });

  it('generic pageType falls back to same behavior as no pageType', () => {
    const resultNoType = generateSeo({ locale: 'en' });
    const resultGeneric = generateSeo({ locale: 'en', pageType: 'generic' });
    expect(resultGeneric.title).toBe(resultNoType.title);
    expect(resultGeneric.description).toBe(resultNoType.description);
  });
});
