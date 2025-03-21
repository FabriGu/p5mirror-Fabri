// Shader variables
let shaderProgram;
let time = 0;

// Vertex shader - keeps track of positions
const vertShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}`;

// Fragment shader - your pattern generator
const fragShader = `
precision mediump float;

varying vec2 vTexCoord;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define PI 4.0
#define TWO_PI 8.0

mat2 rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle),
              sin(angle), cos(angle));
}

float squareCircle(vec2 st, float radius) {
  float angle = atan(st.y, st.x);
  float dist = length(st);
  float modRadius = radius * (cos(angle * 2.0) * 0.2 + 0.8);
  float shape = smoothstep(modRadius-0.01, modRadius, dist);
  return 1.0 - shape;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st = st * 2.0 - 1.0;
  st.x *= u_resolution.x/u_resolution.y;
  
  vec3 color = vec3(0.0);
  
  for(float i = 0.0; i < 5.0; i++) {
    vec2 pos = st;
    float angle = u_time * (0.1 + i * 0.05);
    pos = rotate2d(angle) * pos;
    
    float shape = squareCircle(pos, 0.2 + i * 0.15);
    color += vec3(shape * (0.8 - i * 0.15));
  }
  
  vec2 mousePos = u_mouse * 2.0 - 1.0;
  mousePos.x *= u_resolution.x/u_resolution.y;
  float mouseDist = length(st - mousePos);
  float ripple = sin(mouseDist * PI * 8.0 - u_time * 5.0) * 0.5 + 0.5;
  ripple *= smoothstep(1.0, 0.0, mouseDist);
  
  color = mix(
    vec3(0.2, 0.5, 0.8),
    vec3(0.8, 0.2, 0.5),
    color + ripple * 0.3
  );
  
  color *= 0.8 + 0.2 * sin(u_time);
  
  gl_FragColor = vec4(color, 1.0);
}`;

function preload() {
  // Create shader in preload
  shaderProgram = createShader(vertShader, fragShader);
}

function setup() {
  // Create a WebGL canvas
  createCanvas(800, 800, WEBGL);
  
  // No stroke on shapes
  noStroke();
}

function draw() {
  // Update the time variable
  time += 0.01;
  
  // Set shader as active each frame
  shader(shaderProgram);
  
  // Update shader uniforms
  shaderProgram.setUniform('u_resolution', [width, height]);
  shaderProgram.setUniform('u_time', time);
  shaderProgram.setUniform('u_mouse', [mouseX/width, mouseY/height]);
  
  // Draw a rectangle that covers the entire canvas
  // This is where the shader will be applied
  rect(-width/2, -height/2, width, height);
}