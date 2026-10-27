import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog i poradniki",
  description: "Poradniki o druku 3D: wybór filamentu, liczenie kosztów, przechowywanie i pierwsze wydruki.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <h1>Blog i poradniki</h1>
      <p className="lead">Praktyczne wskazówki o filamencie, cenach i pierwszych wydrukach. Bez lania wody.</p>

      {posts.length === 0 ? (
        <p className="muted">Wkrótce pierwsze poradniki.</p>
      ) : (
        <div className="grid">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card post-card">
              <time className="muted" dateTime={post.date}>
                {post.date.split("-").reverse().join(".")}
              </time>
              <h2>{post.title}</h2>
              <p className="muted">{post.description}</p>
              <div className="tag-row">
                {post.tags.map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
