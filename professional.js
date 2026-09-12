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

const technologies = [
  {
    id: "interface",
    name: "Interface",
    description: "What people see and use.",
    items: [
      {
        id: "javascript",
        name: "JavaScript",
        title: "The browser as a workspace.",
        description:
          "Native modules, browser events, and small state models power the interactive projects. Each interface gives the underlying model room to be inspected.",
        projects: ["orbit", "prism"],
        proof:
          "Orbit validates task state before saving. Prism separates CSV parsing and aggregation from its charts.",
      },
      {
        id: "react",
        name: "React",
        title: "Components with a clear job.",
        description:
          "React handles application screens and interactive controls, with server concerns kept outside the presentation layer.",
        projects: ["ledger", "shader"],
        proof:
          "Freelance Ledger uses Next.js Server Actions. Shader Play connects React controls to GPU shader uniforms.",
      },
      {
        id: "typescript",
        name: "TypeScript",
        title: "Explicit contracts, fewer guesses.",
        description:
          "Types describe application data and the boundaries between forms, domain logic, and server operations.",
        projects: ["headers", "ledger"],
        proof:
          "Headerwatch isolates its grading module. Ledger represents monetary amounts in integer minor units.",
      },
      {
        id: "next",
        name: "Next.js",
        title: "From screen to server.",
        description:
          "Application routing, server operations, and account access come together in source projects built around Next.js.",
        projects: ["ledger", "headers"],
        proof:
          "Both repositories include account-based features backed by Supabase. Running them requires a Supabase configuration.",
      },
      {
        id: "svg",
        name: "SVG",
        title: "A drawing you can work with.",
        description:
          "SVG makes diagrams and charts part of the interface, with editable geometry, meaningful interaction, and exportable output.",
        projects: ["canvas", "prism"],
        proof:
          "Canvas Rooms exports the real diagram as SVG. Prism draws its charts from the imported and filtered dataset.",
      },
    ],
  },
  {
    id: "backend",
    name: "Server & data",
    description: "Where state becomes durable.",
    items: [
      {
        id: "node",
        name: "Node.js",
        title: "A small, inspectable backend.",
        description:
          "Local HTTP APIs validate writes, run shared domain logic, and expose the state used by the browser.",
        projects: ["relay", "canvas"],
        proof:
          "Relay runs the same execution engine in Node and the browser. Canvas Rooms can stream persisted operations over SSE.",
      },
      {
        id: "sqlite",
        name: "SQLite",
        title: "State that survives a restart.",
        description:
          "SQLite stores validated application data locally. The public demos use browser storage; the repositories include the optional Node servers.",
        projects: ["orbit", "canvas"],
        proof:
          "Server tests restart the process and check that saved boards and canvas operations can be recovered.",
      },
      {
        id: "postgres",
        name: "PostgreSQL",
        title: "Data with an account boundary.",
        description:
          "PostgreSQL backs account-scoped application records, with database access rules as part of the application design.",
        projects: ["ledger", "headers"],
        proof:
          "Freelance Ledger uses Row Level Security to separate account data. Headerwatch saves authenticated scan history.",
      },
      {
        id: "supabase",
        name: "Supabase",
        title: "Identity and storage together.",
        description:
          "Supabase Auth and PostgreSQL connect sign-in to the records each account can access.",
        projects: ["ledger", "headers"],
        proof:
          "Email-link sign-in and account-scoped records are implemented in source. These features require configured Supabase credentials.",
      },
    ],
  },
  {
    id: "systems",
    name: "Systems & graphics",
    description: "Work beneath the interface.",
    items: [
      {
        id: "webgl",
        name: "WebGL / GLSL",
        title: "Let the GPU do the drawing.",
        description:
          "Shader programs turn time, coordinates, and pointer input into pixels and particle motion.",
        projects: ["spectra", "shader"],
        proof:
          "Spectra keeps the last valid program after a compile error, cleans up failed resources, and pauses rendering when hidden.",
      },
      {
        id: "workers",
        name: "Web Workers",
        title: "Keep the interface responsive.",
        description:
          "Path searches run in a module worker while the browser displays their actual visited order and result.",
        projects: ["atlas"],
        proof:
          "A* and Dijkstra are checked against an independent shortest-path implementation across 120 seeded maps.",
      },
      {
        id: "algorithms",
        name: "Algorithms",
        title: "Make the rules visible.",
        description:
          "Deterministic models let a visitor reproduce a search or a failed election, change one condition, and compare the outcome.",
        projects: ["quorum", "atlas"],
        proof:
          "Quorum checks election safety and committed prefixes through 60 seeded fault schedules. It is an educational simulation in one browser.",
      },
      {
        id: "collaboration",
        name: "Shared state",
        title: "Edits that arrive out of order.",
        description:
          "Field-level operations use logical clocks and stable tie-breaking to bring diagram state into agreement across tabs.",
        projects: ["canvas"],
        proof:
          "Tests vary delivery order, clock ties, deletion, and replay. The public demo shares between same-origin tabs in one browser profile.",
      },
    ],
  },
  {
    id: "delivery",
    name: "Delivery",
    description: "How the work holds up.",
    items: [
      {
        id: "testing",
        name: "Testing",
        title: "Check the behavior that matters.",
        description:
          "Tests challenge invalid inputs, interrupted execution, persistence, and the invariants each project relies on.",
        projects: ["canvas", "quorum"],
        proof:
          "Canvas checks convergence and SSE replay after persistence. Quorum injects partitions, crashes, and competing writes.",
      },
      {
        id: "actions",
        name: "GitHub Actions",
        title: "Checks alongside the source.",
        description:
          "Repository workflows keep validation close to the code being changed.",
        projects: ["ledger", "headers"],
        proof:
          "Both source repositories include automated checks. The public repository is the place to inspect the workflow and its latest run.",
      },
      {
        id: "docker",
        name: "Docker",
        title: "A repeatable application setup.",
        description:
          "A container configuration documents the application runtime and provides a consistent starting point for running the project.",
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
  return `<a href="${escapeHTML(project.demo || `${githubBase}${project.repo}`)}"${project.demo ? "" : ' target="_blank" rel="noopener noreferrer"'}>${escapeHTML(label || project.name)}<span aria-hidden="true">↗</span></a>`;
}

export function initTimeline(target) {
  const mount = resolveElement(target);
  if (!mount) return;
  mount.innerHTML = `
    <div class="section-title professional-heading">
      <div><p class="eyebrow">EXPERIENCE</p><h2>Building, then<br>building on it.</h2></div>
      <p>Running a platform, solving the problems around it, and taking those lessons into new software.</p>
    </div>
    <ol class="experience-track">
      <li class="experience-entry">
        <div class="experience-date"><span class="experience-marker" aria-hidden="true"></span><span>JAN 2024</span><span>TO PRESENT</span><span class="experience-kind">Self-employed</span></div>
        <div class="experience-content">
          <div class="experience-role"><div><h3>Founder & Full-Stack Developer</h3><a class="experience-company" href="https://cipher30mentorship.com" target="_blank" rel="noopener noreferrer">Cipher30 <span aria-hidden="true">↗</span></a></div><span class="experience-location">Cape Town / Remote</span></div>
          <p>I develop and operate an online education platform, from its Next.js, React, and TypeScript interface to hosting, DNS, deployments, and support.</p>
          <div class="experience-tags" aria-label="Technologies used"><span>Next.js</span><span>React</span><span>TypeScript</span><span>Node.js</span><span>SQLite</span></div>
          <details class="experience-details">
            <summary><span>Selected work</span><span class="experience-toggle" aria-hidden="true"></span></summary>
            <div class="experience-notes"><article><h4>Performance on iOS Safari</h4><p>Removed a conflicting scroll library, moved carousel updates onto requestAnimationFrame, and isolated frequent clock updates.</p></article><article><h4>Lead capture and community access</h4><p>Built a Node.js and discord.js v14 bot with SQLite for source attribution, pipeline tracking, and paid community roles.</p></article></div>
          </details>
        </div>
      </li>
      <li class="experience-entry">
        <div class="experience-date"><span class="experience-marker" aria-hidden="true"></span><span>SEP 2026</span><span class="experience-kind">Independent projects</span></div>
        <div class="experience-content">
          <div class="experience-role"><div><h3>Interactive software projects</h3><span class="experience-company">Personal development work</span></div><span class="experience-location">Open source</span></div>
          <p>A collection of working applications and engineering studies, covering shared editing, workflow execution, consensus, graphics, and pathfinding.</p>
          <div class="experience-project-links">${projectLink("canvas")}${projectLink("quorum")}${projectLink("relay")}</div>
          <details class="experience-details">
            <summary><span>Engineering focus</span><span class="experience-toggle" aria-hidden="true"></span></summary>
            <div class="experience-notes"><article><h4>Working interfaces</h4><p>Each featured project runs in the browser. Source repositories include implementation notes, tests, and the limits of the hosted demo.</p></article><article><h4>Inspectable behavior</h4><p>Changes merge across tabs in Canvas Rooms. Quorum Lab exposes elections and log entries. Relay Workflows records branches, inputs, and retry attempts.</p></article></div>
          </details>
        </div>
      </li>
    </ol>`;
}

function projectEvidence(project) {
  return `<article class="stack-evidence-project"><div class="stack-evidence-type">${escapeHTML(project.demo ? "RUNNING DEMO" : "SOURCE PROJECT")}</div><h4>${escapeHTML(project.name)}</h4><p>${escapeHTML(project.summary)}</p><div class="stack-evidence-links">${project.demo ? `<a href="${escapeHTML(project.demo)}">Open project <span aria-hidden="true">↗</span></a>` : ""}<a href="${escapeHTML(githubBase + project.repo)}" target="_blank" rel="noopener noreferrer">Source code <span aria-hidden="true">↗</span></a></div></article>`;
}

export function initTechnologyStack(target) {
  const mount = resolveElement(target);
  if (!mount) return;
  const prefix = `professional-stack-${++componentCount}`;
  let activeCategory = 0;
  let activeTechnology = 0;
  mount.innerHTML = `
    <div class="section-title professional-heading"><div><p class="eyebrow">TECHNOLOGIES</p><h2>Follow the stack.</h2></div><p>Choose a technology to see where it appears in the work, what it does, and the source behind it.</p></div>
    <div class="stack-explorer">
      <div class="stack-layers" role="tablist" aria-label="Technology categories" aria-orientation="vertical">${technologies.map((category, index) => `<button type="button" role="tab" class="stack-layer" id="${prefix}-tab-${index}" aria-selected="${index === 0}" aria-controls="${prefix}-panel" tabindex="${index === 0 ? 0 : -1}" data-stack-category="${index}"><span class="stack-layer-number" aria-hidden="true">0${index + 1}</span><span><strong>${escapeHTML(category.name)}</strong><small>${escapeHTML(category.description)}</small></span><span class="stack-layer-arrow" aria-hidden="true">↗</span></button>`).join("")}</div>
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
    detail.innerHTML = `<div class="stack-detail-heading"><span class="stack-selected-label">${escapeHTML(technology.name)}</span><span class="stack-project-count">${technology.projects.length} ${technology.projects.length === 1 ? "project" : "projects"}</span></div><h3>${escapeHTML(technology.title)}</h3><p class="stack-description">${escapeHTML(technology.description)}</p><div class="stack-evidence">${technology.projects.map((id) => projectEvidence(projectById.get(id))).join("")}</div><div class="stack-proof"><span class="stack-proof-label">IN THE IMPLEMENTATION</span><p>${escapeHTML(technology.proof)}</p></div>`;
    if (announce)
      status.textContent = `${technology.name}: ${technology.projects.length} ${technology.projects.length === 1 ? "project" : "projects"} shown.`;
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
