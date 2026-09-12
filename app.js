import { projects, githubBase } from "./projects.js";
import { createSculpture } from "./sculpture.js";

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
    theme === "dark" ? "#121613" : "#f1f0e8";
}
applyTheme(read("sw-theme") === "light" ? "light" : "dark");
$("#theme").onclick = () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  write("sw-theme", next);
  sculpture.redraw();
};
function updateTime() {
  $("#time").textContent =
    new Intl.DateTimeFormat("en-ZA", {
      timeZone: "Africa/Johannesburg",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date()) + " SAST";
}
updateTime();
setInterval(updateTime, 60000);

const featured = projects.filter((p) => p.demo);
function sendFrameMotion(frame) {
  frame.contentWindow?.postMessage(
    {
      type: "portfolio-motion",
      paused,
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
  { rootMargin: "250px" },
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
    frame.style.height = `${Math.max(530, (contentRect.height - 24) / scale)}px`;
  }
});
$("#projectList").innerHTML = featured
  .map(
    (p, i) =>
      `<article class="project reveal" data-category="${p.category}" id="project-${p.id}" style="--wash:${p.wash};--screen:${p.screen}"><div class="project-visual"><span class="visual-number" aria-hidden="true">0${i + 1} / ${p.type}</span><div class="project-screen"><div class="screen-chrome"><span class="screen-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${p.id} / ${p.type.toLowerCase()}</span><span class="arrow" aria-hidden="true"></span></div><iframe title="${p.name} preview" data-src="${p.demo}?preview=1" tabindex="-1" aria-hidden="true" inert loading="lazy"></iframe></div><button class="preview-open" data-case="${p.id}" data-initial="demo">Interact with preview <span class="arrow" aria-hidden="true"></span></button></div><div class="project-info"><p class="project-kicker">0${i + 1} / ${p.type}<span class="status-light" aria-hidden="true"></span></p><h3>${p.name}</h3><p class="project-summary">${p.summary}</p><p class="project-detail">${p.detail}</p><div class="tags">${p.tags.map((tag) => `<span>${tag}</span>`).join("")}</div><div class="project-actions"><a href="${p.demo}">Open demo <span class="arrow" aria-hidden="true"></span></a><button data-case="${p.id}">Behind the build <span class="plus" aria-hidden="true"></span></button></div></div></article>`,
  )
  .join("");
$$(".project-screen").forEach((el) => {
  previewObserver.observe(el);
  previewSizes.observe(el);
  frameVisibility.observe(el);
  const frame = el.querySelector("iframe");
  frame.addEventListener("load", () => sendFrameMotion(frame));
});
$("#sourceProjects").innerHTML = projects
  .filter((p) => !p.demo)
  .map(
    (p, i) =>
      `<article class="source-row reveal"><span class="source-index">0${i + 6}</span><div><h3>${p.name}</h3><p>${p.summary}</p></div><span class="source-stack">${p.tags.join(" / ")}</span><button data-case="${p.id}" aria-label="Read about ${p.name}"><span class="arrow" aria-hidden="true"></span></button></article>`,
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
    }),
);

const dialog = $("#caseStudy");
let currentCase = null;
function renderCasePanel(tab) {
  const p = currentCase;
  if (!p) return;
  $$(".case-tabs button").forEach((button) => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  const panel = $("#casePanel");
  panel.setAttribute("aria-labelledby", `case-tab-${tab}`);
  if (tab === "overview")
    panel.innerHTML = `<h3>The idea</h3><p>${esc(p.challenge)}</p><h3>What you can do</h3><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`;
  else if (tab === "engineering")
    panel.innerHTML = `<div class="case-diagram" aria-label="${esc(p.diagram.join(" to "))}">${p.diagram.map((x) => `<span>${esc(x)}</span>`).join('<i aria-hidden="true"></i>')}</div><h3>How it works</h3><p>${esc(p.architecture)}</p><h3>What was checked</h3><p>${esc(p.validation)}</p><h3>Scope</h3><p>${esc(p.limits)}</p>`;
  else
    panel.innerHTML = `<iframe class="case-demo" src="${p.demo}" title="${esc(p.name)} interactive demo" allow="clipboard-write"></iframe><p class="case-note">The demo runs here. Open it in its own page for more room.</p>`;
}
function openCase(id, tab = "overview") {
  const p = projects.find((p) => p.id === id);
  if (!p) return;
  currentCase = p;
  $("#caseType").textContent = p.type;
  $("#caseContent").innerHTML =
    `<h2 id="caseTitle">${esc(p.name)}</h2><p>${esc(p.summary)}</p><div class="case-tabs" role="tablist" aria-label="Project details">${["overview", "engineering", ...(p.demo ? ["demo"] : [])].map((t) => `<button id="case-tab-${t}" role="tab" data-tab="${t}" aria-controls="casePanel">${{ overview: "Overview", engineering: "Engineering", demo: "Try it here" }[t]}</button>`).join("")}</div><div class="case-panel" id="casePanel" role="tabpanel" tabindex="0"></div><div class="case-links"><a class="button primary" href="${githubBase + p.repo}" target="_blank" rel="noopener">View source <span class="arrow" aria-hidden="true"></span></a>${p.demo ? `<a class="button" href="${p.demo}">Open full demo <span class="arrow" aria-hidden="true"></span></a>` : ""}</div>`;
  renderCasePanel(tab);
  dialog.showModal();
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
  ["Selected work", "#work", "Section"],
  ["About Sa'ood", "#about", "Section"],
  ["GitHub archive", "#github", "Section"],
  ["Get in touch", "#contact", "Section"],
  ...featured.map((p) => [p.name, p.demo, "Demo"]),
  ["Download CV", "Saood-Williams-CV.docx", "Document"],
];
function renderCommands() {
  const query = $("#commandSearch").value.toLowerCase();
  $("#commands").innerHTML =
    commands
      .filter((c) => c[0].toLowerCase().includes(query))
      .map(
        ([name, href, type]) =>
          `<a class="command-option" href="${href}">${esc(name)}<small>${type}</small></a>`,
      )
      .join("") || "<p>No matches. Try a project name.</p>";
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
  try {
    await navigator.clipboard.writeText("saoodwilliams321@gmail.com");
    toast("Email copied.");
  } catch {
    toast("saoodwilliams321@gmail.com");
  }
};

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
    `${r.name} ${r.description || ""} ${r.language || ""}`
      .toLowerCase()
      .includes(query),
  );
  $("#repos").innerHTML =
    matches
      .slice(0, limit)
      .map(
        (r) =>
          `<a class="github-repo" href="${esc(r.html_url)}" target="_blank" rel="noopener"><h3>${esc(r.name)}<span class="arrow" aria-hidden="true"></span></h3><p>${esc(cleanCopy(r.description || "Source code, setup, and documentation on GitHub."))}</p><span class="repo-language">${esc(r.language || "Source code")}<span>${typeof r.stargazers_count === "number" ? `${r.stargazers_count} stars` : "Public source"}</span></span></a>`,
      )
      .join("") ||
    '<p class="repo-empty">No repositories match that search.</p>';
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
      "Selected repositories / live refresh unavailable";
  }
}
refreshRepos();

const reveals = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        reveals.unobserve(entry.target);
      }
  },
  { threshold: 0.08 },
);
$$(".reveal").forEach((el) => reveals.observe(el));
document.documentElement.classList.add("motion-ready");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      if (entry.isIntersecting)
        $$("nav a").forEach((a) => {
          const active = a.hash === `#${entry.target.id}`;
          a.classList.toggle("active", active);
          if (active) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
  },
  { rootMargin: "-20% 0px -45% 0px" },
);
["work", "about", "github"].forEach((id) =>
  sectionObserver.observe($("#" + id)),
);
let scrollQueued = false;
function updateScroll() {
  scrollQueued = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  $(".reading-progress").style.transform =
    `scaleX(${max > 0 ? scrollY / max : 0})`;
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

const sculpture = createSculpture($("#sculpture"), { paused });
function applyMotion() {
  document.documentElement.classList.toggle("motion-off", paused);
  for (const id of ["motionToggle", "footerMotion"])
    $("#" + id).textContent = paused ? "Resume motion" : "Pause motion";
  $("#motionToggle").setAttribute("aria-pressed", String(paused));
  sculpture.setPaused(paused);
  for (const frame of $$(".project-screen iframe")) sendFrameMotion(frame);
}
for (const id of ["motionToggle", "footerMotion"])
  $("#" + id).onclick = () => {
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
$$("[data-shape]").forEach(
  (button) =>
    (button.onclick = () => {
      const shape = button.dataset.shape;
      sculpture.setShape(shape);
      $("#shapeLabel").textContent = {
        orbit: "ORBITAL FIELD",
        sphere: "SPHERICAL FIELD",
        wave: "WAVE FIELD",
      }[shape];
      $$("[data-shape]").forEach((b) => {
        b.classList.toggle("active", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });
    }),
);
const halo = document.createElement("div");
halo.className = "cursor-halo";
halo.setAttribute("aria-hidden", "true");
if (matchMedia("(pointer:fine)").matches && !reduced.matches) {
  document.body.append(halo);
  let queued = false;
  let pointerEvent;
  addEventListener(
    "pointermove",
    (event) => {
      pointerEvent = event;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        halo.classList.toggle("active", !paused);
        halo.classList.toggle(
          "hover",
          !!pointerEvent.target.closest("a,button"),
        );
        halo.style.transform = `translate(${pointerEvent.clientX}px,${pointerEvent.clientY}px)`;
        const visual = pointerEvent.target.closest(".project-visual");
        if (visual) {
          const r = visual.getBoundingClientRect();
          visual.style.setProperty(
            "--mx",
            `${pointerEvent.clientX - r.left}px`,
          );
          visual.style.setProperty("--my", `${pointerEvent.clientY - r.top}px`);
        }
      });
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () =>
    halo.classList.remove("active"),
  );
}
