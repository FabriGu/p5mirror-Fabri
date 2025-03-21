let shaderProgram;
let time = 0;

// Vertex shader now handles 3D coordinates and normals
const vertShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat3 uNormalMatrix;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
  
  vPosition = aPosition;
  vNormal = normalize(uNormalMatrix * aNormal);
  vTexCoord = aTexCoord;
}`;

const fragShader = `
precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define PI 3.14159265359

// Function to calculate spherical coordinates
vec2 getSphereCoords(vec3 p) {
  float phi = atan(p.z, p.x);
  float theta = acos(p.y / length(p));
  return vec2(phi, theta);
}

void main() {
  // Get spherical coordinates
  vec2 sphereCoords = getSphereCoords(vPosition);
  
  // Normalize mouse coordinates to [-1, 1]
  vec2 mousePos = (u_mouse * 2.0 - 1.0);
  
  // Calculate two ripple centers (opposite ends of sphere)
  vec2 rippleCenter1 = vec2(mousePos.x * PI, mousePos.y * PI * 0.5);
  vec2 rippleCenter2 = vec2(-mousePos.x * PI, -mousePos.y * PI * 0.5);
  
  // Calculate distances for both ripples
  float dist1 = length(sphereCoords - rippleCenter1);
  float dist2 = length(sphereCoords - rippleCenter2);
  
  // Create ripple effects
  float ripple1 = sin(dist1 * 8.0 - u_time * 3.0) * 0.5 + 0.5;
  float ripple2 = sin(dist2 * 8.0 - u_time * 3.0) * 0.5 + 0.5;
  
  // Apply distance falloff
  ripple1 *= smoothstep(PI, 0.0, dist1);
  ripple2 *= smoothstep(PI, 0.0, dist2);
  
  // Combine ripples
  float combinedRipple = ripple1 + ripple2;
  
  // Create color gradient based on sphere position and ripples
  vec3 color1 = vec3(0.2, 0.5, 0.8); // Blue
  vec3 color2 = vec3(0.8, 0.2, 0.5); // Magenta
  
  vec3 finalColor = mix(color1, color2, combinedRipple);
  
  // Add ambient lighting based on normals
  float ambient = dot(vNormal, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
  finalColor *= 0.7 + ambient * 0.3;
  
  gl_FragColor = vec4(finalColor, 1.0);
}`;

function preload() {
  shaderProgram = createShader(vertShader, fragShader);
}

function setup() {
  createCanvas(800, 800, WEBGL);
  noStroke();
}

function draw() {
  background(0);
  
  // Update time
  time += 0.01;
  
  // Set shader and uniforms
  shader(shaderProgram);
  shaderProgram.setUniform('u_resolution', [width, height]);
  shaderProgram.setUniform('u_time', time);
  shaderProgram.setUniform('u_mouse', [mouseX/width, mouseY/height]);
  
  // Add some rotation to make the sphere more dynamic
  rotateY(time * 0.2);
  rotateX(sin(time * 0.1) * 0.2);
  
  // Draw sphere with enough detail for smooth ripples
  sphere(200, 64, 64);
}