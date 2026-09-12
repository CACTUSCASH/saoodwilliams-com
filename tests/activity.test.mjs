import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  calendarColumns,
  moveDayIndex,
  selectRange,
  summarize,
  validateSnapshot,
} from "../activity.js";

const snapshot = JSON.parse(
  await readFile(new URL("../data/github-activity.json", import.meta.url)),
);

test("the checked in contribution snapshot has consecutive verified dates", () => {
  const value = validateSnapshot(snapshot);
  assert.equal(value.username, "CACTUSCASH");
  assert.equal(value.days.length, 371);
  assert.equal(
    value.total,
    value.days.reduce((sum, day) => sum + day.count, 0),
  );
});

test("range selection preserves the most recent day", () => {
  const days = selectRange(snapshot, 90);
  assert.equal(days.length, 90);
  assert.equal(days.at(-1).date, snapshot.range.end);
  assert.deepEqual(summarize(days), {
    total: days.reduce((sum, day) => sum + day.count, 0),
    activeDays: days.filter((day) => day.count > 0).length,
    longestStreak: (() => {
      let best = 0;
      let run = 0;
      for (const day of days) {
        run = day.count ? run + 1 : 0;
        best = Math.max(best, run);
      }
      return best;
    })(),
  });
});

test("calendar navigation moves by visual rows and clamps at edges", () => {
  assert.equal(moveDayIndex(20, "ArrowLeft", 90), 13);
  assert.equal(moveDayIndex(20, "ArrowRight", 90), 27);
  assert.equal(moveDayIndex(1, "ArrowUp", 90), 0);
  assert.equal(moveDayIndex(88, "ArrowDown", 90), 89);
  assert.equal(moveDayIndex(24, "Home", 90), 0);
  assert.equal(moveDayIndex(24, "End", 90), 89);
});

test("calendar columns pad the first week and retain every activity day", () => {
  const columns = calendarColumns(selectRange(snapshot, 90));
  const values = columns.flat().filter(Boolean);
  assert.equal(values.length, 90);
  assert.equal(values[0].date, selectRange(snapshot, 90)[0].date);
  assert.equal(values.at(-1).date, snapshot.range.end);
});
