import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../src/content');
const OUTPUT_DIR = path.join(__dirname, '../public/api');

const LOCALES = ['en', 'pt-br'];

interface SearchItem {
  title: string;
  summary: string;
  tags: string[];
  category?: string;
  url: string;
  type: 'blog' | 'notes';
}

async function buildIndex() {
  for (const locale of LOCALES) {
    const index: SearchItem[] = [];
    
    // Process Blog
    const blogDir = path.join(CONTENT_DIR, 'blog');
    if (fs.existsSync(blogDir)) {
      const files = fs.readdirSync(blogDir);
      for (const file of files) {
        if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
        
        const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
        const { data } = matter(content);
        
        if (data.language === locale) {
          index.push({
            title: data.title,
            summary: data.summary || '',
            tags: data.tags || [],
            url: locale === 'en' ? `/blog/${data.slug}` : `/pt-br/blog/${data.slug}`,
            type: 'blog'
          });
        }
      }
    }
    
    // Process Notes
    const notesDir = path.join(CONTENT_DIR, 'notes');
    if (fs.existsSync(notesDir)) {
      const files = fs.readdirSync(notesDir);
      for (const file of files) {
        if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
        
        const content = fs.readFileSync(path.join(notesDir, file), 'utf-8');
        const { data } = matter(content);
        
        if (data.language === locale) {
          index.push({
            title: data.title,
            summary: data.summary || '',
            tags: data.tags || [],
            category: data.category,
            url: locale === 'en' ? `/notes/${data.slug}` : `/pt-br/notes/${data.slug}`,
            type: 'notes'
          });
        }
      }
    }
    
    const localeOutputDir = path.join(OUTPUT_DIR, locale);
    if (!fs.existsSync(localeOutputDir)) {
      fs.mkdirSync(localeOutputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(localeOutputDir, 'search-index.json'),
      JSON.stringify(index, null, 2)
    );
    
    console.log(`Built search index for ${locale}: ${index.length} items`);
  }
}

buildIndex().catch(err => {
  console.error('Failed to build search index:', err);
  process.exit(1);
});
