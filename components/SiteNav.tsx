import Link from "next/link";

export default function SiteNav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-40 h-16 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="font-mono text-sm text-emerald-400 hover:text-emerald-300">
          saoodwilliams.com
        </Link>
        <div className="flex gap-6 text-sm text-white/70">
          <Link href="/#work" className="hover:text-white">Work</Link>
          <Link href="/blog" className="hover:text-white">Blog</Link>
          <Link href="/#contact" className="hover:text-white">Contact</Link>
        </div>
      </div>
    </nav>
  );
}
