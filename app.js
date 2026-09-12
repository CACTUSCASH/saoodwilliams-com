const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const base = "https://github.com/CACTUSCASH/";
const cases = {
  orbit: {
    name: "Orbit Workspace",
    type: "PRODUCTIVITY / NEW BUILD",
    intro: "A focused task workspace that makes the next step obvious.",
    challenge:
      "Keep project management useful without burying the work in settings. Orbit gives each task a home and makes progress visible at a glance.",
    features: [
      "Create and edit tasks, priorities, labels, and descriptions.",
      "Move tasks with drag-and-drop or a keyboard-accessible status control.",
      "Search the board, filter by priority, and export your workspace as JSON.",
    ],
    architecture:
      "The frontend uses native JavaScript modules. A Node.js HTTP API validates and persists board snapshots in SQLite using prepared statements. The hosted demo saves to your browser; running the source locally enables the SQLite backend.",
    limits:
      "Single-user MVP. The local API is bound to localhost and has no authentication. The hosted demo uses fictional sample tasks and browser storage.",
    demo: "labs/orbit/",
    repo: "orbit-workspace",
  },
  prism: {
    name: "Prism Analytics",
    type: "DATA / NEW BUILD",
    intro:
      "An analytics workspace that turns a CSV into a conversation with your data.",
    challenge:
      "Make it easy to explore a small sales dataset without uploading it to a third-party analytics platform or setting up a dashboard tool.",
    features: [
      "Import and validate CSV data, including quoted fields and escaped quotes.",
      "Filter dates and categories; calculate revenue, orders, and average order value.",
      "Explore area and bar charts, sort a paginated table, and export filtered data.",
    ],
    architecture:
      "Pure JavaScript parsing and aggregation power SVG charts. The local Node.js API stores validated datasets in SQLite. The static browser demo uses localStorage; CSV processing stays in the browser.",
    limits:
      "Single-user MVP. Maximum 10,000 rows / 2 MB. Revenue is displayed in USD. The supplied dataset is fictional.",
    demo: "labs/prism/",
    repo: "prism-analytics",
  },
  ledger: {
    name: "Freelance Ledger",
    type: "FULL-STACK / EXISTING PROJECT",
    intro:
      "A small invoicing and income tracker for freelancers billing across borders.",
    challenge:
      "Track clients, line-item invoices, and paid versus outstanding totals without mixing currencies or exposing another account’s data.",
    features: [
      "Email-link authentication and per-account access rules.",
      "Invoice line items calculated in integer minor units.",
      "Per-currency summaries and live exchange-rate conversion with a fallback.",
    ],
    architecture:
      "Next.js 14, TypeScript Server Actions, Supabase Auth and PostgreSQL with Row Level Security. Tests cover monetary calculations and exchange-rate handling. Docker and GitHub Actions are included.",
    limits:
      "Source project. Running authenticated features requires your own Supabase configuration.",
    repo: "freelance-ledger",
  },
  headers: {
    name: "Headerwatch",
    type: "SECURITY / EXISTING PROJECT",
    intro: "Turn HTTP response headers into a readable security report.",
    challenge:
      "Help people understand which response headers are missing or weak, and track how a saved site’s configuration changes over time.",
    features: [
      "Six weighted HTTP-header checks with pass, warn, or fail results.",
      "An overall score and letter grade.",
      "Email-link authentication for saved sites and scan history.",
    ],
    architecture:
      "Next.js 14 and TypeScript with a pure grading module, an injectable fetch layer, and Supabase Auth/PostgreSQL. Unit tests and a GitHub Actions workflow are included.",
    limits:
      "Source project. Saved sites require Supabase setup. A header score is a focused configuration check, not a complete security audit.",
    repo: "headerwatch",
  },
  shader: {
    name: "Shader Play",
    type: "CREATIVE CODE / EXISTING PROJECT",
    intro:
      "A GPU-driven particle playground built around a custom vertex shader.",
    challenge:
      "Move particle evolution onto the GPU and expose creative controls without recalculating every particle on the CPU.",
    features: [
      "A 50,000-point particle scene.",
      "Controls for particle count, size, gravity, spread, and palette.",
      "Custom GLSL shaders with React Three Fiber.",
    ],
    architecture:
      "Next.js 15, TypeScript, React Three Fiber, and GLSL. Time and particle seeds drive positions in the shader; controls update uniforms.",
    limits:
      "Source project. WebGL support and actual performance depend on the device.",
    repo: "shader-play",
  },
};
// Source links point to the independently runnable project repositories.
const sourceUrl = (c) => base + c.repo;
const dialog = $("#caseStudy");
document.querySelectorAll("[data-project]").forEach(
  (b) =>
    (b.onclick = () => {
      const c = cases[b.dataset.project];
      $("#caseContent").innerHTML =
        `<p class="eyebrow">${c.type}</p><h2>${c.name}</h2><p>${c.intro}</p><h3>The idea</h3><p>${c.challenge}</p><h3>What it does</h3><ul>${c.features.map((x) => `<li>${x}</li>`).join("")}</ul><h3>Under the hood</h3><p>${c.architecture}</p><h3>Scope</h3><p>${c.limits}</p><a class="button primary" href="${sourceUrl(c)}" target="_blank" rel="noopener">View source ↗</a> ${c.demo ? `<a class="button" href="${c.demo}">Try the demo ↗</a>` : ""}`;
      dialog.showModal();
    }),
);
$(".close-dialog").onclick = () => dialog.close();
dialog.onclick = (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
};
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("#theme").setAttribute(
    "aria-label",
    `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
  );
  $('meta[name="theme-color"]').content =
    theme === "dark" ? "#111311" : "#f2f3ed";
}
try {
  applyTheme(localStorage.getItem("sw-theme") === "light" ? "light" : "dark");
} catch {}
$("#theme").onclick = () => {
  const theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(theme);
  try {
    localStorage.setItem("sw-theme", theme);
  } catch {}
};
const updateTime = () =>
  ($("#time").textContent =
    new Intl.DateTimeFormat("en-ZA", {
      timeZone: "Africa/Johannesburg",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date()) + " SAST");
updateTime();
setInterval(updateTime, 60000);
let toastTimer;
function toast(s) {
  $("#toast").textContent = s;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2500);
}
$("#copyEmail").onclick = async () => {
  try {
    await navigator.clipboard.writeText("saoodwilliams321@gmail.com");
    toast("Email copied. Let’s build something.");
  } catch {
    toast("saoodwilliams321@gmail.com");
  }
};
function progress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  $("#progress").style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
}
addEventListener("scroll", progress, { passive: true });
const fallback = [
  {
    name: "freelance-ledger",
    description: "Multi-currency invoicing with account-scoped access.",
    language: "TypeScript",
  },
  {
    name: "headerwatch",
    description: "HTTP security-header scoring and saved scan history.",
    language: "TypeScript",
  },
  {
    name: "shader-play",
    description: "GPU-driven particles with custom GLSL and live controls.",
    language: "TypeScript",
  },
  {
    name: "appfill",
    description:
      "A local-first Chrome extension for repetitive application fields.",
    language: "JavaScript",
  },
  {
    name: "mcp-headers",
    description: "HTTP security-header checks for AI agents through MCP.",
    language: "TypeScript",
  },
  {
    name: "mcp-sqlite",
    description: "Read-only SQLite access through the Model Context Protocol.",
    language: "TypeScript",
  },
].map((r) => ({ ...r, html_url: base + r.name }));
let repos = fallback,
  limit = 6;
function renderRepos() {
  const query = $("#repoSearch").value.toLowerCase(),
    filtered = repos.filter((r) =>
      `${r.name} ${r.description || ""} ${r.language || ""}`
        .toLowerCase()
        .includes(query),
    );
  $("#repos").innerHTML =
    filtered
      .slice(0, limit)
      .map(
        (r) =>
          `<a class="github-repo" href="${esc(r.html_url)}" target="_blank" rel="noopener"><h3>${esc(r.name)}<span>↗</span></h3><p>${esc(r.description || "Explore the source code, setup, and documentation on GitHub.")}</p><span>${esc(r.language || "Source code")}<span>${typeof r.stargazers_count === "number" ? `☆ ${r.stargazers_count}` : "PUBLIC REPOSITORY"}</span></span></a>`,
      )
      .join("") ||
    '<p class="repo-empty">No repositories match that search. Try another keyword.</p>';
  $("#moreRepos").hidden = filtered.length <= limit;
}
$("#repoSearch").oninput = () => {
  limit = 6;
  renderRepos();
};
$("#moreRepos").onclick = () => {
  limit += 9;
  renderRepos();
};
renderRepos();
try {
  const r = await fetch(
    "https://api.github.com/users/CACTUSCASH/repos?sort=updated&per_page=100",
    { signal: AbortSignal.timeout(6000) },
  );
  if (!r.ok) throw Error();
  const data = await r.json();
  if (!Array.isArray(data)) throw Error();
  repos = data.filter(
    (r) =>
      !r.fork &&
      !r.private &&
      r.owner?.login === "CACTUSCASH" &&
      r.html_url?.startsWith(base),
  );
  $("#githubStatus").textContent =
    `Live from GitHub · ${repos.length} public repositories`;
  renderRepos();
} catch {
  $("#githubStatus").textContent =
    "Selected repositories · live update unavailable";
}
