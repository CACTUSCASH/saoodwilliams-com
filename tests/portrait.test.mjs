import test from "node:test";
import assert from "node:assert/strict";
import { PortraitRenderer } from "../portrait.js";

function mockGL(options = {}) {
  const resources = new Set();
  const create = (kind) => {
    const resource = { kind };
    resources.add(resource);
    return resource;
  };
  return {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    LINK_STATUS: 4,
    POINTS: 5,
    TEXTURE_2D: 6,
    UNPACK_FLIP_Y_WEBGL: 7,
    TEXTURE_MIN_FILTER: 8,
    TEXTURE_MAG_FILTER: 9,
    TEXTURE_WRAP_S: 10,
    TEXTURE_WRAP_T: 11,
    LINEAR: 12,
    CLAMP_TO_EDGE: 13,
    RGBA: 14,
    UNSIGNED_BYTE: 15,
    COLOR_BUFFER_BIT: 16,
    DEPTH_BUFFER_BIT: 32,
    BLEND: 17,
    SRC_ALPHA: 18,
    ONE_MINUS_SRC_ALPHA: 19,
    DEPTH_TEST: 20,
    LEQUAL: 21,
    TEXTURE0: 22,
    ONE: 1,
    resources,
    uploads: 0,
    uniformLookups: 0,
    draws: [],
    lost: false,
    flips: [],
    isContextLost() {
      return this.lost;
    },
    createShader() {
      return create("shader");
    },
    shaderSource(shader, source) {
      shader.source = source;
    },
    compileShader() {},
    getShaderParameter() {
      return !options.failShader;
    },
    getShaderInfoLog() {
      return "Shader failed";
    },
    deleteShader(shader) {
      resources.delete(shader);
    },
    createProgram() {
      return create("program");
    },
    attachShader() {},
    detachShader() {},
    linkProgram() {},
    getProgramParameter() {
      return !options.failLink;
    },
    getProgramInfoLog() {
      return "Link failed";
    },
    deleteProgram(program) {
      resources.delete(program);
    },
    createVertexArray() {
      return create("vao");
    },
    deleteVertexArray(vao) {
      resources.delete(vao);
    },
    createTexture() {
      return options.failTexture ? null : create("texture");
    },
    deleteTexture(texture) {
      resources.delete(texture);
    },
    bindTexture() {},
    texParameteri() {},
    pixelStorei(name, value) {
      this.flips.push([name, value]);
    },
    texImage2D() {
      this.uploads++;
      if (options.failUpload) throw new Error("Image upload failed");
    },
    getUniformLocation(program, name) {
      this.uniformLookups++;
      return name;
    },
    viewport() {},
    clearColor() {},
    clearDepth() {},
    clear() {},
    enable() {},
    blendFuncSeparate() {},
    depthFunc() {},
    useProgram() {},
    bindVertexArray() {},
    activeTexture() {},
    uniform1i() {},
    uniform1f() {},
    uniform2f() {},
    drawArrays(mode, first, count) {
      this.draws.push({ mode, first, count });
    },
  };
}

const photo = { naturalWidth: 1254, naturalHeight: 1254 };
const frame = {
  width: 900,
  height: 900,
  dpr: 1.75,
  amount: 0.7,
  time: 2,
  pointer: { x: 0.2, y: -0.1 },
  pointerStrength: 1,
};

test("portrait uploads once, flips photo correctly, and reuses resources across animation frames", () => {
  const gl = mockGL();
  const renderer = new PortraitRenderer(gl, photo);
  assert.equal(gl.resources.size, 3);
  assert.equal(gl.uploads, 1);
  assert.deepEqual(gl.flips, [[gl.UNPACK_FLIP_Y_WEBGL, true]]);
  for (let index = 0; index < 60; index++)
    assert.equal(renderer.draw(frame), true);
  assert.equal(gl.resources.size, 3);
  assert.equal(gl.uploads, 1);
  assert.equal(gl.uniformLookups, 9);
  assert.equal(gl.draws.length, 60);
  assert.deepEqual(gl.draws[0], { mode: gl.POINTS, first: 0, count: 57600 });
  renderer.destroy();
  renderer.destroy();
  assert.equal(gl.resources.size, 0);
});

test("shader, link, texture and image failures release all partial allocations", () => {
  for (const failure of [
    "failShader",
    "failLink",
    "failTexture",
    "failUpload",
  ]) {
    const gl = mockGL({ [failure]: true });
    assert.throws(() => new PortraitRenderer(gl, photo));
    assert.equal(gl.resources.size, 0, failure);
  }
});

test("context loss stops drawing; particle count and invalid image dimensions are bounded", () => {
  const gl = mockGL();
  const renderer = new PortraitRenderer(gl, photo, 10000);
  renderer.draw(frame);
  assert.equal(gl.draws[0].count, 59536);
  gl.lost = true;
  assert.equal(renderer.draw(frame), false);
  assert.equal(gl.draws.length, 1);
  const unloadedGL = mockGL();
  assert.throws(
    () =>
      new PortraitRenderer(unloadedGL, { naturalWidth: 0, naturalHeight: 0 }),
    /decoded/,
  );
  assert.equal(unloadedGL.resources.size, 0);
});
