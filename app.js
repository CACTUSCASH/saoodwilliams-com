import { projects, githubBase } from "./projects.js";
import { createPortraitEffect } from "./portrait.js";
import { initProfessional } from "./professional.js";
import { initCredentials } from "./credentials.js";
import { initActivity } from "./activity.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const cleanCopy = (value) =>
  String(value)
    .replace(/[\u2013\u2014]/g, ", ")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .trim();
const uiIcon = (name, className = "") => {
  const icons = {
    arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
    play: '<path d="m9 6 9 6-9 6Z"/>',
    notes:
      '<rect x="6" y="4.5" width="12" height="15" rx="1.5"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    source: '<path d="m9 7-5 5 5 5M15 7l5 5-5 5M13 4l-2 16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14"/>',
    external: '<path d="M13 5h6v6M19 5l-8 8M18 14v5H5V6h5"/>',
    search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4.5 4.5"/>',
    document: '<path d="M7 3.5h7l3 3V20H7zM14 3.5V7h3M9.5 11h5M9.5 14.5h5"/>',
  };
  return `<svg class="ui-icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || icons.arrow}</svg>`;
};
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reduced.matches || read("sw-motion") === "paused";
let toastTimer;

initProfessional({
  timeline: "#experienceTimeline",
  stack: "#technologyStack",
});
initCredentials($("#credentialsGallery"));
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2700);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("#theme").setAttribute(
    "aria-label",
    `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
  );
  $('meta[name="theme-color"]').content =
    theme === "dark" ? "#121212" : "#f7f8fa";
}
applyTheme(read("sw-theme") === "light" ? "light" : "dark");
$("#theme").onclick = () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  write("sw-theme", next);
};

const featured = projects.filter((p) => p.demo);
$("#workCount").textContent = `${featured.length} PROJECTS`;
$("#projectList").dataset.count = String(featured.length);
function sendFrameMotion(frame) {
  frame.contentWindow?.postMessage(
    {
      type: "portfolio-motion",
      paused: paused || frame.dataset.engaged !== "true",
      visible: frame.dataset.visible === "true",
    },
    location.origin,
  );
}
const previewObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const frame = entry.target.querySelector("iframe");
      if (entry.isIntersecting && !frame.getAttribute("src"))
        frame.src = frame.dataset.src;
    }
  },
  // Keep the first frame close enough to feel immediate while avoiding a
  // six-iframe burst when a recruiter lands on the page.
  { rootMargin: "140px" },
);
const frameVisibility = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const frame = entry.target.querySelector("iframe");
      frame.dataset.visible = String(entry.isIntersecting);
      sendFrameMotion(frame);
    }
  },
  { threshold: 0.01 },
);
const previewSizes = new ResizeObserver((entries) => {
  for (const { target, contentRect } of entries) {
    const frame = target.querySelector("iframe");
    const scale = contentRect.width / 1100;
    frame.style.transform = `scale(${scale})`;
    frame.style.height = `${Math.max(530, contentRect.height / scale)}px`;
  }
});
$("#projectList").innerHTML = featured
  .map(
    (p) =>
      `<article class="project" data-category="${p.category}" id="project-${p.id}" style="--screen:${p.screen}"><div class="project-visual"><div class="project-screen"><iframe title="${p.name} preview" data-src="${p.demo}?preview=1" tabindex="-1" aria-hidden="true" inert loading="lazy"></iframe></div><button class="preview-open" data-case="${p.id}" data-initial="demo" aria-label="${p.demoAction} in ${p.name}">${p.demoAction} ${uiIcon("play", "control-icon")}</button></div><div class="project-info"><p class="project-kicker">${p.type}</p><h3>${p.name}</h3><p class="project-summary">${p.summary}</p><p class="project-detail">${p.detail}</p><div class="tags">${p.tags.map((tag) => `<span>${tag}</span>`).join("")}</div><div class="project-actions"><a href="${p.demo}">Open demo ${uiIcon("arrow", "control-icon")}</a><button data-case="${p.id}">Build notes ${uiIcon("notes", "control-icon")}</button><a class="project-source" href="${githubBase + p.repo}" target="_blank" rel="noopener" aria-label="${p.name} source on GitHub">Read source ${uiIcon("source", "control-icon")}</a></div></div></article>`,
  )
  .join("");
$$(".project-screen").forEach((el) => {
  previewObserver.observe(el);
  previewSizes.observe(el);
  frameVisibility.observe(el);
  const frame = el.querySelector("iframe");
  frame.addEventListener("load", () => sendFrameMotion(frame));
  const card = el.closest(".project");
  let pointerInside = false;
  const syncPreview = () => {
    frame.dataset.engaged = String(
      pointerInside || card.matches(":focus-within"),
    );
    sendFrameMotion(frame);
  };
  card.addEventListener("pointerenter", (event) => {
    pointerInside = event.pointerType !== "touch";
    syncPreview();
  });
  card.addEventListener("pointerleave", () => {
    pointerInside = false;
    syncPreview();
  });
  card.addEventListener("focusin", syncPreview);
  card.addEventListener("focusout", () => queueMicrotask(syncPreview));
});
$("#sourceProjects").innerHTML = projects
  .filter((p) => !p.demo)
  .map(
    (p, i) =>
      `<article class="source-row reveal"><span class="source-index">${String(i + featured.length + 1).padStart(2, "0")}</span><div><h3>${p.name}</h3><p>${p.summary}</p></div><span class="source-stack">${p.tags.join(" / ")}</span><button data-case="${p.id}" aria-label="Open build notes for ${p.name}">${uiIcon("notes", "control-icon")}</button></article>`,
  )
  .join("");
$$("[data-filter]").forEach(
  (button) =>
    (button.onclick = () => {
      const filter = button.dataset.filter;
      $$("[data-filter]").forEach((b) => {
        b.classList.toggle("active", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });
      let count = 0;
      $$(".project").forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
        if (!card.hidden) {
          count++;
          card.classList.add("visible");
        }
      });
      $("#workCount").textContent = `${count} PROJECT${count === 1 ? "" : "S"}`;
      $("#projectList").dataset.count = String(count);
      $("#projectList").dataset.filter = filter;
    }),
);

const dialog = $("#caseStudy");
let currentCase = null;
function projectUrlState() {
  const url = new URL(location.href);
  const id = url.searchParams.get("project");
  const project = projects.find((item) => item.id === id);
  if (!project) return null;
  const validTabs = [
    "overview",
    "engineering",
    ...(project.demo ? ["demo"] : []),
  ];
  return {
    id: project.id,
    tab: validTabs.includes(url.searchParams.get("view"))
      ? url.searchParams.get("view")
      : "overview",
  };
}
function writeProjectUrl(id, tab = "overview", mode = "push") {
  const url = new URL(location.href);
  url.searchParams.set("project", id);
  if (tab === "overview") url.searchParams.delete("view");
  else url.searchParams.set("view", tab);
  const state = {
    ...(history.state && typeof history.state === "object"
      ? history.state
      : {}),
    portfolioProject: id,
    portfolioView: tab,
  };
  history[`${mode}State`](state, "", `${url.pathname}${url.search}${url.hash}`);
}
function clearProjectUrl() {
  const url = new URL(location.href);
  if (!url.searchParams.has("project") && !url.searchParams.has("view")) return;
  url.searchParams.delete("project");
  url.searchParams.delete("view");
  history.replaceState(
    history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}
function renderCasePanel(tab, syncUrl = true) {
  const p = currentCase;
  if (!p) return;
  if (syncUrl && dialog.open) writeProjectUrl(p.id, tab, "replace");
  $$(".case-tabs button").forEach((button) => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  const panel = $("#casePanel");
  panel.setAttribute("aria-labelledby", `case-tab-${tab}`);
  if (tab === "overview")
    panel.innerHTML = `<h3>Why I built it</h3><p>${esc(p.challenge)}</p><h3>Try the behavior</h3><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`;
  else if (tab === "engineering")
    panel.innerHTML = `<div class="case-diagram" aria-label="${esc(p.diagram.join(" to "))}">${p.diagram.map((x) => `<span>${esc(x)}</span>`).join('<i aria-hidden="true"></i>')}</div><h3>How it works</h3><p>${esc(p.architecture)}</p><h3>What I checked</h3><p>${esc(p.validation)}</p><h3>Boundaries</h3><p>${esc(p.limits)}</p>`;
  else
    panel.innerHTML = `<iframe class="case-demo" src="${p.demo}" title="${esc(p.name)} interactive demo" allow="clipboard-write"></iframe><p class="case-note">The demo is embedded here. Open it full screen for the complete workspace.</p>`;
}
function openCase(id, tab = "overview", { updateUrl = true } = {}) {
  const p = projects.find((p) => p.id === id);
  if (!p) return;
  const wasOpen = dialog.open;
  const validTabs = ["overview", "engineering", ...(p.demo ? ["demo"] : [])];
  tab = validTabs.includes(tab) ? tab : "overview";
  if (updateUrl) writeProjectUrl(p.id, tab);
  currentCase = p;
  $("#caseType").textContent = p.type;
  $("#caseContent").innerHTML =
    `<h2 id="caseTitle">${esc(p.name)}</h2><p>${esc(p.summary)}</p><div class="case-tabs" role="tablist" aria-label="Project details">${["overview", "engineering", ...(p.demo ? ["demo"] : [])].map((t) => `<button id="case-tab-${t}" role="tab" data-tab="${t}" aria-controls="casePanel">${{ overview: `${uiIcon("notes", "control-icon")}Why it exists`, engineering: `${uiIcon("source", "control-icon")}Inside the build`, demo: `${uiIcon("play", "control-icon")}Run the demo` }[t]}</button>`).join("")}</div><div class="case-panel" id="casePanel" role="tabpanel" tabindex="0"></div><div class="case-links"><a class="button primary" href="${githubBase + p.repo}" target="_blank" rel="noopener">Read the source ${uiIcon("source", "control-icon")}</a>${p.demo ? `<a class="button" href="${p.demo}">Open demo full screen ${uiIcon("external", "control-icon")}</a>` : ""}</div>`;
  renderCasePanel(tab, false);
  if (!wasOpen) dialog.showModal();
  dialog.scrollTop = 0;
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-case]");
  if (button)
    openCase(button.dataset.case, button.dataset.initial || "overview");
  const tab = event.target.closest("[data-tab]");
  if (tab) renderCasePanel(tab.dataset.tab);
});
dialog.addEventListener("keydown", (event) => {
  if (
    !event.target.matches("[role=tab]") ||
    !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
  )
    return;
  event.preventDefault();
  const tabs = $$(".case-tabs button");
  let i = tabs.indexOf(event.target);
  i =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? tabs.length - 1
        : (i + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
          tabs.length;
  renderCasePanel(tabs[i].dataset.tab);
  tabs[i].focus();
});
$(".close-dialog").onclick = () => dialog.close();
dialog.addEventListener("close", () => {
  $("#caseContent").replaceChildren();
  currentCase = null;
  clearProjectUrl();
});
addEventListener("popstate", () => {
  const state = projectUrlState();
  if (!state) {
    if (dialog.open) dialog.close();
    return;
  }
  if (dialog.open && currentCase?.id === state.id)
    renderCasePanel(state.tab, false);
  else openCase(state.id, state.tab, { updateUrl: false });
});
for (const d of $$("dialog"))
  d.addEventListener("click", (event) => {
    if (event.target !== d) return;
    const r = d.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      d.close();
  });
$("#quickOverview").onclick = () => $("#overview").showModal();
$("#closeOverview").onclick = () => $("#overview").close();
const commands = [
  ["Working software", "#work", "Section"],
  ["How I work", "#about", "Section"],
  ["Experience", "#experience", "Section"],
  ["Technology stack", "#technology", "Section"],
  ["Verified training", "#credentials", "Section"],
  ["Source and activity", "#github", "Section"],
  ["Contact", "#contact", "Section"],
  ...featured.map((p) => [p.name, p.demo, "Demo"]),
  ["Download CV (PDF)", "Saood-Williams-CV.pdf", "Document"],
  ["Download CV (Word)", "Saood-Williams-CV.docx", "Document"],
];
function renderCommands() {
  const query = $("#commandSearch").value.toLowerCase();
  $("#commands").innerHTML =
    commands
      .filter((c) => c[0].toLowerCase().includes(query))
      .map(
        ([name, href, type]) =>
          `<a class="command-option" href="${href}">${uiIcon(type === "Demo" ? "play" : type === "Document" ? "document" : "arrow", "control-icon")}<span class="command-option-name">${esc(name)}</span><small>${type}</small></a>`,
      )
      .join("") || "<p>No result. Try a section or project name.</p>";
}
function openNav() {
  if ($("dialog[open]")) return;
  $("#commandSearch").value = "";
  renderCommands();
  $("#quickNav").showModal();
  $("#commandSearch").focus();
}
$("#commandTrigger").onclick = openNav;
$("#closeNav").onclick = () => $("#quickNav").close();
$("#commandSearch").oninput = renderCommands;
$("#commands").onclick = (e) => {
  if (e.target.closest("a")) $("#quickNav").close();
};
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if ($("#quickNav").open) $("#quickNav").close();
    else openNav();
  }
});
$("#copyEmail").onclick = async () => {
  copyEmail();
};
async function copyEmail() {
  try {
    await navigator.clipboard.writeText("saoodwilliams321@gmail.com");
    toast("Email copied.");
  } catch {
    toast("saoodwilliams321@gmail.com");
  }
}
const chatPanel = $("#chatPanel");
const chatTrigger = $("#chatTrigger");
const chatClose = $("#chatClose");
let chatReturnFocus = chatTrigger;
function setChat(open) {
  if (open) chatReturnFocus = document.activeElement;
  chatPanel.hidden = !open;
  chatTrigger.setAttribute("aria-expanded", String(open));
  chatTrigger.classList.toggle("is-open", open);
  if (open) chatPanel.querySelector(".chat-route")?.focus();
  else chatReturnFocus?.focus?.();
}
chatTrigger.onclick = () => setChat(chatPanel.hidden);
chatClose.onclick = () => setChat(false);
$("#chatCopyEmail").onclick = copyEmail;
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !chatPanel.hidden) {
    event.preventDefault();
    setChat(false);
  }
});
document.addEventListener("click", (event) => {
  if (
    !chatPanel.hidden &&
    !chatPanel.contains(event.target) &&
    !chatTrigger.contains(event.target)
  )
    setChat(false);
});

let repos = projects.map((p) => ({
  name: p.repo,
  description: p.summary,
  language: p.tags[0],
  html_url: githubBase + p.repo,
}));
let limit = 6;
function renderRepos() {
  const query = $("#repoSearch").value.toLowerCase();
  const matches = repos.filter((r) =>
    `${r.name} ${r.description || ""} ${r.language || ""} ${Array.isArray(r.topics) ? r.topics.join(" ") : ""}`
      .toLowerCase()
      .includes(query),
  );
  $("#repos").innerHTML =
    matches
      .slice(0, limit)
      .map(
        (r) =>
          `<a class="github-repo" href="${esc(r.html_url)}" target="_blank" rel="noopener"><h3>${esc(r.name)}${uiIcon("external", "control-icon")}</h3><p>${esc(cleanCopy(r.description || "Read the repository for setup, tests, and source."))}</p><span class="repo-language">${esc(r.language || "Source code")}<span>${typeof r.stargazers_count === "number" ? `${r.stargazers_count} ${r.stargazers_count === 1 ? "star" : "stars"}` : "Public source"}</span></span></a>`,
      )
      .join("") ||
    '<p class="repo-empty">No repository matched. Try a name, language, or topic.</p>';
  $("#moreRepos").hidden = matches.length <= limit;
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
async function refreshRepos() {
  try {
    const response = await fetch(
      "https://api.github.com/users/CACTUSCASH/repos?sort=updated&per_page=100",
      { signal: AbortSignal.timeout(6000) },
    );
    if (!response.ok) throw Error();
    const data = await response.json();
    if (!Array.isArray(data)) throw Error();
    repos = data.filter(
      (r) =>
        !r.fork &&
        !r.private &&
        r.owner?.login?.toLowerCase() === "cactuscash" &&
        r.html_url?.toLowerCase().startsWith(githubBase.toLowerCase()),
    );
    $("#githubStatus").textContent =
      `Live from GitHub / ${repos.length} public repositories`;
    renderRepos();
  } catch {
    $("#githubStatus").textContent =
      "GitHub is unavailable / showing selected repositories";
  }
}
refreshRepos();
initActivity($("#githubActivity"));

const pageViewApi = "https://page-views-api.ratneshc.com/api/v1";
const pageViewSite = "cactuscash.github.io";
const pageViewPath = "/saoodwilliams-com/";
async function refreshProfileViews() {
  if (location.hostname !== pageViewSite) return;
  const target = $("#profileViews");
  if (!target) return;
  try {
    const query = `site=${encodeURIComponent(pageViewSite)}&path=${encodeURIComponent(pageViewPath)}`;
    await fetch(`${pageViewApi}/track?${query}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const response = await fetch(`${pageViewApi}/views?${query}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw Error();
    const data = await response.json();
    if (!Number.isSafeInteger(data.views) || data.views < 0) throw Error();
    target.querySelector(".profile-views-value").textContent =
      data.views.toLocaleString("en-GB");
    target.hidden = false;
  } catch {}
}
setTimeout(refreshProfileViews, 1200);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      if (entry.isIntersecting)
        $$("nav a").forEach((a) => {
          const navSection =
            {
              experience: "about",
              technology: "about",
              credentials: "about",
            }[entry.target.id] || entry.target.id;
          const active = a.hash === `#${navSection}`;
          a.classList.toggle("active", active);
          if (active) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
  },
  { rootMargin: "-20% 0px -45% 0px" },
);
["work", "about", "experience", "technology", "credentials", "github"].forEach(
  (id) => sectionObserver.observe($("#" + id)),
);
let scrollQueued = false;
function updateScroll() {
  scrollQueued = false;
  $(".site-header").classList.toggle("scrolled", scrollY > 12);
}
addEventListener(
  "scroll",
  () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateScroll);
    }
  },
  { passive: true },
);
updateScroll();

const portraitGrid =
  matchMedia("(max-width: 600px)").matches || navigator.connection?.saveData
    ? 192
    : 240;
const portraitEffect = createPortraitEffect($("#portraitReveal"), {
  grid: portraitGrid,
  reducedMotion: reduced,
  onState: ({ ready, pinned, paused: effectPaused, unavailable }) => {
    $("#portraitHint").textContent = unavailable
      ? "Sa'ood Williams"
      : effectPaused
        ? "Portrait motion paused"
        : pinned
          ? "Move to explore / tap to reassemble"
          : ready
            ? "Hover to scatter / tap to hold"
            : "Move through the portrait";
  },
});
function applyMotion() {
  document.documentElement.classList.toggle("motion-off", paused);
  $("#footerMotion .motion-label").textContent = paused
    ? "Enable motion"
    : "Pause preview motion";
  $("#footerMotion").setAttribute("aria-pressed", String(paused));
  for (const frame of $$(".project-screen iframe")) sendFrameMotion(frame);
  portraitEffect.setPaused(paused);
}
$("#footerMotion").onclick = () => {
  paused = !paused;
  write("sw-motion", paused ? "paused" : "running");
  applyMotion();
};
reduced.addEventListener("change", (event) => {
  if (event.matches) {
    paused = true;
    applyMotion();
  }
});
applyMotion();
const sharedProject = projectUrlState();
if (sharedProject)
  requestAnimationFrame(() =>
    openCase(sharedProject.id, sharedProject.tab, { updateUrl: false }),
  );
