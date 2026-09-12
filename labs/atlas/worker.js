import { ALGORITHMS, search } from "./model.js";

self.onmessage = ({ data }) => {
  const { id, map, algorithm, compare } = data;
  try {
    const algorithms = compare ? ALGORITHMS : [algorithm];
    const results = algorithms.map((name) => {
      const started = performance.now();
      const result = search(map, name);
      return { ...result, elapsed: performance.now() - started };
    });
    self.postMessage({ id, results });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
