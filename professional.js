import { projects, githubBase } from "./projects.js";

const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
const projectById = new Map(projects.map((project) => [project.id, project]));
let componentCount = 0;
const uiIcon = (name, className = "") => {
  const icons = {
    arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
    play: '<path d="m9 6 9 6-9 6Z"/>',
    source: '<path d="m9 7-5 5 5 5M15 7l5 5-5 5M13 4l-2 16"/>',
    interface: '<path d="m6 4 12 8-6 1-3 6L6 4Z"/>',
    backend:
      '<ellipse cx="12" cy="6" rx="6" ry="2.5"/><path d="M6 6v6c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6M6 12v6c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-6"/>',
    systems:
      '<circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="7" r="2"/><circle cx="19" cy="7" r="2"/><circle cx="19" cy="18" r="2"/><path d="m7 8 3 2M14 10l3-2M14 14l3 3M10 14l-3 3"/>',
    delivery: '<path d="m5 13 4 4L19 7"/><path d="M12 3a9 9 0 1 0 9 9"/>',
  };
  return `<svg class="ui-icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || icons.arrow}</svg>`;
};

const technologies = [
  {
    id: "interface",
    name: "Interface",
    description: "The controls, canvases, and screens people touch.",
    items: [
      {
        id: "javascript",
        name: "JavaScript",
        title: "Small browser systems, composed in modules.",
        description:
          "Native modules, browser events, and small state models power the interactive projects. The screen stays close enough to the model to be explained.",
        projects: ["orbit", "prism"],
        proof:
          "Orbit validates task state before saving. Prism separates CSV parsing and aggregation from its charts.",
      },
      {
        id: "react",
        name: "React",
        title: "Screens with a job to do.",
        description:
          "React handles the screens and controls that need to change. Server concerns stay outside the presentation layer, where they can be tested on their own.",
        projects: ["ledger", "shader"],
        proof:
          "Freelance Ledger uses Next.js Server Actions. Shader Play connects React controls to GPU shader uniforms.",
      },
      {
        id: "typescript",
        name: "TypeScript",
        title: "Types at the boundaries.",
        description:
          "Types describe the data moving between forms, domain logic, and server operations before a request reaches the database.",
        projects: ["headers", "ledger"],
        proof:
          "Headerwatch isolates its grading module. Ledger represents monetary amounts in integer minor units.",
      },
      {
        id: "next",
        name: "Next.js",
        title: "One request path, end to end.",
        description:
          "Next.js ties application routes to server operations and account access without hiding the data boundary.",
        projects: ["ledger", "headers"],
        proof:
          "Both repositories include account-based features backed by Supabase. Running them requires a Supabase configuration.",
      },
      {
        id: "svg",
        name: "SVG",
        title: "Graphics with a data model.",
        description:
          "SVG turns diagrams and charts into real interface objects with editable geometry, keyboard input, and exportable output.",
        projects: ["canvas", "prism"],
        proof:
          "Canvas Rooms exports the real diagram as SVG. Prism draws its charts from the imported and filtered dataset.",
      },
    ],
  },
  {
    id: "backend",
    name: "Server & data",
    description: "Where inputs are checked and state is kept.",
    items: [
      {
        id: "node",
        name: "Node.js",
        title: "Keep the backend close to the model.",
        description:
          "Local HTTP APIs validate writes, run the same domain logic as the browser, and expose state that can be inspected after a restart.",
        projects: ["relay", "canvas"],
        proof:
          "Relay runs the same execution engine in Node and the browser. Canvas Rooms can stream persisted operations over SSE.",
      },
      {
        id: "sqlite",
        name: "SQLite",
        title: "A restart should not erase the work.",
        description:
          "SQLite stores validated application data locally. The hosted demos use browser storage, while the repositories include optional Node servers for durable state.",
        projects: ["orbit", "canvas"],
        proof:
          "Server tests restart the process and check that saved boards and canvas operations can be recovered.",
      },
      {
        id: "postgres",
        name: "PostgreSQL",
        title: "Account-scoped data, enforced in the database.",
        description:
          "PostgreSQL backs account-scoped records, with access rules treated as part of the application design rather than a later patch.",
        projects: ["ledger", "headers"],
        proof:
          "Freelance Ledger uses Row Level Security to separate account data. Headerwatch saves authenticated scan history.",
      },
      {
        id: "supabase",
        name: "Supabase",
        title: "Sign-in tied to the record.",
        description:
          "Supabase Auth and PostgreSQL connect a sign-in to the records that account is allowed to read and write.",
        projects: ["ledger", "headers"],
        proof:
          "Email-link sign-in and account-scoped records are implemented in source. These features require configured Supabase credentials.",
      },
    ],
  },
  {
    id: "systems",
    name: "Systems & graphics",
    description: "Workers, shaders, schedulers, and shared state.",
    items: [
      {
        id: "webgl",
        name: "WebGL / GLSL",
        title: "Put the pixels on the GPU.",
        description:
          "Shader programs turn time, coordinates, and pointer input into pixels and particle motion without asking the CPU to draw each point.",
        projects: ["spectra", "shader"],
        proof:
          "Spectra keeps the last valid program after a compile error, cleans up failed resources, and pauses rendering when hidden.",
      },
      {
        id: "workers",
        name: "Web Workers",
        title: "Run search away from the main thread.",
        description:
          "Path searches run in a module worker while the browser animates the actual visited cells and final route.",
        projects: ["atlas"],
        proof:
          "A* and Dijkstra are checked against an independent shortest-path implementation across 120 seeded maps.",
      },
      {
        id: "algorithms",
        name: "Algorithms",
        title: "Turn system rules into a trace.",
        description:
          "Deterministic models let a visitor reproduce a search or a failed election, change one condition, and see why the outcome changes.",
        projects: ["quorum", "atlas"],
        proof:
          "Quorum checks election safety and committed prefixes through 60 seeded fault schedules. It is an educational simulation in one browser.",
      },
      {
        id: "collaboration",
        name: "Shared state",
        title: "Converge after concurrent edits.",
        description:
          "Field-level operations use logical clocks and stable tie-breaking to bring diagram state into agreement when messages arrive out of order.",
        projects: ["canvas"],
        proof:
          "Tests vary delivery order, clock ties, deletion, and replay. The public demo shares between same-origin tabs in one browser profile.",
      },
    ],
  },
  {
    id: "delivery",
    name: "Delivery",
    description: "Tests and tooling that keep changes shippable.",
    items: [
      {
        id: "testing",
        name: "Testing",
        title: "Test the failure paths.",
        description:
          "Tests challenge invalid inputs, interrupted execution, persistence, and the invariants each project relies on when the happy path disappears.",
        projects: ["canvas", "quorum"],
        proof:
          "Canvas checks convergence and SSE replay after persistence. Quorum injects partitions, crashes, and competing writes.",
      },
      {
        id: "actions",
        name: "GitHub Actions",
        title: "Every change gets a check.",
        description:
          "Repository workflows keep validation beside the code being changed, so a result is visible before a feature is called finished.",
        projects: ["ledger", "headers"],
        proof:
          "Both source repositories include automated checks. The public repository is the place to inspect the workflow and its latest run.",
      },
      {
        id: "docker",
        name: "Docker",
        title: "A clean start on another machine.",
        description:
          "A container configuration documents the runtime and gives another developer a consistent starting point for running the project.",
        projects: ["ledger"],
        proof:
          "Freelance Ledger includes Docker configuration. Supabase and other application environment values still need to be supplied.",
      },
    ],
  },
];

function resolveElement(value) {
  return typeof value === "string" ? document.querySelector(value) : value;
}

function projectLink(id, label) {
  const project = projectById.get(id);
  return `<a href="${escapeHTML(project.demo || `${githubBase}${project.repo}`)}"${project.demo ? "" : ' target="_blank" rel="noopener noreferrer"'}>${uiIcon(project.demo ? "play" : "source", "control-icon")}${escapeHTML(label || project.name)}</a>`;
}

export function initTimeline(target) {
  const mount = resolveElement(target);
  if (!mount) return;
  mount.innerHTML = `
    <div class="section-title professional-heading">
      <div><p class="eyebrow">WORK / EXPERIENCE</p><h2>From platform work<br>to edge cases.</h2></div>
      <p>At Cipher30 I own the work around an online education platform: product UI, services, data, releases, member access, and first-line support.</p>
    </div>
    <ol class="experience-track">
      <li class="experience-entry">
        <div class="experience-date"><span class="experience-marker" aria-hidden="true"></span><span>JAN 2024</span><span>TO PRESENT</span><span class="experience-kind">Self-employed</span></div>
        <div class="experience-content">
          <div class="experience-role"><div><h3>Founder & Full-Stack Developer</h3><a class="experience-company" href="https://cipher30mentorship.com" target="_blank" rel="noopener noreferrer">Cipher30 ${uiIcon("external", "control-icon")}</a></div><span class="experience-location">Cape Town / Remote</span></div>
          <p>I develop and operate the platform end to end. I ship the Next.js, React, and TypeScript interface, build Node.js services and SQLite-backed automation, and handle hosting, DNS, deployments, and first-line support.</p>
          <div class="experience-tags" aria-label="Technologies used"><span>Next.js</span><span>React</span><span>TypeScript</span><span>Node.js</span><span>SQLite</span></div>
          <div class="experience-scope" aria-label="Cipher30 areas of ownership">
            <div class="experience-scope-heading"><span class="experience-scope-label">OWNED SURFACE</span><p>One role across four connected layers.</p></div>
            <div class="experience-scope-grid">
              <article class="experience-scope-item"><span class="experience-scope-index">01</span>${uiIcon("interface", "experience-scope-icon")}<h4>Product</h4><p>Next.js, React, and TypeScript interface work.</p></article>
              <article class="experience-scope-item"><span class="experience-scope-index">02</span>${uiIcon("backend", "experience-scope-icon")}<h4>Services</h4><p>Node.js services, SQLite data, and Discord automation.</p></article>
              <article class="experience-scope-item"><span class="experience-scope-index">03</span>${uiIcon("delivery", "experience-scope-icon")}<h4>Release</h4><p>Hosting, domains, DNS, and deployments.</p></article>
              <article class="experience-scope-item"><span class="experience-scope-index">04</span>${uiIcon("systems", "experience-scope-icon")}<h4>Member path</h4><p>Lead capture, pipeline tracking, paid-member roles, and support.</p></article>
            </div>
          </div>
          <details class="experience-details">
            <summary><span>What I shipped</span><span class="experience-toggle" aria-hidden="true"></span></summary>
            <div class="experience-notes"><article><span class="experience-note-label">PERFORMANCE / IOS SAFARI</span><h4>Removed scroll contention.</h4><p>Removed a conflicting scroll library, moved carousel updates onto requestAnimationFrame, and isolated frequent clock updates.</p></article><article><span class="experience-note-label">OPERATIONS / DISCORD</span><h4>Connected lead capture and access.</h4><p>Built a Node.js and discord.js v14 bot with SQLite for source attribution, pipeline tracking, and paid-member role commands.</p></article></div>
          </details>
        </div>
      </li>
      <li class="experience-entry">
        <div class="experience-date"><span class="experience-marker" aria-hidden="true"></span><span>SEP 2026</span><span class="experience-kind">Independent projects</span></div>
        <div class="experience-content">
          <div class="experience-role"><div><h3>Independent software projects</h3><span class="experience-company">Personal builds / open source</span></div><span class="experience-location">GitHub / browser demos</span></div>
          <p>I build focused browser labs to make difficult behavior visible: concurrent edits, leader elections, retries, shader compilation, and pathfinding.</p>
          <div class="experience-project-links">${projectLink("canvas")}${projectLink("quorum")}${projectLink("relay")}</div>
          <details class="experience-details">
            <summary><span>Open the hard parts</span><span class="experience-toggle" aria-hidden="true"></span></summary>
            <div class="experience-notes"><article><h4>Open in the browser</h4><p>Each featured project runs in the browser. Source repositories include implementation notes, tests, and the limits of the hosted demo.</p></article><article><h4>Follow the state</h4><p>Changes merge across tabs in Canvas Rooms. Quorum Lab exposes elections and log entries. Relay Workflows records branches, inputs, and retry attempts.</p></article></div>
          </details>
        </div>
      </li>
    </ol>`;
}

function projectEvidence(project) {
  return `<article class="stack-evidence-project"><div class="stack-evidence-type">${escapeHTML(project.demo ? "LIVE DEMO" : "SOURCE REPO")}</div><h4>${escapeHTML(project.name)}</h4><p>${escapeHTML(project.summary)}</p><div class="stack-evidence-links">${project.demo ? `<a href="${escapeHTML(project.demo)}">${uiIcon("play", "control-icon")}Launch demo</a>` : ""}<a href="${escapeHTML(githubBase + project.repo)}" target="_blank" rel="noopener noreferrer">${uiIcon("source", "control-icon")}View repository</a></div></article>`;
}

export function initTechnologyStack(target) {
  const mount = resolveElement(target);
  if (!mount) return;
  const prefix = `professional-stack-${++componentCount}`;
  let activeCategory = 0;
  let activeTechnology = 0;
  mount.innerHTML = `
    <div class="section-title professional-heading"><div><p class="eyebrow">STACK / IN USE</p><h2>Every tool has a job.</h2></div><p>Select a tool to see the project, implementation choice, and source behind it.</p></div>
    <div class="stack-explorer">
      <div class="stack-layers" role="tablist" aria-label="Technology categories" aria-orientation="vertical">${technologies.map((category, index) => `<button type="button" role="tab" class="stack-layer" id="${prefix}-tab-${index}" aria-selected="${index === 0}" aria-controls="${prefix}-panel" tabindex="${index === 0 ? 0 : -1}" data-stack-category="${index}"><span class="stack-layer-number" aria-hidden="true">0${index + 1}</span>${uiIcon(category.id, `stack-category-icon stack-category-icon-${category.id}`)}<span><strong>${escapeHTML(category.name)}</strong><small>${escapeHTML(category.description)}</small></span><span class="stack-layer-arrow" aria-hidden="true">${uiIcon("arrow")}</span></button>`).join("")}</div>
      <div class="stack-panel" id="${prefix}-panel" role="tabpanel" aria-labelledby="${prefix}-tab-0" tabindex="0"><div class="stack-technologies" role="group" aria-label="Technologies in the selected category"></div><div class="stack-detail"></div></div>
    </div><p class="professional-sr-only" role="status" aria-live="polite"></p>`;
  const panel = mount.querySelector(".stack-panel");
  const choices = mount.querySelector(".stack-technologies");
  const detail = mount.querySelector(".stack-detail");
  const status = mount.querySelector('[role="status"]');
  const tabs = [...mount.querySelectorAll("[data-stack-category]")];

  function renderDetail(announce = true) {
    const category = technologies[activeCategory];
    const technology = category.items[activeTechnology];
    choices
      .querySelectorAll("[data-stack-technology]")
      .forEach((button, index) =>
        button.setAttribute("aria-pressed", String(index === activeTechnology)),
      );
    detail.innerHTML = `<div class="stack-detail-heading"><span class="stack-selected-label">${escapeHTML(technology.name)}</span><span class="stack-project-count">Used in ${technology.projects.length} ${technology.projects.length === 1 ? "project" : "projects"}</span></div><h3>${escapeHTML(technology.title)}</h3><p class="stack-description">${escapeHTML(technology.description)}</p><div class="stack-evidence">${technology.projects.map((id) => projectEvidence(projectById.get(id))).join("")}</div><div class="stack-proof"><span class="stack-proof-label">CODE CHECK</span><p>${escapeHTML(technology.proof)}</p></div>`;
    if (announce)
      status.textContent = `${technology.name}: showing ${technology.projects.length} ${technology.projects.length === 1 ? "project" : "projects"}.`;
  }

  function renderCategory(announce = true) {
    const category = technologies[activeCategory];
    tabs.forEach((tab, index) => {
      tab.setAttribute("aria-selected", String(index === activeCategory));
      tab.tabIndex = index === activeCategory ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", `${prefix}-tab-${activeCategory}`);
    choices.setAttribute("aria-label", `${category.name} technologies`);
    choices.innerHTML = category.items
      .map(
        (technology, index) =>
          `<button type="button" data-stack-technology="${index}" aria-pressed="${index === activeTechnology}">${escapeHTML(technology.name)}</button>`,
      )
      .join("");
    renderDetail(announce);
  }

  mount.querySelector(".stack-layers").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-stack-category]");
    if (!tab) return;
    activeCategory = Number(tab.dataset.stackCategory);
    activeTechnology = 0;
    renderCategory();
  });
  mount.querySelector(".stack-layers").addEventListener("keydown", (event) => {
    const current = tabs.indexOf(event.target);
    if (current < 0) return;
    let next;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (current + 1) % tabs.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (current + tabs.length - 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    activeCategory = next;
    activeTechnology = 0;
    renderCategory();
    tabs[next].focus();
  });
  choices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-stack-technology]");
    if (!button) return;
    activeTechnology = Number(button.dataset.stackTechnology);
    renderDetail();
  });
  renderCategory(false);
}

export function initProfessional({ timeline, stack } = {}) {
  if (timeline) initTimeline(timeline);
  if (stack) initTechnologyStack(stack);
}
