export const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
export function wrapText(text, width) {
  const limit = Math.max(8, Math.floor((width - 28) / 7.4));
  const lines = [];
  for (const paragraph of text.split("\n")) {
    let current = "";
    for (const word of paragraph.split(" ")) {
      if (current && current.length + word.length + 1 > limit) {
        lines.push(current);
        current = "";
      }
      if (word.length > limit) {
        if (current) {
          lines.push(current);
          current = "";
        }
        for (let index = 0; index < word.length; index += limit)
          lines.push(word.slice(index, index + limit));
      } else current = current ? `${current} ${word}` : word;
    }
    if (current || !paragraph) lines.push(current);
  }
  return lines;
}
export function boundary(shape, toward) {
  const cx = shape.x + shape.width / 2,
    cy = shape.y + shape.height / 2;
  const dx = toward.x - cx,
    dy = toward.y - cy;
  if (!dx && !dy) return { x: cx, y: cy };
  const ratio =
    shape.type === "ellipse"
      ? 1 /
        Math.sqrt(
          (dx / (shape.width / 2)) ** 2 + (dy / (shape.height / 2)) ** 2,
        )
      : 1 /
        Math.max(
          Math.abs(dx) / (shape.width / 2),
          Math.abs(dy) / (shape.height / 2),
        );
  return { x: cx + dx * ratio, y: cy + dy * ratio };
}
export function sceneMarkup(
  shapes,
  selected = null,
  connectFrom = null,
  interactive = true,
) {
  const byId = new Map(shapes.map((shape) => [shape.id, shape]));
  const connectors = shapes
    .filter((shape) => shape.type === "connector")
    .map((shape) => {
      const from = byId.get(shape.from),
        to = byId.get(shape.to);
      if (!from || !to || from.type === "connector" || to.type === "connector")
        return "";
      const start = boundary(from, {
        x: to.x + to.width / 2,
        y: to.y + to.height / 2,
      });
      const end = boundary(to, {
        x: from.x + from.width / 2,
        y: from.y + from.height / 2,
      });
      const labelX = (start.x + end.x) / 2,
        labelY = (start.y + end.y) / 2 - 10;
      return `<g ${interactive ? `data-shape="${escape(shape.id)}" role="button" tabindex="0" aria-label="Connector: ${escape(shape.text || from.text.split("\n")[0] + " to " + to.text.split("\n")[0])}"` : ""} class="diagram-connector${selected === shape.id ? " selected" : ""}"><line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="transparent" stroke-width="18"/><line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${selected === shape.id ? "#7ca9ff" : escape(shape.fill || "#91a4bf")}" stroke-width="${selected === shape.id ? 2.5 : 1.5}" marker-end="url(#arrowhead)"/><text x="${labelX}" y="${labelY}" fill="#bac5d5" font-size="11" font-family="system-ui,sans-serif" text-anchor="middle">${escape((shape.text || "").slice(0, 36))}</text></g>`;
    })
    .join("");
  const nodes = shapes
    .filter((shape) => shape.type !== "connector")
    .map((shape) => {
      const active = selected === shape.id || connectFrom === shape.id;
      const paint = `fill="${escape(shape.fill)}" stroke="${active ? "#8ab2ff" : "#75869b66"}" stroke-width="${active ? 2 : 1}"`;
      const form =
        shape.type === "ellipse"
          ? `<ellipse cx="${shape.width / 2}" cy="${shape.height / 2}" rx="${shape.width / 2}" ry="${shape.height / 2}" ${paint}/>`
          : `<rect width="${shape.width}" height="${shape.height}" rx="${shape.type === "note" ? 2 : 9}" ${paint}/>`;
      const lines = wrapText(shape.text, shape.width),
        maxLines = Math.max(1, Math.floor((shape.height - 24) / 20));
      const visibleLines = lines.slice(0, maxLines);
      if (lines.length > maxLines)
        visibleLines[maxLines - 1] =
          visibleLines[maxLines - 1].slice(0, -1) + "...";
      const top =
        shape.type === "note"
          ? 28
          : shape.height / 2 - (visibleLines.length - 1) * 10 + 5;
      const rgb = shape.fill
        .slice(1)
        .match(/../g)
        .map((channel) => {
          const value = parseInt(channel, 16) / 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
      const lightFill =
        rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179;
      const textColor = lightFill ? "#111b2b" : "#f1f4fa";
      const text = visibleLines
        .map(
          (line, index) =>
            `<tspan x="${shape.type === "note" ? 16 : shape.width / 2}" y="${top + index * 20}" font-size="${index === 0 ? 14 : 12}" fill="${textColor}" font-weight="${index === 0 ? 550 : 400}">${escape(line)}</tspan>`,
        )
        .join("");
      return `<g transform="translate(${shape.x} ${shape.y})" ${interactive ? `data-shape="${escape(shape.id)}" role="button" tabindex="0" aria-pressed="${active}" aria-label="${escape(shape.type + ": " + (shape.text || "Untitled"))}"` : ""} class="diagram-shape${active ? " selected" : ""}">${form}${shape.type === "note" ? `<path d="M${shape.width - 18} 0H${shape.width}V18Z" fill="#ffffff18"/>` : ""}<defs><clipPath id="text-${escape(shape.id)}"><rect width="${shape.width}" height="${shape.height}"/></clipPath></defs><text clip-path="url(#text-${escape(shape.id)})" font-family="system-ui,sans-serif" text-anchor="${shape.type === "note" ? "start" : "middle"}" pointer-events="none">${text}</text></g>`;
    })
    .join("");
  return connectors + nodes;
}
export const definitions =
  '<defs><marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#91a4bf"/></marker></defs>';
export function exportSvg(shapes) {
  const nodes = shapes.filter((shape) => shape.type !== "connector");
  const left = Math.min(0, ...nodes.map((shape) => shape.x)) - 40;
  const top = Math.min(0, ...nodes.map((shape) => shape.y)) - 40;
  const right =
    Math.max(600, ...nodes.map((shape) => shape.x + shape.width)) + 40;
  const bottom =
    Math.max(400, ...nodes.map((shape) => shape.y + shape.height)) + 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${right - left}" height="${bottom - top}" viewBox="${left} ${top} ${right - left} ${bottom - top}"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" fill="#141b27"/>${definitions}${sceneMarkup(shapes, null, null, false)}</svg>`;
}
