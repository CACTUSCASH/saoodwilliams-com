import { validateSource, MAX_SOURCE_LENGTH } from "./model.js";

const vertexSource = `#version 300 es
void main() {
  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}`;

export class ShaderRenderer {
  constructor(gl) {
    this.gl = gl;
    this.program = null;
    this.uniforms = {};
    this.vao = gl.createVertexArray();
  }

  compile(source) {
    if (!validateSource(source))
      throw new Error(
        `Source must contain 1 to ${MAX_SOURCE_LENGTH} characters.`,
      );
    const gl = this.gl;
    if (gl.isContextLost())
      throw new Error("The graphics context is recovering.");
    const shaders = [];
    let next = null;
    try {
      for (const [type, text] of [
        [gl.VERTEX_SHADER, vertexSource],
        [gl.FRAGMENT_SHADER, source],
      ]) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("Could not allocate a shader.");
        shaders.push(shader);
        gl.shaderSource(shader, text);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw new Error(
            gl.getShaderInfoLog(shader) || "Shader compilation failed.",
          );
      }
      next = gl.createProgram();
      if (!next) throw new Error("Could not allocate a program.");
      shaders.forEach((shader) => gl.attachShader(next, shader));
      gl.linkProgram(next);
      if (!gl.getProgramParameter(next, gl.LINK_STATUS))
        throw new Error(
          gl.getProgramInfoLog(next) || "Program linking failed.",
        );
      const uniforms = Object.fromEntries(
        ["uTime", "uResolution", "uPointer", "uScale", "uIntensity"].map(
          (name) => [name, gl.getUniformLocation(next, name)],
        ),
      );
      if (this.program) gl.deleteProgram(this.program);
      // The linked program no longer needs the compiled shader objects.
      shaders.forEach((shader) => gl.detachShader(next, shader));
      this.program = next;
      this.uniforms = uniforms;
      next = null;
    } finally {
      shaders.forEach((shader) => gl.deleteShader(shader));
      if (next) gl.deleteProgram(next);
    }
  }

  draw({ time, width, height, pointer, scale, intensity }) {
    const gl = this.gl;
    if (!this.program || gl.isContextLost()) return false;
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniform1f(this.uniforms.uTime, time);
    gl.uniform2f(this.uniforms.uResolution, width, height);
    gl.uniform2f(this.uniforms.uPointer, pointer.x, pointer.y);
    gl.uniform1f(this.uniforms.uScale, scale);
    gl.uniform1f(this.uniforms.uIntensity, intensity);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  }

  dispose() {
    if (!this.gl.isContextLost()) {
      if (this.program) this.gl.deleteProgram(this.program);
      if (this.vao) this.gl.deleteVertexArray(this.vao);
    }
    this.program = null;
    this.vao = null;
  }
}
