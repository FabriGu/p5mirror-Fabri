let shaderProgram;
let time = 0;

// Vertex shader now includes flat shading setup
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
varying vec3 vCentroid;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
  
  // Pass the position and normal to fragment shader
  vPosition = aPosition;
  vNormal = normalize(uNormalMatrix * aNormal);
  vTexCoord = aTexCoord;
  
  // Calculate face centroid for flat shading
  vCentroid = aPosition;
}`;

const fragShader = `
precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;
varying vec3 vCentroid;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define PI 3.14159265359

// Function to calculate face-based coordinates
vec2 getFaceCoords(vec3 centroid) {
  float phi = atan(centroid.z, centroid.x);
  float theta = acos(centroid.y / length(centroid));
  return vec2(phi, theta);
}

void main() {
  // Get coordinates based on face centroid
  vec2 faceCoords = getFaceCoords(vCentroid);
  
  // Normalize mouse coordinates
  vec2 mousePos = (u_mouse * 2.0 - 1.0);
  
  // Calculate ripple centers using face coordinates
  vec2 rippleCenter1 = vec2(mousePos.x * PI, mousePos.y * PI * 0.5);
  vec2 rippleCenter2 = vec2(-mousePos.x * PI, -mousePos.y * PI * 0.5);
  
  // Calculate distances for both ripples
  float dist1 = length(faceCoords - rippleCenter1);
  float dist2 = length(faceCoords - rippleCenter2);
  
  // Create stepped ripple effects for low-poly look
  float ripple1 = floor(sin(dist1 * 6.0 - u_time * 2.0) * 4.0) / 4.0;
  float ripple2 = floor(sin(dist2 * 6.0 - u_time * 2.0) * 4.0) / 4.0;
  
  // Apply distance falloff with sharp steps
  ripple1 *= step(dist1, PI);
  ripple2 *= step(dist2, PI);
  
  // Combine ripples with stepped mix
  float combinedRipple = floor((ripple1 + ripple2) * 4.0) / 4.0;
  
  // Create color gradient with sharp transitions
  vec3 color1 = vec3(0.2, 0.5, 0.8); // Blue
  vec3 color2 = vec3(0.8, 0.2, 0.5); // Magenta
  
  vec3 finalColor = mix(color1, color2, combinedRipple);
  
  // Add flat shading based on face normal
  float light = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0)));
  light = floor(light * 4.0) / 4.0; // Stepped lighting for low-poly look
  
  finalColor *= 0.5 + light * 0.5;
  
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
  
  // Add rotation
  rotateY(time * 0.2);
  rotateX(sin(time * 0.1) * 0.2);
  
  // Draw low-poly sphere - reduced detail for more visible faces
  sphere(200, 12, 12);
}