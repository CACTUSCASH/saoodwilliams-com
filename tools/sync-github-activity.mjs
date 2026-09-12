import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const DAY = 86400000;
export function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Expected an ISO calendar date.");
  const date = new Date(value + "T00:00:00.000Z");
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    throw new Error("Invalid calendar date.");
  return date;
}
function decode(value) {
  return value
    .replace(/&#(?:x([a-f\d]+)|(\d+));/gi, (_, hex, decimal) =>
      String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
function attributes(raw) {
  return Object.fromEntries(
    [...raw.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(
      (match) => [match[1], decode(match[2] ?? match[3])],
    ),
  );
}

export function parseContributionHTML(
  html,
  { username = "CACTUSCASH", fetchedAt = new Date().toISOString() } = {},
) {
  if (typeof html !== "string" || html.length > 4000000)
    throw new Error("Invalid GitHub calendar response.");
  if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(username))
    throw new Error("Invalid GitHub username.");
  if (!Number.isFinite(Date.parse(fetchedAt)))
    throw new Error("Invalid sync timestamp.");
  const tooltips = new Map();
  for (const match of html.matchAll(
    /<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/gi,
  )) {
    const props = attributes(match[1]);
    if (props.for) {
      const label = decode(match[2].replace(/<[^>]*>/g, "")).trim();
      const count = label.match(/^(No|[\d,]+) contributions? on\b/i);
      if (count)
        tooltips.set(
          props.for,
          count[1].toLowerCase() === "no"
            ? 0
            : Number(count[1].replaceAll(",", "")),
        );
    }
  }
  const days = [],
    dates = new Set();
  for (const match of html.matchAll(/<td\b([^>]*)>/gi)) {
    const props = attributes(match[1]);
    if (!props["data-date"]) continue;
    const date = props["data-date"];
    parseDate(date);
    if (dates.has(date)) throw new Error("GitHub returned a duplicate date.");
    dates.add(date);
    const count = tooltips.get(props.id),
      level = Number(props["data-level"]);
    if (!Number.isSafeInteger(count) || count < 0 || count > 1000000)
      throw new Error("A GitHub day is missing a valid contribution count.");
    if (
      !Number.isInteger(level) ||
      level < 0 ||
      level > 4 ||
      (count === 0) !== (level === 0)
    )
      throw new Error("A GitHub day has an invalid activity level.");
    days.push({ date, count, level });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  if (days.length < 7 || days.length > 371)
    throw new Error("Unexpected GitHub calendar length.");
  for (let i = 1; i < days.length; i++)
    if (+parseDate(days[i].date) - +parseDate(days[i - 1].date) !== DAY)
      throw new Error("GitHub calendar contains a missing day.");
  return {
    version: 1,
    username,
    fetchedAt: new Date(fetchedAt).toISOString(),
    source: `https://github.com/users/${username}/contributions`,
    range: { start: days[0].date, end: days.at(-1).date },
    total: days.reduce((sum, day) => sum + day.count, 0),
    days,
  };
}

async function sync() {
  const username = "CACTUSCASH";
  const url = `https://github.com/users/${username}/contributions`;
  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "saoodwilliams-portfolio-activity-sync",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error(`GitHub calendar request failed (${response.status}).`);
  const snapshot = parseContributionHTML(await response.text(), { username });
  const destination = fileURLToPath(
    new URL("../data/github-activity.json", import.meta.url),
  );
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(
    `Saved ${snapshot.days.length} verified days, ${snapshot.total} contributions, ${snapshot.range.start} through ${snapshot.range.end}.`,
  );
  console.log(`Last synced: ${snapshot.fetchedAt}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  sync().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
