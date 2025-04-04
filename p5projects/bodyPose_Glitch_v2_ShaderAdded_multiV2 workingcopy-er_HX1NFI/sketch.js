let video;

// array variable to hold the window width and height globally
let WandH = [];

// initialize bodypose variable and poses
let bodyPose;
let poses = [];

let glitchShader;
const MAX_FACES = 5; // Maximum number of faces to track

// Variables for video scaling
let newWidth, newHeight;
let x, y;

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

// Fragment shader program with integrated border drawing
const fragShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform float time;
uniform vec2 resolution;
uniform vec2 videoOffset;
uniform vec2 videoScale;

// Individual box uniforms
uniform vec4 box0; // x, y, size, enabled
uniform vec4 box1;
uniform vec4 box2;
uniform vec4 box3;
uniform vec4 box4;
uniform int numFaces;
uniform float borderWidth; // Width of the border in pixels

// Random function for noise
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Check if a point is inside a box
bool isInsideBox(vec2 uv, vec4 box) {
  // Convert normalized uv to pixel coordinates
  vec2 pixelUV = uv * resolution;
  
  // Get box parameters
  float boxX = box.x;
  float boxY = box.y;
  float boxSize = box.z;
  float boxEnabled = box.w;
  
  // Half size for centered box
  float halfSize = boxSize / 2.0;
  
  // Calculate box boundaries
  float boxLeft = boxX - halfSize;
  float boxRight = boxX + halfSize;
  float boxTop = boxY - halfSize; 
  float boxBottom = boxY + halfSize;
  
  // Check if point is in box and box is enabled
  return boxEnabled > 0.5 && 
         pixelUV.x >= boxLeft && pixelUV.x <= boxRight && 
         pixelUV.y >= boxTop && pixelUV.y <= boxBottom;
}

// Function to check if a pixel is on the border of a box
bool isOnBoxBorder(vec2 uv, vec4 box) {
  // Convert normalized uv to pixel coordinates
  vec2 pixelUV = uv * resolution;
  
  // Get box parameters
  float boxX = box.x;
  float boxY = box.y;
  float boxSize = box.z;
  float boxEnabled = box.w;
  
  if (boxEnabled < 0.5) return false;
  
  // Half size for centered box
  float halfSize = boxSize / 2.0;
  
  // Calculate box boundaries
  float boxLeft = boxX - halfSize;
  float boxRight = boxX + halfSize;
  float boxTop = boxY - halfSize; 
  float boxBottom = boxY + halfSize;
  
  // Calculate inner box boundaries (for border thickness)
  float innerLeft = boxLeft + borderWidth;
  float innerRight = boxRight - borderWidth;
  float innerTop = boxTop + borderWidth;
  float innerBottom = boxBottom - borderWidth;
  
  // Check if point is on the border
  bool isInsideOuter = pixelUV.x >= boxLeft && pixelUV.x <= boxRight && 
                      pixelUV.y >= boxTop && pixelUV.y <= boxBottom;
                      
  bool isInsideInner = pixelUV.x >= innerLeft && pixelUV.x <= innerRight && 
                      pixelUV.y >= innerTop && pixelUV.y <= innerBottom;
                      
  // It's on the border if it's inside the outer box but not inside the inner box
  return isInsideOuter && !isInsideInner;
}

void main() {
  // Flip the texture coords
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  
  // Adjust UV coordinates to account for video positioning and scaling
  vec2 adjustedUV = (uv * resolution - videoOffset) / videoScale;
  
  // Check if the adjusted UV is outside the video bounds (0-1)
  if (adjustedUV.x < 0.0 || adjustedUV.x > 1.0 || adjustedUV.y < 0.0 || adjustedUV.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black for areas outside video
    return;
  }
  
  // Get the webcam pixel color
  vec4 originalColor = texture2D(tex0, adjustedUV);
  
  // Check if inside any box
  bool insideAnyBox = false;
  
  if (numFaces > 0 && isInsideBox(uv, box0)) insideAnyBox = true;
  if (numFaces > 1 && isInsideBox(uv, box1)) insideAnyBox = true;
  if (numFaces > 2 && isInsideBox(uv, box2)) insideAnyBox = true;
  if (numFaces > 3 && isInsideBox(uv, box3)) insideAnyBox = true;
  if (numFaces > 4 && isInsideBox(uv, box4)) insideAnyBox = true;
  
  // Check if on any box border
  bool onAnyBorder = false;
  
  if (numFaces > 0 && isOnBoxBorder(uv, box0)) onAnyBorder = true;
  if (numFaces > 1 && isOnBoxBorder(uv, box1)) onAnyBorder = true;
  if (numFaces > 2 && isOnBoxBorder(uv, box2)) onAnyBorder = true;
  if (numFaces > 3 && isOnBoxBorder(uv, box3)) onAnyBorder = true;
  if (numFaces > 4 && isOnBoxBorder(uv, box4)) onAnyBorder = true;
  
  // If on border, draw red
  if (onAnyBorder) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Pure red for border
  }
  // If inside box (but not on border), apply glitch effect
  else if (insideAnyBox) {
    // Time-based glitch effect parameters
    float timeVal = time * 1.0;
    float timeValCut = time * 2.0;
    float timeValGlitch = time * 0.1;
    
    // Pixelation effect
    float pixelSize = 8.0 + sin(2.0) * 4.0;
    vec2 pixelUV = floor(adjustedUV * resolution / pixelSize) * pixelSize / resolution;
    
    // Glitch blocks
    float blockNoiseX = 0.0;
    float blockNoiseY = 0.0;
    
    // Create occasional horizontal shifting blocks
    if (random(vec2(floor(timeValCut * 2.0), floor(adjustedUV.y * 10.0))) > 0.8) {
      blockNoiseX = random(vec2(floor(timeValCut * 4.0), floor(adjustedUV.y * 20.0))) * 0.1;
    }
    
    // Create occasional vertical shifting blocks
    if (random(vec2(floor(timeValCut * 3.0), floor(adjustedUV.x * 10.0))) > 0.9) {
      blockNoiseY = random(vec2(floor(timeValCut * 3.0), floor(adjustedUV.x * 20.0))) * 0.1;
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
    float scanLine = sin(adjustedUV.y * 100.0 + timeVal * 51.0) > 0.9 ? 0.7 : 1.0;
    
    // Final composition with glitch effect
    gl_FragColor = vec4(
      redChannel.r + colorNoise,
      greenChannel.g,
      blueChannel.b - colorNoise,
      1.0
    ) * scanLine;
  } else {
    // Outside the box - use the original color
    gl_FragColor = originalColor;
  }
}
`;

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}


function setup() {
  // find initialized window width and height
  WandH = getWandH();
  
  // need to initialize with WEBGL to enable shader functionality 
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Create the video and hide it
  video = createCapture(VIDEO);
  video.hide();
  
  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
    
  // Initialize the shader
  glitchShader = createShader(vertShader, fragShader);
  
  // Set default border width
  glitchShader.setUniform('borderWidth', 3.0);
  
  // Print debug info
  console.log("Setup complete. Running with MAX_FACES =", MAX_FACES);
}

function draw() {
  background(0);
  
  // Calculate video dimensions and position to maintain aspect ratio and fill screen
  let canvasRatio = width / height;
  let videoRatio = video.width / video.height;
  
  if (canvasRatio > videoRatio) {
    // Canvas is wider than video
    newWidth = width;
    newHeight = width / videoRatio;
  } else {
    // Canvas is taller than video
    newHeight = height;
    newWidth = height * videoRatio;
  }
  
  // Calculate the video offset (centered)
  x = (width - newWidth) / 2;
  y = (height - newHeight) / 2;
  
  // Set the shader
  shader(glitchShader);
  
  // Send webcam texture to the shader
  glitchShader.setUniform('tex0', video);
  
  // Pass time and resolution to the shader
  glitchShader.setUniform('time', frameCount * 0.01);
  glitchShader.setUniform('resolution', [width, height]);
  
  // Pass video offset and scale to shader for proper UV mapping
  glitchShader.setUniform('videoOffset', [x, y]);
  glitchShader.setUniform('videoScale', [newWidth, newHeight]);
  
  // Set the number of active faces (capped at MAX_FACES)
  let numActiveFaces = min(poses.length, MAX_FACES);
  
  // Initialize box defaults (center of screen, size 100, disabled)
  let boxDefaults = [width/2, height/2, 100, 0.0];
  
  // Create individual box data for each potential face
  let box0 = [...boxDefaults];
  let box1 = [...boxDefaults];
  let box2 = [...boxDefaults];
  let box3 = [...boxDefaults];
  let box4 = [...boxDefaults];
  
  // Update boxes based on detected poses
  // We need to scale the coordinates to account for the video scaling
  for (let i = 0; i < numActiveFaces; i++) {
    if (poses[i] && poses[i].nose && poses[i].left_eye && poses[i].right_eye) {
      // Scale the coordinates based on our video dimensions
      let scaleX = newWidth / video.width;
      let scaleY = newHeight / video.height;
      
      let noseX = poses[i].nose.x * scaleX + x;
      let noseY = poses[i].nose.y * scaleY + y;
      
      let eye1X = poses[i].left_eye.x * scaleX + x;
      let eye1Y = poses[i].left_eye.y * scaleY + y;
      let eye2X = poses[i].right_eye.x * scaleX + x;
      let eye2Y = poses[i].right_eye.y * scaleY + y;
      let eyeDist = dist(eye1X, eye1Y, eye2X, eye2Y);
      
      // Create box data: [x, y, size, enabled]
      let boxData = [noseX, noseY - eyeDist, eyeDist * 4, 1.0];
      
      // Update the appropriate box
      if (i === 0) box0 = boxData;
      if (i === 1) box1 = boxData;
      if (i === 2) box2 = boxData;
      if (i === 3) box3 = boxData;
      if (i === 4) box4 = boxData;
    }
  }
  
  // Pass the number of active faces
  glitchShader.setUniform('numFaces', numActiveFaces);
  
  // Pass all boxes to the shader as individual uniforms
  glitchShader.setUniform('box0', box0);
  glitchShader.setUniform('box1', box1);
  glitchShader.setUniform('box2', box2);
  glitchShader.setUniform('box3', box3);
  glitchShader.setUniform('box4', box4);
  
  // Draw a rectangle that covers the entire canvas to apply the shader
  // In WEBGL mode, rect() draws from the center
  rect(0, 0, width, height);
  
  // Debug: Draw the red boxes for all detected faces
  // Comment out this section if you don't need the debug visualization
  /*
  push();
  rectMode(CENTER);
  noFill();
  stroke(255, 0, 0);
  strokeWeight(5);
  
  for (let i = 0; i < numActiveFaces; i++) {
    if (poses[i] && poses[i].nose && poses[i].left_eye && poses[i].right_eye) {
      let scaleX = newWidth / video.width;
      let scaleY = newHeight / video.height;
      
      let noseX = poses[i].nose.x * scaleX + x;
      let noseY = poses[i].nose.y * scaleY + y;
      
      let eye1X = poses[i].left_eye.x * scaleX + x;
      let eye1Y = poses[i].left_eye.y * scaleY + y;
      let eye2X = poses[i].right_eye.x * scaleX + x;
      let eye2Y = poses[i].right_eye.y * scaleY + y;
      let eyeDist = dist(eye1X, eye1Y, eye2X, eye2Y);
      
      // Draw the red box for this face
      translate(noseX - width/2, noseY - height/2, 0);
      square(0, 0, eyeDist);
      translate(-(noseX - width/2), -(noseY - height/2), 0);
    }
  }
  pop();
  */
}

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}

// Function to show fullscreen
function doubleClicked() {
  let fs = fullscreen();
  fullscreen(!fs);
}

// Handle window resize to maintain fullscreen behavior
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  WandH = getWandH();
}

function getWandH() {
  return [window.innerWidth, window.innerHeight];
}