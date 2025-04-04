let cam;
let glitchShader;

console.log(navigator.userAgent)

// Vertex shader program
const vertShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;

// Fragment shader program
const fragShader = `
precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D tex0;
uniform float time;
uniform vec2 resolution;

// Random function for noise
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  // Flip the texture coords
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  
  // Time-based glitch effect parameters
  float timeVal = time * 1.0;

  float timeValCut = time*2.0;
  float timeValGlitch = time*0.1;
  // float timeValPixel = time * 0.1;
  
  // Pixelation effect
  float pixelSize = 8.0 + sin( 2.0) * 4.0;
  vec2 pixelUV = floor(uv * resolution / pixelSize) * pixelSize / resolution;
  
  // Glitch blocks
  float blockNoiseX = 0.0;
  float blockNoiseY = 0.0;

  // Create occasional horizontal shifting blocks
  if (random(vec2(floor(timeValCut * 2.0), floor(uv.y * 10.0))) > 0.8) {
    blockNoiseX = random(vec2(floor(timeValCut * 4.0), floor(uv.y * 20.0))) * 0.1;
  }
  
  // Create occasional vertical shifting blocks
  if (random(vec2(floor(timeValCut * 3.0), floor(uv.x * 10.0))) > 0.9) {
    blockNoiseY = random(vec2(floor(timeValCut * 3.0), floor(uv.x * 20.0))) * 0.1;
  }
  
  // Apply glitch displacement
  vec2 glitchUV = pixelUV;
  glitchUV.x += blockNoiseX;
  glitchUV.y += blockNoiseY;
  
  // Create RGB splitting based on time
  float rgbSplitAmount = 0.005 + sin(timeValGlitch/100000.0) * 0.003;
  
  // Sample texture with RGB splitting
  vec4 redChannel = texture2D(tex0, glitchUV + vec2(rgbSplitAmount, 0.0));
  vec4 greenChannel = texture2D(tex0, glitchUV);
  vec4 blueChannel = texture2D(tex0, glitchUV - vec2(rgbSplitAmount, 0.0));
  
  // Color noise
  float colorNoise = random(glitchUV + timeVal/10000.0) * 0.15;
  
  // Create occasional scan lines
  float scanLine = sin(uv.y * 100.0 + timeVal * 51.0) > 0.9 ? 0.7 : 1.0;
  
  // Final composition
  gl_FragColor = vec4(
    redChannel.r + colorNoise,
    greenChannel.g,
    blueChannel.b - colorNoise,
    1.0
  ) * scanLine;
  

}
`;

function setup() {
  createCanvas(640, 480, WEBGL);
  
  // Initialize webcam
  cam = createCapture(VIDEO);
  cam.size(640, 480);
  cam.hide();
  
  // Initialize the shader
  glitchShader = createShader(vertShader, fragShader);
  
  // Disable default texture flipping
  textureWrap(CLAMP);
}

function draw() {
  // Set the shader
  shader(glitchShader);
  
  // Send webcam texture to the shader
  glitchShader.setUniform('tex0', cam);
  
  // Pass time and resolution to the shader
  glitchShader.setUniform('time', frameCount * 0.01);
  glitchShader.setUniform('resolution', [width, height]);
  
  // Draw a rectangle to apply the shader
  rect(0, 0, width, height);
}

// Handle window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Function to show fullscreen
function doubleClicked() {
  let fs = fullscreen();
  fullscreen(!fs);
}