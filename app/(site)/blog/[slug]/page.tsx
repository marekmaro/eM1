import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { niche } from "@/config/niche";
import { getAllPosts, getPost } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Nie znaleziono" };

  return {
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: "article", publishedTime: post.date },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Dane strukturalne dla wyszukiwarek. "<" zamieniamy na escape, żeby JSON nie zamknął skryptu.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    publisher: { "@type": "Organization", name: niche.brand.name },
  }).replace(/</g, "\\u003c");

  const materialIsCatalogued = post.material !== undefined && niche.materials.includes(post.material);

  return (
    <>
      <p>
        <Link href="/blog">← Wszystkie poradniki</Link>
      </p>
      <article className="article">
        <header className="article-head">
          <time className="muted" dateTime={post.date}>
            {post.date.split("-").reverse().join(".")} · czytanie ok. {post.readingMinutes} min
          </time>
          <h1>{post.title}</h1>
          <p className="lead">{post.description}</p>
          <div className="tag-row">
            {post.tags.map((tag) => (
              <span className="chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Treść pochodzi z plików w repozytorium (content/blog), nie od użytkowników. */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

        {materialIsCatalogued && (
          <aside className="card article-cta">
            <strong>Szukasz {post.material}?</strong>
            <p className="muted">Zobacz aktualne oferty i ceny za {niche.unit.label}.</p>
            <Link className="button" href={`/products?material=${encodeURIComponent(post.material ?? "")}`}>
              Pokaż {post.material} w katalogu
            </Link>
          </aside>
        )}
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </>
  );
}
