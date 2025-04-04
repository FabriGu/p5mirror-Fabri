let video;
let bodyPose;
let poses = [];
let connections;
let mainCanvas;
let faceGraphics = []; // Pre-create graphics buffers for each face

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
  
  // Get the webcam pixel color
  vec4 originalColor = texture2D(tex0, uv);
  
  // Time-based glitch effect parameters
  float timeVal = time * 1.0;
  float timeValCut = time * 2.0;
  float timeValGlitch = time * 0.1;
  
  // Pixelation effect
  float pixelSize = 8.0 + sin(timeVal * 2.0) * 4.0;
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
  
  // Final composition with glitch effect
  gl_FragColor = vec4(
    redChannel.r + colorNoise,
    greenChannel.g,
    blueChannel.b - colorNoise,
    1.0
  ) * scanLine;
}
`;

const MAX_FACES = 5; // Maximum number of faces we'll track

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  // Create the main canvas in regular 2D mode
  mainCanvas = createCanvas(640, 480);
  
  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  
  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();
  
  // Initialize graphics buffers for each potential face
  // Each gets its own WEBGL context with its own shader
  for (let i = 0; i < MAX_FACES; i++) {
    // Create a placeholder graphics buffer (we'll resize it when needed)
    let gfx = createGraphics(100, 100, WEBGL);
    
    // Create shader for this specific graphics context
    let shader = gfx.createShader(vertShader, fragShader);
    
    // Store the graphics buffer and its shader
    faceGraphics.push({
      graphics: gfx,
      shader: shader,
      isActive: false
    });
  }
  
  console.log("Setup complete with", MAX_FACES, "face buffers");
}

function draw() {
  // Draw the webcam video as background
  image(video, 0, 0, width, height);
  
  // Reset all face graphics to inactive
  for (let i = 0; i < faceGraphics.length; i++) {
    faceGraphics[i].isActive = false;
  }
  
  // Set the number of active faces (capped at MAX_FACES)
  let numActiveFaces = min(poses.length, MAX_FACES);
  
  // Process each detected face
  for (let i = 0; i < numActiveFaces; i++) {
    if (poses[i] && poses[i].nose && poses[i].left_eye && poses[i].right_eye) {
      let noseX = poses[i].nose.x;
      let noseY = poses[i].nose.y;
      
      let eye1X = poses[i].left_eye.x;
      let eye1Y = poses[i].left_eye.y;
      let eye2X = poses[i].right_eye.x;
      let eye2Y = poses[i].right_eye.y;
      let eyeDist = dist(eye1X, eye1Y, eye2X, eye2Y);
      
      // Calculate face box dimensions
      let boxSize = eyeDist * 4;
      let boxX = noseX;
      let boxY = noseY - eyeDist/2;
      
      // Draw red box outline
      push();
      rectMode(CENTER);
      noFill();
      stroke(255, 0, 0);
      strokeWeight(5);
      square(boxX, boxY, boxSize);
      pop();
      
      // Draw glitch effect for this face
      drawGlitchEffectForFace(i, boxX, boxY, boxSize);
      
      // Mark this face buffer as active
      faceGraphics[i].isActive = true;
    }
  }
}

// Apply a glitch effect for a single face
function drawGlitchEffectForFace(faceIndex, x, y, size) {
  // Get the graphics buffer for this face
  let faceBuffer = faceGraphics[faceIndex];
  let gfx = faceBuffer.graphics;
  let shader = faceBuffer.shader;
  
  // Resize the graphics buffer if needed
  if (gfx.width !== size || gfx.height !== size) {
    gfx.resizeCanvas(size, size);
  }
  
  // Clear the graphics buffer and set up for drawing
  gfx.clear();
  
  // Set the shader for this specific graphics context
  gfx.shader(shader);
  
  // Calculate the region of the video to sample
  let halfSize = size / 2;
  
  // Set shader uniforms
  shader.setUniform('tex0', video);
  shader.setUniform('time', frameCount * 0.01);
  shader.setUniform('resolution', [size, size]);
  
  // Draw the rectangle with shader in the graphics buffer
  gfx.rect(0, 0, size, size);
  
  // Draw the resulting graphics buffer onto the main canvas
  // Calculate the correct position (top-left corner in draw mode)
  let displayX = x - halfSize;
  let displayY = y - halfSize;
  
  // Draw the effect on the main canvas
  image(gfx, displayX, displayY);
}

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
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