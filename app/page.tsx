import CinematicHero from "@/components/CinematicHero";
import Link from "next/link";

const PROJECTS = [
  {
    slug: "ios-scroll-perf",
    title: "iOS Scroll-Perf Case Study",
    tagline: "Three scroll-jank bugs on a production Next.js 15 site, diagnosed and fixed.",
    stack: ["Next.js 15", "React Three Fiber", "TypeScript"],
    repo: "https://github.com/cactuscash/nextjs-ios-scroll-perf",
  },
  {
    slug: "cinematic-hero",
    title: "Cinematic WebGL Hero",
    tagline: "Drop-in Next.js hero component — glass materials, real bloom, iOS-smooth.",
    stack: ["React Three Fiber", "@react-three/postprocessing", "TypeScript"],
    repo: "https://github.com/cactuscash/nextjs-cinematic-hero",
  },
  {
    slug: "security-middleware",
    title: "Next.js Security Middleware",
    tagline: "Sliding-window rate limiting + OWASP request scanning, single file.",
    stack: ["Next.js middleware", "TypeScript", "OWASP Top 10"],
    repo: "https://github.com/cactuscash/nextjs-security-middleware",
  },
  {
    slug: "use-scroll-pause",
    title: "use-scroll-pause",
    tagline: "A tiny React hook that pauses expensive work while the user is scrolling.",
    stack: ["React", "TypeScript", "npm"],
    repo: "https://github.com/cactuscash/use-scroll-pause",
  },
  {
    slug: "discord-lead-bot",
    title: "Discord Lead-Capture Bot",
    tagline: "Turns a Discord server into a lead pipeline. Auto-DMs, tracking, slash commands.",
    stack: ["Node.js", "discord.js v14", "SQLite", "Railway"],
    repo: "https://github.com/cactuscash/discord-lead-capture-bot",
  },
];

export default function Home() {
  return (
    <>
      <CinematicHero primary="#22C55E" accent="#3B82F6" count={7} bloomIntensity={0.75} />

      <main className="relative z-10 pointer-events-none">
        {/* HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-16">
          <p className="uppercase tracking-[0.3em] text-xs text-emerald-400 mb-4 pointer-events-auto">
            Cape Town · GMT+2 · Available for contract
          </p>
          <h1 className="text-5xl md:text-7xl font-bold max-w-4xl leading-[1.05]">
            I ship production
            <br />
            <span className="text-emerald-400">Next.js applications</span>
            <br />
            end-to-end.
          </h1>
          <p className="mt-6 max-w-xl text-white/70 text-lg">
            Full-stack engineer. TypeScript, React Three Fiber, Node,
            security-trained (Security+, PenTest+, CASP+). 20 hrs/week, $120/hr USD.
          </p>
          <div className="mt-10 flex gap-4 pointer-events-auto flex-wrap justify-center">
            <a
              href="#contact"
              className="rounded-lg bg-emerald-500 text-black font-semibold px-6 py-3 hover:bg-emerald-400 transition"
            >
              Book a call
            </a>
            <Link
              href="#work"
              className="rounded-lg border border-white/20 px-6 py-3 hover:bg-white/5 transition"
            >
              See the work
            </Link>
          </div>
        </section>

        {/* WORK */}
        <section id="work" className="py-24 px-6 max-w-5xl mx-auto">
          <p className="uppercase tracking-[0.3em] text-xs text-emerald-400 mb-4">
            Selected work
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-12">Open source, production code.</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {PROJECTS.map((p) => (
              <a
                key={p.slug}
                href={p.repo}
                className="pointer-events-auto block p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-emerald-500/40 transition"
              >
                <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
                <p className="text-white/70 text-sm mb-4">{p.tagline}</p>
                <div className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-500/30 rounded px-2 py-1"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section className="py-24 px-6 max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.3em] text-xs text-emerald-400 mb-4">About</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            I build the things I ship, from OS to UI.
          </h2>
          <div className="prose max-w-none">
            <p>
              I graduated with a Higher Certificate in Information Systems (Cyber Security)
              from Eduvos, passing Security+, PenTest+ and CASP+ with distinction. Alongside
              the coursework I taught myself the modern web stack — Next.js, TypeScript,
              React, React Three Fiber — and now ship production applications solo.
            </p>
            <p>
              I diagnose problems across the whole stack. iOS Safari scroll jank on a
              WebGL-heavy landing page. Rate-limiting patterns for a public API. A Discord
              bot that turns a community into a lead pipeline. A Playwright + ffmpeg
              rendering pipeline that took a manual multi-hour job down to minutes.
            </p>
            <p>
              I use AI-augmented workflows heavily — Claude Code with MCP integrations for
              Vercel and GitHub — because that's how modern engineering ships fast in 2026.
              But I own every architectural decision and can walk through every line I've
              shipped.
            </p>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-24 px-6 max-w-3xl mx-auto text-center">
          <p className="uppercase tracking-[0.3em] text-xs text-emerald-400 mb-4">
            Let's talk
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Available for contract work.
          </h2>
          <p className="text-white/70 mb-10">
            20 hrs/week. $120/hr USD. Remote, GMT+2 overlap with EU + US East.
            Best fit: full-stack Next.js, WebGL / R3F, or performance work.
          </p>
          <div className="pointer-events-auto flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a
              href="mailto:saoodwilliams321@gmail.com?subject=Contract%20engagement"
              className="rounded-lg bg-emerald-500 text-black font-semibold px-6 py-3 hover:bg-emerald-400 transition"
            >
              Email me
            </a>
            <a
              href="https://github.com/cactuscash"
              className="rounded-lg border border-white/20 px-6 py-3 hover:bg-white/5 transition"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/cactuscash/"
              className="rounded-lg border border-white/20 px-6 py-3 hover:bg-white/5 transition"
            >
              LinkedIn
            </a>
          </div>
          <p className="mt-16 text-xs text-white/40">
            © 2026 Sa'ood Williams · Cape Town, South Africa
          </p>
        </section>
      </main>
    </>
  );
}
