export const DEFAULT_WIDTH = 28;
export const DEFAULT_HEIGHT = 18;
export const ALGORITHMS = Object.freeze(["A*", "Dijkstra", "BFS"]);
export const MAX_IMPORT_BYTES = 100_000;

const directions = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

function validDimensions(width, height) {
  return (
    Number.isInteger(width) &&
    width >= 6 &&
    width <= 64 &&
    Number.isInteger(height) &&
    height >= 6 &&
    height <= 48
  );
}

export function createMap(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
  if (!validDimensions(width, height))
    throw new Error("Map dimensions must be 6 to 64 columns and 6 to 48 rows.");
  return {
    width,
    height,
    cells: Array(width * height).fill(0),
    start: 2,
    end: width * height - 3,
  };
}

export function indexOf(x, y, width) {
  return y * width + x;
}
export function pointOf(index, width) {
  return { x: index % width, y: Math.floor(index / width) };
}

export function validateMap(map) {
  if (
    !map ||
    typeof map !== "object" ||
    Array.isArray(map) ||
    !validDimensions(map.width, map.height)
  )
    return false;
  if (!Array.isArray(map.cells) || map.cells.length !== map.width * map.height)
    return false;
  if (
    !Number.isInteger(map.start) ||
    !Number.isInteger(map.end) ||
    map.start === map.end
  )
    return false;
  if (
    map.start < 0 ||
    map.end < 0 ||
    map.start >= map.cells.length ||
    map.end >= map.cells.length
  )
    return false;
  for (let i = 0; i < map.cells.length; i++) {
    if (
      !Object.hasOwn(map.cells, i) ||
      !Number.isInteger(map.cells[i]) ||
      map.cells[i] < 0 ||
      map.cells[i] > 9
    )
      return false;
  }
  return map.cells[map.start] !== 1 && map.cells[map.end] !== 1;
}

// Pick only the documented fields so imports cannot introduce unrelated state.
export function copyMap(map) {
  if (!validateMap(map))
    throw new Error(
      "Invalid map. Check the dimensions, terrain, and distinct open endpoints.",
    );
  return {
    width: map.width,
    height: map.height,
    cells: [...map.cells],
    start: map.start,
    end: map.end,
  };
}

export function parseMap(text) {
  if (
    typeof text !== "string" ||
    new TextEncoder().encode(text).length > MAX_IMPORT_BYTES
  )
    throw new Error("Map files must be smaller than 100 KB.");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  return copyMap(parsed);
}

export function neighbors(index, map) {
  const { x, y } = pointOf(index, map.width);
  return directions
    .map(([dx, dy]) => [x + dx, y + dy])
    .filter(
      ([nx, ny]) => nx >= 0 && ny >= 0 && nx < map.width && ny < map.height,
    )
    .map(([nx, ny]) => indexOf(nx, ny, map.width));
}

class MinHeap {
  #items = [];
  #sequence = 0;
  #before(a, b) {
    return a.score < b.score || (a.score === b.score && a.order < b.order);
  }
  push(item, score) {
    const entry = { item, score, order: this.#sequence++ };
    let at = this.#items.length;
    this.#items.push(entry);
    while (at > 0) {
      const parent = (at - 1) >> 1;
      if (!this.#before(entry, this.#items[parent])) break;
      this.#items[at] = this.#items[parent];
      at = parent;
    }
    this.#items[at] = entry;
  }
  pop() {
    if (!this.#items.length) return null;
    const first = this.#items[0];
    const last = this.#items.pop();
    if (this.#items.length) {
      let at = 0;
      while (at * 2 + 1 < this.#items.length) {
        const left = at * 2 + 1;
        const right = left + 1;
        const child =
          right < this.#items.length &&
          this.#before(this.#items[right], this.#items[left])
            ? right
            : left;
        if (!this.#before(this.#items[child], last)) break;
        this.#items[at] = this.#items[child];
        at = child;
      }
      this.#items[at] = last;
    }
    return first.item;
  }
}

export function search(map, algorithm = "A*") {
  if (!validateMap(map)) throw new Error("Invalid map");
  if (!ALGORITHMS.includes(algorithm))
    throw new Error("Unknown search algorithm");
  const distance = new Float64Array(map.cells.length).fill(Infinity);
  const previous = new Int32Array(map.cells.length).fill(-1);
  const settled = new Uint8Array(map.cells.length);
  const visited = [];
  const heap = new MinHeap();
  const queue = [];
  let head = 0;
  const goal = pointOf(map.end, map.width);
  const heuristic = (index) => {
    const point = pointOf(index, map.width);
    return Math.abs(point.x - goal.x) + Math.abs(point.y - goal.y);
  };
  distance[map.start] = 0;
  if (algorithm === "BFS") queue.push(map.start);
  else heap.push(map.start, algorithm === "A*" ? heuristic(map.start) : 0);
  while (true) {
    const at =
      algorithm === "BFS"
        ? head < queue.length
          ? queue[head++]
          : null
        : heap.pop();
    if (at === null) break;
    if (settled[at]) continue;
    settled[at] = 1;
    visited.push(at);
    if (at === map.end) break;
    for (const next of neighbors(at, map)) {
      if (map.cells[next] === 1 || settled[next]) continue;
      const candidate =
        distance[at] + (algorithm === "BFS" ? 1 : Math.max(1, map.cells[next]));
      if (candidate >= distance[next]) continue;
      distance[next] = candidate;
      previous[next] = at;
      if (algorithm === "BFS") queue.push(next);
      else
        heap.push(next, candidate + (algorithm === "A*" ? heuristic(next) : 0));
    }
  }
  const path = [];
  if (settled[map.end]) {
    for (let at = map.end; at !== -1; at = previous[at]) path.push(at);
    path.reverse();
  }
  return {
    algorithm,
    visited,
    path,
    reachable: path.length > 0,
    // Report actual terrain cost for every strategy, including BFS, so costs can be compared fairly.
    cost: path.length
      ? path
          .slice(1)
          .reduce((total, index) => total + Math.max(1, map.cells[index]), 0)
      : null,
    steps: path.length ? path.length - 1 : null,
    expanded: visited.length,
  };
}

function randomFrom(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new Error("Seed must be a whole number from 0 to 4294967295.");
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function seededMap(
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  seed = 23,
) {
  const map = createMap(width, height);
  const random = randomFrom(seed);
  map.cells = map.cells.map(() =>
    random() < 0.18 ? 1 : random() < 0.18 ? 2 + Math.floor(random() * 8) : 0,
  );
  map.cells[map.start] = 0;
  map.cells[map.end] = 0;
  return map;
}

export function mazeMap(
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  seed = 11,
) {
  const map = createMap(width, height);
  const random = randomFrom(seed);
  map.cells.fill(1);
  map.start = indexOf(1, 1, width);
  // Both endpoints belong to the odd-coordinate lattice, including even-sized maps.
  map.end = indexOf(
    width % 2 ? width - 2 : width - 3,
    height % 2 ? height - 2 : height - 3,
    width,
  );
  map.cells[map.start] = 0;
  const stack = [map.start];
  while (stack.length) {
    const at = stack.at(-1);
    const { x, y } = pointOf(at, width);
    const choices = directions
      .map(([dx, dy]) => [x + dx * 2, y + dy * 2])
      .filter(
        ([nx, ny]) =>
          nx > 0 &&
          ny > 0 &&
          nx < width - 1 &&
          ny < height - 1 &&
          map.cells[indexOf(nx, ny, width)] === 1,
      );
    if (!choices.length) {
      stack.pop();
      continue;
    }
    const [nx, ny] = choices[Math.floor(random() * choices.length)];
    const next = indexOf(nx, ny, width);
    map.cells[indexOf((x + nx) / 2, (y + ny) / 2, width)] = 0;
    map.cells[next] = 0;
    stack.push(next);
  }
  return map;
}
