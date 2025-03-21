let theShader;

// Vertex shader as string
const vertShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec3 vNormal;
varying vec2 vTexCoord;

void main() {
  vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * viewModelPosition;
  vNormal = (uModelViewMatrix * vec4(aNormal, 0.0)).xyz;
  vTexCoord = aTexCoord;
}
`;

// Fragment shader as string
const fragShader = `
precision mediump float;

varying vec3 vNormal;
varying vec2 vTexCoord;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  // Normalize the normal vector
  vec3 normal = normalize(vNormal);
  
  // Create shifting colors based on position and time
  vec3 color = vec3(0.5) + 0.5 * normal;
  
  // Add time-based color cycling
  float cycle = sin(u_time * 0.1) * 0.5 + 0.5;
  vec3 color1 = vec3(0.2, 0.5, 0.8);
  vec3 color2 = vec3(0.8, 0.2, 0.5);
  
  color = mix(color1, color2, cycle) * (0.5 + 0.5 * normal.y);
  
  gl_FragColor = vec4(color, 1.0);
}
`;

function preload() {
  // Create shader using createShader() function
  theShader = createShader(vertShader, fragShader);
}

function setup() {
  createCanvas(800, 800, WEBGL);
  noStroke();
  console.log('Setup complete');
}

function draw() {
  background(0);
  
  // Only use shader if it's properly loaded
  if (theShader) {
    shader(theShader);
    
    // Update shader uniforms
    theShader.setUniform('u_time', millis() / 1000.0);
    theShader.setUniform('u_resolution', [width, height]);
    theShader.setUniform('u_mouse', [mouseX/width, mouseY/height]);
    
    // Add some rotation
    rotateY(frameCount * 0.01);
    rotateX(sin(frameCount * 0.005) * 0.5);
    
    // Draw the sphere with more segments for smoother shading
    sphere(200, 32, 32);
  }
}