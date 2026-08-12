import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why I removed Lenis from my production Next.js site",
  description:
    "How a JavaScript smooth-scroll library was quietly making my iOS scroll worse — and what I replaced it with.",
};

export default function Post() {
  return (
    <main className="relative z-10 pt-32 pb-24 px-6 max-w-3xl mx-auto">
      <p className="uppercase tracking-[0.3em] text-xs text-emerald-400 mb-4">
        2026-08-10 · 6 min read
      </p>
      <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
        Why I removed Lenis from my production Next.js site
      </h1>

      <article className="prose">
        <p>
          I ship a Next.js 15 site with a fixed-viewport WebGL background — a React Three
          Fiber scene with glass materials, real-time bloom, and a rotating cluster of
          objects. On desktop it ran at a solid 60 fps. On iPhone the whole site felt
          janky when I swiped through it. Not broken, but visibly stuttery — the kind of
          thing your brain registers as low quality before your eyes can articulate why.
        </p>

        <p>
          I spent a full evening diagnosing it. What I found was three separate systems
          fighting each other for the same compositor budget on every scroll frame. This
          post is about the biggest one: <code>Lenis</code>.
        </p>

        <h2>The setup</h2>

        <p>
          Lenis is a JavaScript smooth-scroll library. It intercepts scroll events, applies
          an inertial easing function, and writes the scroll position back to the browser
          on every requestAnimationFrame tick. On desktop with a scroll wheel it produces
          the buttery, momentum-based scrolling that fancy portfolio sites use.
        </p>

        <p>
          I had added Lenis at the root of my app because a designer friend suggested it
          would make the site "feel more premium." It went in six months ago and I never
          measured whether it was helping. That's on me.
        </p>

        <h2>The problem on iOS Safari</h2>

        <p>
          iOS Safari already has best-in-class native inertial scrolling. Apple engineers
          have spent literal decades on it. When you swipe, the browser's compositor
          animates the scroll position using GPU-accelerated transforms, and it feels
          exactly the way a piece of paper would move if you flicked it.
        </p>

        <p>
          Now consider what happens when Lenis is mounted on top of that:
        </p>

        <ul>
          <li>
            You swipe. iOS Safari begins its native inertial scroll and updates the scroll
            position over the next 300-800 ms.
          </li>
          <li>
            Lenis's rAF loop runs 60 times a second and programmatically writes ITS OWN
            interpolated scroll position back to the browser.
          </li>
          <li>
            Now two systems are trying to control scroll position simultaneously. iOS
            Safari's compositor is trying to smoothly ease from A to B; Lenis is
            overwriting A with its own value on every frame.
          </li>
          <li>
            Result: the two momentum systems fight. What you see is a subtle judder — the
            scroll position doesn't move in the perfectly smooth curve your finger expects.
          </li>
        </ul>

        <p>
          Worse: I had <code>scroll-snap-type: y proximity</code> on my main container to
          softly snap between sections. Lenis's programmatic scroll writes bypass the
          browser's native snap logic entirely, so the snap targets never fire cleanly.
          Instead of easing to a section, the page jerks toward it.
        </p>

        <h2>The fix</h2>

        <p>
          I removed Lenis. Kept the scroll-progress rail (it's just a passive scroll
          listener writing <code>transform: scaleX(p)</code> to a single element). Deleted
          the <code>Lenis</code> import, deleted the rAF loop that drove it. Native iOS
          scroll took over the moment the JS layer got out of its way.
        </p>

        <p>The site immediately felt smoother. Not "measurably better in Chrome DevTools"
          smoother — <em>viscerally</em> smoother. My thumb felt like it was moving the
          page directly, not through a filter.</p>

        <p>
          I also removed <code>className="scroll-smooth"</code> from the <code>&lt;html&gt;</code>
          element. That CSS property is meant for anchor-link jumps, but on a page with
          scroll-snap it fights the snap logic too. I had no anchor links on the landing,
          so the trade-off was one-sided.
        </p>

        <h2>The rule I learned</h2>

        <p>
          <strong>Modern iOS Safari does not need a JavaScript smooth-scroll library.</strong>
          The native inertial scroll IS the smoothness. Any JS layer on top of it is
          fighting the browser, not helping it.
        </p>

        <p>
          Lenis has a real place on desktop-first sites with wheel-heavy interaction,
          where the browser's native wheel-scroll is choppy and JS interpolation genuinely
          smooths it. But on mobile — and any site where mobile is the dominant surface —
          it's actively harmful.
        </p>

        <h2>What I'd tell my past self</h2>

        <p>
          Before adding any library that <em>modifies scroll behaviour</em>, test on a real
          phone. Not Safari on your Mac. Not Chrome DevTools mobile emulation. An actual
          iPhone in your hand. If it feels worse after you add the library, delete the
          library. The bar for adding scroll-fighting code should be extremely high, and
          "makes it feel premium on desktop" isn't enough.
        </p>

        <h2>What I replaced it with</h2>

        <p>
          Nothing. That's the answer for iOS.
        </p>

        <p>
          On the same site I also fixed two other perf issues: pausing the fixed WebGL
          canvas frameloop during scroll (extracted into{" "}
          <a href="https://github.com/cactuscash/use-scroll-pause">use-scroll-pause</a>),
          and rAF-throttling a horizontal carousel scroll handler that was calling
          <code>getBoundingClientRect</code> dozens of times per frame. Case study on both
          is up at{" "}
          <a href="https://github.com/cactuscash/nextjs-ios-scroll-perf">
            nextjs-ios-scroll-perf
          </a>.
        </p>

        <hr className="my-12 border-white/10" />

        <p className="text-sm text-white/60">
          Written by <a href="/">Sa'ood Williams</a>. Full-stack engineer, Next.js /
          TypeScript / WebGL. Available for contract at 20 hrs/week, $120/hr USD. If you
          have a Next.js site that feels wrong on iOS, get in touch.
        </p>
      </article>
    </main>
  );
}
