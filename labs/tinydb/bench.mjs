// TinyDB micro-benchmarks. Run: node labs/tinydb/bench.mjs
// Everything goes through the same engine the lab runs in its Web Worker.

import { Database } from "./engine/database.js";
import { Disk } from "./engine/disk.js";
import { Wal } from "./engine/wal.js";
import { Pager } from "./engine/pager.js";
import { BTree } from "./engine/btree.js";
import { encodeKey } from "./engine/encoding.js";
import { seedDatabase, mulberry32 } from "./engine/seed.js";

const now = () => performance.now();
const results = [];
function record(name, value, unit, note = "") {
  results.push({ name, value, unit, note });
  console.log(`${name.padEnd(46)} ${String(value).padStart(12)} ${unit.padEnd(10)} ${note}`);
}
const round = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

function timeIt(fn, reps) {
  fn(); // warm the JIT once
  const t0 = now();
  for (let i = 0; i < reps; i++) fn(i);
  return (now() - t0) / reps;
}

console.log(`TinyDB benchmark · Node ${process.version} · ${new Date().toISOString().slice(0, 10)}\n`);

// 1. Seeding: 2,000 users + 10,000 orders, 5 secondary indexes, one transaction.
const seeds = [];
let db;
for (let i = 0; i < 3; i++) {
  db = Database.create({ capacity: 128 });
  seeds.push(seedDatabase(db));
}
const cold = seeds[0];
const warm = seeds[seeds.length - 1];
record("seed 12,000 rows (first run, cold JIT)", round(cold.totalMs, 0), "ms", `${cold.pages} pages, ${cold.walFrames} WAL frames`);
record("seed 12,000 rows (warm)", round(warm.totalMs, 0), "ms", `insert ${round(warm.insertMs, 0)} + commit ${round(warm.commitMs, 0)} + checkpoint ${round(warm.checkpointMs, 0)}`);
record("seed insert throughput (warm)", Math.round(12000 / (warm.insertMs / 1000)), "rows/s", "prepared INSERT, PK + 5 indexes");

// 2. Point lookups by primary key.
const point = db.prepare("SELECT * FROM users WHERE id = ?");
const rnd = mulberry32(99);
const pointMs = timeIt(() => point.run([1 + Math.floor(rnd() * 2000)]), 20000);
record("point lookup by primary key", round(pointMs * 1000, 1), "us/query", `${Math.round(1000 / pointMs)} queries/s, planned on every execution`);

// 3. Index range scan.
const range = db.prepare("SELECT id, user_id, amount, placed FROM orders WHERE amount BETWEEN ? AND ? ORDER BY amount");
let rows = 0;
const rangeMs = timeIt(() => {
  const lo = Math.floor(rnd() * 500);
  rows += range.run([lo, lo + 10]).rows.length;
}, 500);
record("index range scan (amount, width 10)", round(rangeMs, 3), "ms/query", `${Math.round(rows / 501)} rows avg, no sort`);

// 4. Full scan + hash aggregate.
const agg = db.prepare("SELECT category, COUNT(*) AS n, ROUND(AVG(amount), 2), MAX(amount) FROM orders WHERE status <> 'cancelled' GROUP BY category HAVING COUNT(*) > 800 ORDER BY n DESC");
record("full scan + GROUP BY + HAVING (10k rows)", round(timeIt(() => agg.run(), 30), 2), "ms/query", "128-page pool, 313-page table");

// 5. Join presets.
const join = db.prepare("SELECT o.category, COUNT(*) AS orders, ROUND(SUM(o.amount), 2) AS revenue FROM users u JOIN orders o ON o.user_id = u.id WHERE u.country = 'Kenya' GROUP BY o.category ORDER BY revenue DESC");
record("index scan + index nested-loop join + agg", round(timeIt(() => join.run(), 50), 2), "ms/query", "Kenya users -> their orders");
const left = db.prepare("SELECT u.id, COUNT(o.id) FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id HAVING COUNT(o.id) = 0");
record("LEFT JOIN 2,000 x 10,000 + GROUP BY", round(timeIt(() => left.run(), 5), 1), "ms/query", "index nested loop, 12k row fetches");

// 6. Raw B+tree.
{
  const pager = new Pager(new Disk(), new Wal(), { capacity: 4096, autoCheckpoint: 0 });
  pager.format();
  const tree = new BTree(pager, BTree.create(pager));
  const r = mulberry32(7);
  const keys = [];
  const seen = new Set();
  while (keys.length < 100000) {
    const k = Math.floor(r() * 2 ** 40);
    if (!seen.has(k)) {
      seen.add(k);
      keys.push(encodeKey([k], ["INTEGER"]));
    }
  }
  const value = new Uint8Array(32).fill(7);
  let t0 = now();
  for (const k of keys) tree.put(k, value);
  const insMs = now() - t0;
  record("B+tree insert, 100k random keys", Math.round(100000 / (insMs / 1000)), "inserts/s", `${round(insMs, 0)} ms total`);
  t0 = now();
  for (const k of keys) tree.get(k);
  const getMs = now() - t0;
  record("B+tree point get, 100k keys", Math.round(100000 / (getMs / 1000)), "gets/s", "");
  t0 = now();
  const cur = tree.cursor();
  let n = 0;
  for (cur.first(); cur.valid; cur.next()) n++;
  record("B+tree full cursor scan, 100k entries", round(now() - t0, 1), "ms", `${n} entries in key order`);
  t0 = now();
  const c = tree.check();
  record("B+tree invariant check", round(now() - t0, 1), "ms", `height ${c.height}, ${c.pages} pages, ${Math.round(c.avgFill * 100)}% avg fill, ok=${c.ok}`);
  for (let i = 0; i < keys.length; i += 2) tree.delete(keys[i]);
  const d = tree.check();
  record("after deleting 50k keys", d.pages, "pages", `height ${d.height}, min fill ${Math.round(d.minFill * 100)}%, ok=${d.ok}`);
}

// 7. WAL: commits, recovery, checkpoint.
{
  const w = Database.create({ capacity: 128, autoCheckpoint: 0 });
  w.exec("CREATE TABLE ev (id INTEGER PRIMARY KEY, kind TEXT NOT NULL, payload TEXT)");
  w.checkpoint();
  const ins = w.prepare("INSERT INTO ev (kind, payload) VALUES (?, ?)");
  let t0 = now();
  for (let i = 0; i < 1000; i++) ins.run(["click", `payload ${i} `.padEnd(64, ".")]);
  const commitMs = now() - t0;
  record("autocommit INSERT transactions", Math.round(1000 / (commitMs / 1000)), "commits/s", `${w.wal.frameCount} frames, ${round(w.wal.size / 1048576, 2)} MiB of WAL`);
  const bytes = w.wal.durableBytes();
  const disk = w.disk;
  t0 = now();
  const re = Database.open(disk, Wal.fromBytes(bytes));
  const recMs = now() - t0;
  record("crash recovery: scan + CRC + replay index", round(recMs, 1), "ms", `${re.recovery.committed.length} transactions, ${round(bytes.length / 1048576 / (recMs / 1000), 0)} MiB/s incl. catalog load`);
  t0 = now();
  const ck = re.checkpoint();
  record("checkpoint", round(now() - t0, 2), "ms", `${ck.pages} pages copied from ${ck.frames} frames`);
}

console.log("\nJSON " + JSON.stringify(results));
