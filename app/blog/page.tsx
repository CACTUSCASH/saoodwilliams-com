import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "War stories and technical notes on Next.js, WebGL, and web performance.",
};

const POSTS = [
  {
    slug: "removing-lenis",
    title: "Why I removed Lenis from my production Next.js site",
    excerpt:
      "How a JavaScript smooth-scroll library was quietly making my iOS scroll worse — and what I replaced it with.",
    date: "2026-08-10",
    readingTime: "6 min read",
  },
];

export default function BlogIndex() {
  return (
    <main className="relative z-10 pt-32 pb-24 px-6 max-w-3xl mx-auto">
      <p className="uppercase tracking-[0.3em] text-xs text-emerald-400 mb-4">Blog</p>
      <h1 className="text-4xl md:text-5xl font-bold mb-12">War stories and notes.</h1>

      <ul className="space-y-8">
        {POSTS.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="block p-6 rounded-2xl border border-white/10 hover:bg-white/[0.04] hover:border-emerald-500/40 transition"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-xl font-bold text-white">{p.title}</h2>
                <span className="text-xs text-white/40 shrink-0 ml-4">{p.date}</span>
              </div>
              <p className="text-white/70">{p.excerpt}</p>
              <p className="mt-3 text-xs text-emerald-400">{p.readingTime}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
