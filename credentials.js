// Public course-completion records listed on Sa'ood's LinkedIn profile.
// Reviewed 12 September 2026. Verification links point to the issuer.
export const credentials = [
  [
    "Building with the Claude API",
    "d10edfa7e51c845d7e9cbd0af8619856",
    "Development",
  ],
  [
    "Model Context Protocol: Advanced Topics",
    "7926a4cf0aab8da64aef92c15c951af8",
    "Development",
  ],
  [
    "Introduction to Model Context Protocol",
    "f00bd8479f3fd7168a34bdbc27eab55c",
    "Development",
  ],
  [
    "Claude with Google Cloud's Vertex AI",
    "1396c01b53dab7a2f5c10ef748803dc6",
    "Cloud",
  ],
  ["Claude with Amazon Bedrock", "3e680e2f71c596879119ea0998af13d9", "Cloud"],
  ["Claude Code in Action", "8060dbac00727c291fd4abefe23e2862", "Development"],
  ["Claude Code 101", "f66e6b443cf7d79d1c3410d7b0ac5288", "Development"],
  ["Claude Platform 101", "989f00522dd0da252b42f5f2d60a680d", "Development"],
  [
    "AI Fluency for Builders",
    "4245b9e3522a914d031a010cfd5a1b0e",
    "Development",
  ],
  [
    "Deploying Claude Enterprise with Confidence: The five decisions that shape your rollout",
    "0ca50351846b4e2afd8a5c4fcf80a659",
    "Cloud",
  ],
  [
    "Building Effective Human Agent Teams (Beta)",
    "f219aa298412748b209265e5e3fc56f5",
    "AI fluency",
  ],
  [
    "AI Fluency: Framework & Foundations",
    "b2b36518300b20f1291470be673b9fa5",
    "AI fluency",
  ],
  [
    "AI Capabilities and Limitations",
    "661bcbf42399d4e980f855f2a9bdfd47",
    "AI fluency",
  ],
  [
    "AI Fluency for Small Businesses",
    "5f6b4eb9d0c4ddd707a848533c95e63c",
    "AI fluency",
  ],
  [
    "AI Fluency for Creative Work",
    "d5d0964b823b45930184e34ed544560f",
    "AI fluency",
  ],
  ["AI Fluency for students", "63e8814977933044dc0500b8092cf1d8", "AI fluency"],
  [
    "AI Fluency for educators",
    "63bc2ef883415ab87e602211a1387612",
    "AI fluency",
  ],
  [
    "AI Fluency for pK-12 Educators",
    "0d31bd791ab9d15263f45b711e3395fc",
    "AI fluency",
  ],
  ["Teaching AI Fluency", "e659f6d9d916c84bce6284c0424e185f", "AI fluency"],
  [
    "Introduction to Claude Cowork",
    "c7ad49a9cc0aca09e1a09a6b570982a9",
    "AI fluency",
  ],
  ["Claude 101", "bce8e76a004d5f506dea37f146c28fef", "AI fluency"],
].map(([title, id, category]) => ({
  title,
  id,
  category,
  issuer: "Anthropic / Claude Academy",
  issued: "September 2026",
  url: `https://academy.claude.com/verify/${id}`,
}));

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const uiIcon = (name, className = "") => {
  const icons = {
    all: '<path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z"/>',
    development: '<path d="m9 7-5 5 5 5M15 7l5 5-5 5"/>',
    cloud:
      '<path d="M7 17h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 10.5 3.5 3.5 0 0 0 7 17Z"/>',
    ai: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
  };
  return `<svg class="ui-icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || icons.arrow}</svg>`;
};
const categoryIcon = (category) =>
  category === "All"
    ? "all"
    : category === "Development"
      ? "development"
      : category === "Cloud"
        ? "cloud"
        : "ai";

export function initCredentials(container) {
  if (!container) return;
  let category = "All",
    expanded = false,
    opener;
  container.innerHTML = `
    <div class="credential-toolbar">
      <div class="credential-filters" role="group" aria-label="Filter certificates">
        ${["All", "Development", "Cloud", "AI fluency"].map((name) => `<button type="button" data-credential-filter="${name}" aria-pressed="${name === category}">${uiIcon(categoryIcon(name), "control-icon")}<span>${name}</span></button>`).join("")}
      </div>
      <p class="credential-count" role="status"></p>
    </div>
    <div class="credential-grid"></div>
    <button class="text-button credential-more" type="button">View all 21 records ${uiIcon("arrow", "control-icon")}</button>
    <dialog class="credential-dialog" aria-labelledby="credentialTitle">
      <div class="dialog-bar"><span class="eyebrow">Verified course</span><button type="button" class="icon-button" data-close-credential aria-label="Close certificate">${uiIcon("close")}</button></div>
      <div class="credential-sheet"></div>
      <div class="credential-dialog-footer"><span>Open the issuer's record to verify the title, recipient, date, and credential ID.</span><a class="button primary credential-verify" target="_blank" rel="noopener">Verify this record ${uiIcon("external", "control-icon")}</a></div>
    </dialog>`;
  const grid = container.querySelector(".credential-grid"),
    more = container.querySelector(".credential-more"),
    dialog = container.querySelector("dialog");
  function render() {
    const matches = credentials.filter(
      (item) => category === "All" || item.category === category,
    );
    const visible = expanded ? matches : matches.slice(0, 6);
    container.querySelector(".credential-count").textContent =
      `Showing ${visible.length} of ${matches.length} certificates`;
    grid.innerHTML = visible
      .map(
        (
          item,
        ) => `<button type="button" class="credential-card" data-credential="${item.id}" aria-label="Open credential record: ${escape(item.title)}">
      <span class="credential-card-top"><span>${item.category}</span><span class="credential-number">${String(credentials.indexOf(item) + 1).padStart(2, "0")}</span></span>
      <span class="credential-card-title">${escape(item.title)}</span>
      <span class="credential-card-bottom"><span>Claude Academy<small>September 2026</small></span><span class="credential-open" aria-hidden="true">${uiIcon("arrow", "control-icon")}</span></span>
    </button>`,
      )
      .join("");
    more.hidden = expanded || matches.length <= 6;
    more.firstChild.textContent = `View all ${matches.length} records `;
  }
  container.querySelectorAll("[data-credential-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      category = button.dataset.credentialFilter;
      expanded = false;
      container
        .querySelectorAll("[data-credential-filter]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
      render();
    }),
  );
  more.addEventListener("click", () => {
    expanded = true;
    render();
    grid.children[6]?.focus();
  });
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-credential]");
    if (!button) return;
    const item = credentials.find(
      (record) => record.id === button.dataset.credential,
    );
    opener = button;
    container.querySelector(".credential-sheet").innerHTML =
      `<p class="eyebrow">${item.category}</p><h3 id="credentialTitle">${escape(item.title)}</h3><p class="credential-recipient">Sa'ood Williams</p><dl><div><dt>Issued by</dt><dd>${item.issuer}</dd></div><div><dt>Issued</dt><dd>${item.issued}</dd></div><div class="credential-id"><dt>Credential ID</dt><dd>${item.id}</dd></div></dl>`;
    container.querySelector(".credential-verify").href = item.url;
    dialog.showModal();
  });
  container
    .querySelector("[data-close-credential]")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () => opener?.focus());
  render();
}
