export const fields = ["date", "product", "category", "revenue", "orders"];
export function validate(rows) {
  return (
    Array.isArray(rows) &&
    rows.length <= 10000 &&
    rows.every(
      (r) =>
        r &&
        typeof r.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(r.date) &&
        !Number.isNaN(Date.parse(r.date)) &&
        new Date(r.date).toISOString().slice(0, 10) === r.date &&
        typeof r.product === "string" &&
        r.product.length > 0 &&
        r.product.length <= 120 &&
        typeof r.category === "string" &&
        r.category.length > 0 &&
        r.category.length <= 80 &&
        Number.isFinite(r.revenue) &&
        r.revenue >= 0 &&
        r.revenue <= 1e10 &&
        Number.isInteger(r.orders) &&
        r.orders >= 0 &&
        r.orders <= 1e8,
    )
  );
}
export function parseCSV(text) {
  if (text.length > 2000000) throw Error("CSV must be smaller than 2 MB.");
  text = text.replace(/^\uFEFF/, "");
  let rows = [],
    row = [],
    cell = "",
    quoted = false,
    closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += c;
    } else if (c === '"') {
      if (cell || closed) throw Error("Unexpected quote in CSV.");
      quoted = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
      closed = false;
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((s) => s.trim())) rows.push(row);
      row = [];
      cell = "";
      closed = false;
    } else {
      if (closed) throw Error("Unexpected text after quoted value.");
      cell += c;
    }
  }
  if (quoted) throw Error("Unclosed quoted value.");
  row.push(cell);
  if (row.some((s) => s.trim())) rows.push(row);
  if (rows.length < 2)
    throw Error("Include a header and at least one data row.");
  const headers = rows.shift().map((x) => x.trim().toLowerCase());
  if (headers.length !== 5 || fields.some((f) => !headers.includes(f)))
    throw Error("Use these columns: date, product, category, revenue, orders.");
  const result = rows.map((r, i) => {
    if (r.length !== 5) throw Error(`Row ${i + 2}: expected 5 values.`);
    const out = Object.fromEntries(headers.map((h, j) => [h, r[j].trim()]));
    if (out.revenue === "" || out.orders === "")
      throw Error(`Row ${i + 2}: missing a numeric value.`);
    out.revenue = Number(out.revenue);
    out.orders = Number(out.orders);
    if (!validate([out]))
      throw Error(`Row ${i + 2}: invalid date, text, or non-negative number.`);
    return out;
  });
  if (!validate(result)) throw Error("Limit datasets to 10,000 rows.");
  return result;
}
export function summarize(rows) {
  const revenue =
      rows.reduce((s, r) => s + Math.round(r.revenue * 100), 0) / 100,
    orders = rows.reduce((s, r) => s + r.orders, 0);
  return {
    revenue,
    orders,
    average: orders ? revenue / orders : 0,
    products: new Set(rows.map((r) => r.product)).size,
  };
}
export function toCSV(rows) {
  const safe = (s) => {
    s = String(s);
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return [
    fields.join(","),
    ...rows.map((r) => fields.map((f) => safe(r[f])).join(",")),
  ].join("\n");
}
export const seed = Array.from({ length: 84 }, (_, i) => {
  const category = ["Templates", "Components", "Resources"][i % 3];
  return {
    date: `2026-${i < 42 ? "08" : "09"}-${String(Math.floor((i % 42) / 3) + 1).padStart(2, "0")}`,
    product: ["Studio UI kit", "Motion components", "Design playbook"][i % 3],
    category,
    revenue:
      Math.round((180 + ((i * 73) % 690)) * (i >= 42 ? 1.24 : 1) * 100) / 100,
    orders: 5 + ((i * 7) % 21),
  };
});
