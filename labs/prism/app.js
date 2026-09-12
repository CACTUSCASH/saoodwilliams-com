import { $, esc, toast, download, storage } from "./common.js";
import { seed, validate, parseCSV, summarize, toCSV } from "./model.js";
const store = await storage("prism-analytics", seed, validate);
let data = store.data,
  selected = [],
  page = 0,
  sort = "date",
  direction = -1;
const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
function categoryOptions() {
  const current = $("#category").value;
  $("#category").innerHTML =
    "<option>All categories</option>" +
    [...new Set(data.map((r) => r.category))]
      .sort()
      .map((c) => `<option>${esc(c)}</option>`)
      .join("");
  if ([...$("#category").options].some((o) => o.value === current))
    $("#category").value = current;
}
function render() {
  const cat = $("#category").value,
    from = $("#from").value,
    to = $("#to").value;
  if (from && to && from > to) {
    toast("From date must be before the To date.");
    return;
  }
  selected = data.filter(
    (r) =>
      (cat === "All categories" || r.category === cat) &&
      (!from || r.date >= from) &&
      (!to || r.date <= to),
  );
  const m = summarize(selected);
  $("#stats").innerHTML = [
    ["Total revenue", money(m.revenue)],
    ["Orders", m.orders.toLocaleString()],
    ["Average order value", money(m.average)],
    ["Unique products", m.products],
  ]
    .map(
      ([k, v]) =>
        `<div class="stat"><span>${k}</span><strong>${v}</strong></div>`,
    )
    .join("");
  const buckets = Object.create(null);
  for (const r of selected)
    buckets[r.date] =
      (buckets[r.date] || 0) + Math.round(r.revenue * 100) / 100;
  const daily = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b));
  drawChart(daily);
  const totals = Object.create(null);
  for (const r of selected)
    totals[r.category] = (totals[r.category] || 0) + r.revenue;
  $("#categories").innerHTML =
    Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([k, v]) =>
          `<div class="category-row"><div class="category-label"><span>${esc(k)}</span><strong>${money(v)}</strong></div><div class="track"><i style="width:${m.revenue ? (v / m.revenue) * 100 : 0}%"></i></div></div>`,
      )
      .join("") || '<p class="empty">No data in this selection.</p>';
  renderTable();
}
function drawChart(daily) {
  if (!daily.length) {
    $("#chart").innerHTML = '<p class="empty">No data for these filters.</p>';
    return;
  }
  const w = 650,
    h = 200,
    max = Math.max(1, ...daily.map((x) => x[1])) * 1.12,
    x = (i) =>
      50 +
      (daily.length === 1 ? (w - 70) / 2 : (i / (daily.length - 1)) * (w - 70)),
    y = (v) => h - (v / max) * (h - 25);
  let grid = "";
  for (let i = 0; i < 4; i++) {
    const yy = 25 + (i * (h - 25)) / 3;
    grid += `<line x1="50" y1="${yy}" x2="${w}" y2="${yy}" stroke="#e7ecec" stroke-dasharray="3 5"/><text x="0" y="${yy + 4}" fill="#8a989c" font-size="10">${Math.round(max * (1 - i / 3)).toLocaleString()}</text>`;
  }
  const points = daily.map((d, i) => `${x(i)},${y(d[1])}`).join(" ");
  const shape =
    $("#chartType").value === "bar"
      ? daily
          .map(
            (d, i) =>
              `<rect x="${x(i) - Math.min(18, 450 / daily.length) / 2}" y="${y(d[1])}" width="${Math.min(18, 450 / daily.length)}" height="${h - y(d[1])}" fill="#378777" rx="3"><title>${d[0]}: ${money(d[1])}</title></rect>`,
          )
          .join("")
      : `<polygon points="${x(0)},${h} ${points} ${x(daily.length - 1)},${h}" fill="url(#fill)"/><polyline points="${points}" fill="none" stroke="#327e70" stroke-width="3"/>${daily.map((d, i) => `<circle cx="${x(i)}" cy="${y(d[1])}" r="3" fill="#327e70"><title>${d[0]}: ${money(d[1])}</title></circle>`).join("")}`;
  $("#chart").setAttribute(
    "aria-label",
    `Revenue across ${daily.length} days. Total ${money(summarize(selected).revenue)}. Exact data in the table below.`,
  );
  $("#chart").innerHTML =
    `<svg viewBox="0 0 680 240" aria-hidden="true"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#92c2b3" stop-opacity=".55"/><stop offset="1" stop-color="#92c2b3" stop-opacity=".03"/></linearGradient></defs>${grid}${shape}<text x="50" y="230" fill="#8a989c" font-size="10">${daily[0][0]}</text><text x="650" y="230" text-anchor="end" fill="#8a989c" font-size="10">${daily.at(-1)[0]}</text></svg>`;
}
function renderTable() {
  const rows = [...selected].sort(
    (a, b) =>
      direction *
      (typeof a[sort] === "number"
        ? a[sort] - b[sort]
        : a[sort].localeCompare(b[sort])),
  );
  page = Math.max(0, Math.min(page, Math.ceil(rows.length / 10) - 1));
  $("#rows").innerHTML =
    rows
      .slice(page * 10, page * 10 + 10)
      .map(
        (r) =>
          `<tr><td>${esc(r.date)}</td><td>${esc(r.product)}</td><td><span class="pill">${esc(r.category)}</span></td><td>${r.orders}</td><td>${money(r.revenue)}</td></tr>`,
      )
      .join("") ||
    '<tr><td colspan="5" class="empty">No records found.</td></tr>';
  $("#rowCount").textContent =
    `${rows.length.toLocaleString()} records in this selection`;
  $("#page").textContent =
    `Page ${page + 1} of ${Math.max(1, Math.ceil(rows.length / 10))}`;
  $("#prev").disabled = page === 0;
  $("#next").disabled = (page + 1) * 10 >= rows.length;
}
for (const id of ["category", "from", "to", "chartType"])
  $("#" + id).onchange = () => {
    page = 0;
    render();
  };
$("#clear").onclick = () => {
  $("#category").value = "All categories";
  $("#from").value = "";
  $("#to").value = "";
  page = 0;
  render();
};
document.querySelectorAll("[data-sort]").forEach(
  (b) =>
    (b.onclick = () => {
      direction = sort === b.dataset.sort ? -direction : 1;
      sort = b.dataset.sort;
      document
        .querySelectorAll("th")
        .forEach((th) => th.removeAttribute("aria-sort"));
      b.parentElement.setAttribute(
        "aria-sort",
        direction === 1 ? "ascending" : "descending",
      );
      renderTable();
    }),
);
$("#prev").onclick = () => {
  page--;
  renderTable();
};
$("#next").onclick = () => {
  page++;
  renderTable();
};
$("#export").onclick = () =>
  download("prism-selection.csv", toCSV(selected), "text/csv");
$("#sample").onclick = () =>
  download("prism-sample.csv", toCSV(seed), "text/csv");
$("#import").onclick = () => $("#help").showModal();
$("#closeHelp").onclick = () => $("#help").close();
$("#choose").onclick = () => $("#file").click();
$("#file").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 2000000) throw Error("CSV must be smaller than 2 MB.");
    const parsed = parseCSV(await file.text());
    data = parsed;
    const persisted = await store.save(data);
    categoryOptions();
    $("#from").value = "";
    $("#to").value = "";
    $("#category").value = "All categories";
    $("#dataLabel").textContent =
      `Imported dataset · ${file.name} · revenue in USD`;
    page = 0;
    render();
    $("#help").close();
    if (persisted) toast(`Imported ${data.length} rows`);
  } catch (err) {
    toast(err.message);
  }
  e.target.value = "";
};
$("#reset").onclick = async () => {
  if (
    !confirm(
      "Replace this dataset with fictional sample data? Export first to keep your data.",
    )
  )
    return;
  data = structuredClone(seed);
  const persisted = await store.save(data);
  categoryOptions();
  $("#clear").click();
  $("#dataLabel").textContent = "Fictional sample data · revenue in USD";
  if (persisted) toast("Sample data restored");
};
categoryOptions();
$("#dataLabel").textContent =
  JSON.stringify(data) === JSON.stringify(seed)
    ? "Fictional sample data · revenue in USD"
    : "Saved dataset · revenue in USD";
render();
