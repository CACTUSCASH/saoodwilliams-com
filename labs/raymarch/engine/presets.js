/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-9ffc56184237 */(()=>{const e=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(e)||e.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();const t=[{id:"showcase",name:"Showcase",detail:"Smooth blobs, gold torus, glossy floor",source:`// Smooth-unioned blobs, a rounded box, a gold torus and one spherical lamp.
const materials = [
  material("Floor", { albedo: [0.42, 0.44, 0.48], roughness: 0.22 }),
  material("Clay", { albedo: [0.86, 0.36, 0.25], roughness: 0.5 }),
  material("Porcelain", { albedo: [0.93, 0.93, 0.91], roughness: 0.12 }),
  material("Gold", { albedo: [1.0, 0.77, 0.34], roughness: 0.2, metallic: 1 }),
  material("Steel", { albedo: [0.62, 0.64, 0.68], roughness: 0.3, metallic: 1 }),
  material("Lamp", { emissive: [15, 11.5, 8] }),
];

const blobs = smoothUnion(0.42,
  translate([-1.55, 0.72, 0.1], sphere(0.72, "Clay")),
  translate([-0.95, 0.42, 0.75], sphere(0.42, "Clay")),
  translate([-1.25, 1.42, -0.15], sphere(0.38, "Clay")),
);

return scene({
  name: "Showcase",
  materials,
  root: union(
    plane([0, 1, 0], 0, "Floor"),
    blobs,
    translate([0.25, 0.62, -1.15], rotate([0, 28, 0], roundBox([0.62, 0.62, 0.62], 0.14, "Porcelain"))),
    translate([1.55, 0.9, 0.35], rotate([68, 0, 18], torus(0.64, 0.21, "Gold"))),
    capsule([-0.15, 0.2, 1.45], [1.05, 0.2, 1.75], 0.2, "Steel"),
    translate([0.1, 2.45, -0.4], sphere(0.32, "Lamp")),
  ),
  camera: { target: [0, 0.75, 0], yaw: 18, pitch: 12, distance: 6.6, fov: 38 },
  sky: { zenith: [0.01, 0.013, 0.024], horizon: [0.05, 0.05, 0.056], ground: [0.01, 0.01, 0.01] },
});
`},{id:"csg",name:"CSG cutaway",detail:"Subtract, intersect, a glowing core",source:`// Constructive solid geometry. Cut faces take the cutter's material.
const materials = [
  material("Floor", { albedo: [0.3, 0.31, 0.34], roughness: 0.35 }),
  material("Cobalt", { albedo: [0.28, 0.42, 0.85], roughness: 0.28, metallic: 1 }),
  material("Copper", { albedo: [0.96, 0.56, 0.38], roughness: 0.3, metallic: 1 }),
  material("Shell", { albedo: [0.9, 0.88, 0.84], roughness: 0.45 }),
  material("Cut", { albedo: [0.92, 0.3, 0.2], roughness: 0.6 }),
  material("Core", { emissive: [22, 10, 4] }),
  material("Lamp", { emissive: [7, 7.5, 8.5] }),
];

const bore = (angles) => rotate(angles, cylinder(0.34, 1.2, "Copper"));
const classic = subtract(
  intersect(roundBox([0.62, 0.62, 0.62], 0.05, "Cobalt"), sphere(0.8, "Cobalt")),
  union(bore([0, 0, 0]), bore([90, 0, 0]), bore([0, 0, 90])),
);

const shells = union(
  subtract(sphere(1.0, "Shell"), sphere(0.9, "Shell")),
  subtract(sphere(0.74, "Shell"), sphere(0.66, "Shell")),
);
const cutaway = subtract(shells, translate([0.6, 0.6, 0.6], box([0.6, 0.6, 0.6], "Cut")));

return scene({
  name: "CSG cutaway",
  materials,
  root: union(
    plane([0, 1, 0], 0, "Floor"),
    translate([-1.35, 0.63, 0], rotate([0, 30, 0], classic)),
    translate([1.25, 1.05, 0], cutaway),
    translate([1.25, 1.05, 0], sphere(0.3, "Core")),
    translate([-0.6, 3.6, 2.4], sphere(0.5, "Lamp")),
  ),
  camera: { target: [0, 0.78, 0], yaw: 34, pitch: 20, distance: 5.3, fov: 40 },
  sky: { zenith: [0.05, 0.07, 0.12], horizon: [0.24, 0.23, 0.23], ground: [0.03, 0.03, 0.03] },
});
`},{id:"repeat",name:"Infinite repetition",detail:"Domain repetition to the horizon",source:`// One pillar, one sphere, repeated forever by folding space.
const materials = [
  material("Ground", { albedo: [0.32, 0.3, 0.29], roughness: 0.65 }),
  material("Bone", { albedo: [0.88, 0.84, 0.78], roughness: 0.38 }),
  material("Chrome", { albedo: [0.92, 0.93, 0.95], roughness: 0.06, metallic: 1 }),
  material("Sun", { emissive: [20, 15, 10] }),
];

const cell = [2.6, 0, 2.6];
const pillars = repeat(cell, translate([0, 1.1, 0], cylinder(0.28, 1.1, "Bone")));

return scene({
  name: "Infinite repetition",
  materials,
  root: union(
    smoothUnion(0.3, plane([0, 1, 0], 0, "Ground"), pillars),
    repeat(cell, translate([0, 2.3, 0], roundBox([0.52, 0.1, 0.52], 0.04, "Bone"))),
    translate([1.3, 0, 1.3], repeat(cell, translate([0, 0.75, 0], sphere(0.38, "Chrome")))),
    translate([4, 11, -9], sphere(2.5, "Sun")),
  ),
  camera: { target: [0.3, 1.05, 0], yaw: 10.9, pitch: 4.3, distance: 5.31, fov: 55 },
  sky: { zenith: [0.1, 0.16, 0.34], horizon: [0.95, 0.58, 0.36], ground: [0.05, 0.04, 0.04], intensity: 1.2 },
});
`}];export{t as PRESETS};
