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
    verified: '<path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.053-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.607-.274 1.264-.144 1.898.13.634.435 1.219.88 1.688.47.443 1.054.749 1.688.879.633.13 1.29.083 1.897-.14.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.607.224 1.264.272 1.897.14.634-.13 1.217-.436 1.687-.878.445-.47.75-1.055.88-1.688.13-.634.083-1.291-.14-1.897.586-.274 1.084-.705 1.438-1.246.354-.541.551-1.17.57-1.817Zm-11.343 3.9-3.5-3.5 1.238-1.238 2.262 2.262 5.315-5.315L15.5 8.35l-6.5 6.55Z"/>',
    check: '<path d="m5 12.5 4 4 10-9"/>',
    arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
    external: '<path d="M13 5h6v6M19 5l-8 8M18 14v5H5V6h5"/>',
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
    expanded = false;
  container.innerHTML = `
    <div class="credential-toolbar">
      <div class="credential-filters" role="group" aria-label="Filter certificates">
        ${["All", "Development", "Cloud", "AI fluency"].map((name) => `<button type="button" data-credential-filter="${name}" aria-pressed="${name === category}">${uiIcon(categoryIcon(name), "control-icon")}<span>${name}</span></button>`).join("")}
      </div>
      <p class="credential-count" role="status"></p>
    </div>
    <div class="credential-grid"></div>
    <button class="text-button credential-more" type="button">View all 21 records ${uiIcon("arrow", "control-icon")}</button>`;
  const grid = container.querySelector(".credential-grid"),
    more = container.querySelector(".credential-more");
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
    ) => `<article class="credential-card">
      <div class="credential-card-top"><span>${item.category}</span><span class="credential-top-actions"><a class="credential-verify-badge" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Verify ${escape(item.title)} on Claude Academy"><span class="credential-badge-icon">${uiIcon("verified", "credential-badge-mark")}</span><span>Official</span><span class="credential-badge-external">${uiIcon("external")}</span></a><span class="credential-number">${String(credentials.indexOf(item) + 1).padStart(2, "0")}</span></span></div>
      <a class="credential-card-main" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Verify ${escape(item.title)} on Claude Academy">
        <span class="credential-card-title">${escape(item.title)}</span>
        <span class="credential-card-bottom"><span>Claude Academy<small>September 2026</small></span><span class="credential-open" aria-hidden="true">${uiIcon("arrow", "control-icon")}</span></span>
      </a>
    </article>`,
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
    grid.children[6]?.querySelector(".credential-card-main")?.focus();
  });
  render();
}
