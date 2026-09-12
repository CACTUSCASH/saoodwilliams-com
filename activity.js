const DAY = 86400000;
const dateValue = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Invalid activity date.");
  const result = Date.parse(value + "T00:00:00.000Z");
  if (
    !Number.isFinite(result) ||
    new Date(result).toISOString().slice(0, 10) !== value
  )
    throw new Error("Invalid activity date.");
  return result;
};
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const displayDate = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateValue(value)));
const fullDate = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateValue(value)));
const countText = (count) =>
  `${count.toLocaleString("en-GB")} contribution${count === 1 ? "" : "s"}`;

export function validateSnapshot(value) {
  if (
    !value ||
    value.version !== 1 ||
    value.username !== "CACTUSCASH" ||
    value.source !== "https://github.com/users/CACTUSCASH/contributions"
  )
    throw new Error("Unexpected activity source.");
  if (
    typeof value.fetchedAt !== "string" ||
    !Number.isFinite(Date.parse(value.fetchedAt))
  )
    throw new Error("Missing activity sync date.");
  if (
    !Array.isArray(value.days) ||
    value.days.length < 7 ||
    value.days.length > 371
  )
    throw new Error("Invalid activity range.");
  let previous;
  for (const day of value.days) {
    const date = dateValue(day.date);
    if (previous !== undefined && date - previous !== DAY)
      throw new Error("Activity dates must be consecutive.");
    if (
      !Number.isSafeInteger(day.count) ||
      day.count < 0 ||
      day.count > 1000000 ||
      !Number.isInteger(day.level) ||
      day.level < 0 ||
      day.level > 4 ||
      (day.count === 0) !== (day.level === 0)
    )
      throw new Error("Invalid activity count or level.");
    previous = date;
  }
  if (
    value.range?.start !== value.days[0].date ||
    value.range?.end !== value.days.at(-1).date
  )
    throw new Error("Activity range does not match its dates.");
  if (value.total !== value.days.reduce((sum, day) => sum + day.count, 0))
    throw new Error("Activity total does not match daily counts.");
  return value;
}

export function selectRange(snapshot, dayCount = 365) {
  validateSnapshot(snapshot);
  if (!Number.isInteger(dayCount) || dayCount < 1 || dayCount > 371)
    throw new Error("Choose a supported day range.");
  const cutoff = dateValue(snapshot.range.end) - (dayCount - 1) * DAY;
  return snapshot.days.filter((day) => dateValue(day.date) >= cutoff);
}

export function summarize(days) {
  let total = 0,
    activeDays = 0,
    longestStreak = 0,
    run = 0,
    previous;
  for (const day of days) {
    const date = dateValue(day.date);
    if (!Number.isSafeInteger(day.count) || day.count < 0)
      throw new Error("Invalid contribution count.");
    if (previous !== undefined && date <= previous)
      throw new Error("Summaries require dates in ascending order.");
    if (previous !== undefined && date - previous !== DAY) run = 0;
    total += day.count;
    if (day.count > 0) {
      activeDays++;
      run++;
      longestStreak = Math.max(longestStreak, run);
    } else run = 0;
    previous = date;
  }
  return { total, activeDays, longestStreak };
}

export function calendarColumns(days) {
  if (!days.length) return [];
  const cells = Array(new Date(dateValue(days[0].date)).getUTCDay()).fill(null);
  for (let i = 0; i < days.length; i++) {
    if (i && dateValue(days[i].date) - dateValue(days[i - 1].date) !== DAY)
      throw new Error("Calendar dates must be consecutive.");
    cells.push(days[i]);
  }
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );
}

export function moveDayIndex(index, key, total) {
  if (
    !Number.isInteger(total) ||
    total < 1 ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= total
  )
    throw new Error("Invalid calendar selection.");
  const candidate =
    key === "Home"
      ? 0
      : key === "End"
        ? total - 1
        : index +
          ({ ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[key] ??
            0);
  return Math.max(0, Math.min(total - 1, candidate));
}

let instance = 0;
export async function initActivity(container, options = {}) {
  if (!container || typeof container.replaceChildren !== "function")
    throw new Error("Provide an activity container.");
  const prefix = `activity-${++instance}`;
  const controller = new AbortController();
  const snapshotUrl =
    options.dataUrl || new URL("./data/github-activity.json", import.meta.url);
  container.classList.add("github-activity");
  container.setAttribute("aria-busy", "true");
  container.innerHTML =
    '<p class="activity-loading" role="status">Loading GitHub contribution history.</p>';
  let snapshot;
  try {
    if (options.snapshot) snapshot = validateSnapshot(options.snapshot);
    else {
      const response = await fetch(snapshotUrl, {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(10000),
        ]),
        cache: "no-cache",
      });
      if (!response.ok) throw new Error("Activity snapshot unavailable.");
      snapshot = validateSnapshot(await response.json());
    }
  } catch {
    container.innerHTML =
      '<div class="activity-unavailable"><p>Contribution history is unavailable right now.</p><a href="https://github.com/CACTUSCASH" target="_blank" rel="noreferrer">View my GitHub profile</a></div>';
    container.removeAttribute("aria-busy");
    return {
      destroy() {
        controller.abort();
        container.replaceChildren();
      },
    };
  }
  container.removeAttribute("aria-busy");
  let range = 365,
    days = selectRange(snapshot, range),
    selected = days.at(-1).date;
  const $ = (selector) => container.querySelector(selector);
  container.innerHTML = `<div class="activity-top"><div><p class="activity-kicker">GITHUB / CONTRIBUTIONS</p><h3 id="${prefix}-title">The work, day by day.</h3></div><div class="activity-range" role="group" aria-label="Contribution date range"><button type="button" data-range="365" aria-pressed="true">365 days</button><button type="button" data-range="90" aria-pressed="false">90 days</button></div></div><div class="activity-summary" aria-live="polite"></div><div class="activity-calendar-wrap"><table class="activity-calendar" role="grid" aria-labelledby="${prefix}-title" aria-describedby="${prefix}-instructions"></table></div><div class="activity-bottom"><p id="${prefix}-instructions" class="activity-instructions">Select a day. Use arrow keys to move through the calendar.</p><div class="activity-legend" aria-label="Contribution intensity from less to more"><span>Less</span>${[0, 1, 2, 3, 4].map((level) => `<i data-level="${level}" aria-hidden="true"></i>`).join("")}<span>More</span></div></div><div class="activity-day-detail"><div class="activity-selected" aria-live="polite" aria-atomic="true"></div><div class="activity-day-controls"><button type="button" data-day="previous" aria-label="Select previous day"><span aria-hidden="true">←</span></button><button type="button" data-day="next" aria-label="Select next day"><span aria-hidden="true">→</span></button><a class="activity-day-link" target="_blank" rel="noreferrer">View on GitHub <span aria-hidden="true">↗</span></a></div></div><div class="activity-source"><p>GitHub profile counts. <span class="activity-dates"></span></p><p>Last synced <time datetime="${escape(snapshot.fetchedAt)}">${displayDate(snapshot.fetchedAt.slice(0, 10))}</time>. <a href="${escape(snapshot.source)}" target="_blank" rel="noreferrer">Source</a></p></div>`;
  function select(date, focus = false) {
    const index = days.findIndex((day) => day.date === date);
    if (index < 0) return;
    selected = date;
    const day = days[index];
    container.querySelectorAll("[data-date]").forEach((button) => {
      const active = button.dataset.date === date;
      button.tabIndex = active ? 0 : -1;
      button.closest("td").setAttribute("aria-selected", String(active));
    });
    $(".activity-selected").innerHTML =
      `<strong>${countText(day.count)}</strong><span>${fullDate(day.date)}</span>`;
    $('[data-day="previous"]').disabled = index === 0;
    $('[data-day="next"]').disabled = index === days.length - 1;
    $(".activity-day-link").href =
      `https://github.com/${snapshot.username}?tab=overview&from=${date}&to=${date}`;
    const button = container.querySelector(`[data-date="${date}"]`);
    if (focus) button.focus({ preventScroll: true });
    if (focus) {
      const wrap = $(".activity-calendar-wrap");
      const bounds = button.getBoundingClientRect(),
        area = wrap.getBoundingClientRect();
      if (bounds.left < area.left || bounds.right > area.right)
        wrap.scrollLeft +=
          bounds.left - area.left - area.width / 2 + bounds.width / 2;
    }
  }
  function render() {
    days = selectRange(snapshot, range);
    const stats = summarize(days),
      columns = calendarColumns(days);
    if (!days.some((day) => day.date === selected)) selected = days.at(-1).date;
    $(".activity-summary").innerHTML =
      `<p><strong>${stats.total.toLocaleString("en-GB")}</strong> contributions</p><p><strong>${stats.activeDays}</strong> active days</p><span>${displayDate(days[0].date)} to ${displayDate(days.at(-1).date)}</span>`;
    $(".activity-dates").textContent =
      "Commits, issues, pull requests and other contribution types as counted by GitHub.";
    const months = [];
    columns.forEach((week, index) => {
      const date =
        index === 0
          ? week.find(Boolean)?.date
          : week.find((day) => day?.date.endsWith("-01"))?.date;
      if (date)
        months.push({
          index,
          name: new Intl.DateTimeFormat("en-GB", {
            month: "short",
            timeZone: "UTC",
          }).format(new Date(dateValue(date))),
        });
    });
    const labels = months
      .map(
        (month, index) =>
          `<th scope="colgroup" colspan="${(months[index + 1]?.index ?? columns.length) - month.index}">${month.name}</th>`,
      )
      .join("");
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    $(".activity-calendar").innerHTML =
      `<thead><tr><th class="activity-weekday" aria-label="Day of week"></th>${labels}</tr></thead><tbody>${weekdays
        .map(
          (weekday, row) =>
            `<tr><th scope="row" class="activity-weekday"><span${row % 2 === 0 ? ' class="activity-sr"' : ""}>${weekday}</span></th>${columns
              .map((week) => {
                const day = week[row];
                return day
                  ? `<td role="gridcell" aria-selected="${day.date === selected}"><button type="button" data-date="${day.date}" data-level="${day.level}" tabindex="${day.date === selected ? 0 : -1}" aria-label="${countText(day.count)} on ${fullDate(day.date)}"><span aria-hidden="true"></span></button></td>`
                  : '<td class="activity-empty" role="gridcell" aria-disabled="true"></td>';
              })
              .join("")}</tr>`,
        )
        .join("")}</tbody>`;
    container
      .querySelectorAll("[data-range]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.range) === range),
        ),
      );
    select(selected);
    const wrap = $(".activity-calendar-wrap");
    wrap.scrollLeft = wrap.scrollWidth;
  }
  container.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("button");
      if (!button || !container.contains(button)) return;
      if (button.dataset.date) select(button.dataset.date);
      if (button.dataset.range) {
        range = Number(button.dataset.range);
        render();
      }
      if (button.dataset.day) {
        const index = days.findIndex((day) => day.date === selected);
        select(
          days[
            Math.max(
              0,
              Math.min(
                days.length - 1,
                index + (button.dataset.day === "previous" ? -1 : 1),
              ),
            )
          ].date,
        );
      }
    },
    { signal: controller.signal },
  );
  container.addEventListener(
    "keydown",
    (event) => {
      const date = event.target.closest("[data-date]")?.dataset.date;
      if (
        !date ||
        ![
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ].includes(event.key)
      )
        return;
      event.preventDefault();
      select(
        days[
          moveDayIndex(
            days.findIndex((day) => day.date === date),
            event.key,
            days.length,
          )
        ].date,
        true,
      );
    },
    { signal: controller.signal },
  );
  render();
  return {
    snapshot,
    destroy() {
      controller.abort();
      container.replaceChildren();
    },
  };
}
