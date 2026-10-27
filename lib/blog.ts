import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";

// Artykuły leżą w content/blog/<slug>.md. Każdy plik zaczyna się od nagłówka:
//
// ---
// title: Tytuł artykułu
// description: Krótki opis do wyszukiwarek i listy.
// date: 2026-10-27
// tags: PLA, poradnik
// material: PLA   (opcjonalnie: pokazuje przycisk do katalogu tego materiału)
// ---
//
// Błędny nagłówek przerywa build, zamiast po cichu ukrywać artykuł.

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WORDS_PER_MINUTE = 200;

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  material?: string;
}

export interface Post extends PostMeta {
  html: string;
  readingMinutes: number;
}

function parseFrontmatter(source: string, file: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) throw new Error(`${file}: brak nagłówka --- na początku pliku`);

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (line.trim() === "") continue;
    const separator = line.indexOf(":");
    if (separator === -1) throw new Error(`${file}: nieprawidłowa linia „${line}”`);
    data[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return { data, body: match[2] };
}

function toMeta(slug: string, data: Record<string, string>, file: string): PostMeta {
  if (!SLUG_PATTERN.test(slug)) throw new Error(`${file}: nazwa pliku musi być slugiem (małe litery, myślniki)`);
  for (const key of ["title", "description", "date"]) {
    if (!data[key]) throw new Error(`${file}: brak pola „${key}”`);
  }
  if (!DATE_PATTERN.test(data.date)) throw new Error(`${file}: data musi mieć format RRRR-MM-DD`);

  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    tags: (data.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    material: data.material || undefined,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!existsSync(BLOG_DIR)) return [];

  return readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.slice(0, -3);
      const { data } = parseFrontmatter(readFileSync(path.join(BLOG_DIR, file), "utf8"), file);
      return toMeta(slug, data, file);
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "pl"));
}

export function getPost(slug: string): Post | undefined {
  // Slug trafia do ścieżki pliku, więc walidujemy go przed odczytem. Blokuje to path traversal.
  if (!SLUG_PATTERN.test(slug)) return undefined;

  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!existsSync(file)) return undefined;

  const { data, body } = parseFrontmatter(readFileSync(file, "utf8"), `${slug}.md`);
  const meta = toMeta(slug, data, `${slug}.md`);

  // Treść pochodzi z repozytorium, a nie od użytkowników, więc renderujemy ją jako HTML.
  const html = marked.parse(body, { async: false }) as string;
  const words = body.split(/\s+/).filter(Boolean).length;

  return { ...meta, html, readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
}
