let video;
let bodyPose;
let poses = [];
let connections;
let glitchShader;
const MAX_FACES = 5; // Maximum number of faces we'll track

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

// Fragment shader program - simplified to use individual box uniforms
const fragShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform float time;
uniform vec2 resolution;

// Individual box uniforms instead of arrays for better compatibility
uniform vec4 box0; // x, y, size, enabled
uniform vec4 box1;
uniform vec4 box2;
uniform vec4 box3;
uniform vec4 box4;
uniform int numFaces;

// Random function for noise
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}


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
  // We need to compare directly with pixelUV.y without adjusting it
  // since we already flipped the uv coordinates when we created the uv variable
  return boxEnabled > 0.5 && 
         pixelUV.x >= boxLeft && pixelUV.x <= boxRight && 
         pixelUV.y >= boxTop && pixelUV.y <= boxBottom;
}

void main() {
  // Flip the texture coords
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  
  // Get the webcam pixel color
  vec4 originalColor = texture2D(tex0, uv);
  
  // Check if inside any box explicitly
  bool insideAnyBox = false;
  
  if (numFaces > 0 && isInsideBox(uv, box0)) insideAnyBox = true;
  if (numFaces > 1 && isInsideBox(uv, box1)) insideAnyBox = true;
  if (numFaces > 2 && isInsideBox(uv, box2)) insideAnyBox = true;
  if (numFaces > 3 && isInsideBox(uv, box3)) insideAnyBox = true;
  if (numFaces > 4 && isInsideBox(uv, box4)) insideAnyBox = true;
  
  if (insideAnyBox) {
    // Time-based glitch effect parameters
    float timeVal = time * 1.0;
    float timeValCut = time * 2.0;
    float timeValGlitch = time * 0.1;
    
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
  createCanvas(640, 480, WEBGL);
  
  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  
  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();
  
  // Initialize the shader
  glitchShader = createShader(vertShader, fragShader);
  
  // Disable default texture flipping
  textureWrap(CLAMP);
  
  // Print debug info
  console.log("Setup complete. Running with MAX_FACES =", MAX_FACES);
}

function draw() {
  // Set the number of active faces (capped at MAX_FACES)
  let numActiveFaces = min(poses.length, MAX_FACES);
  // console.log("Active faces:", numActiveFaces);
  
  // Initialize box defaults (center of screen, size 100, disabled)
  let boxDefaults = [width/2, height/2, 100, 0.0];
  
  // Create individual box data for each potential face
  let box0 = [...boxDefaults];
  let box1 = [...boxDefaults];
  let box2 = [...boxDefaults];
  let box3 = [...boxDefaults];
  let box4 = [...boxDefaults];
  
  // Update boxes based on detected poses
  for (let i = 0; i < numActiveFaces; i++) {
    if (poses[i] && poses[i].nose && poses[i].left_eye && poses[i].right_eye) {
      let noseX = poses[i].nose.x;
      let noseY = poses[i].nose.y;
      
      let eye1X = poses[i].left_eye.x;
      let eye1Y = poses[i].left_eye.y;
      let eye2X = poses[i].right_eye.x;
      let eye2Y = poses[i].right_eye.y;
      let eyeDist = dist(eye1X, eye1Y, eye2X, eye2Y);
      
      // Create box data: [x, y, size, enabled]
      let boxData = [noseX, noseY - eyeDist, eyeDist * 4, 1.0];
      
      // Update the appropriate box
      if (i === 0) box0 = boxData;
      if (i === 1) box1 = boxData;
      if (i === 2) box2 = boxData;
      if (i === 3) box3 = boxData;
      if (i === 4) box4 = boxData;
      
      // Debug: Log box positions
      // console.log(`Face ${i} box: x=${boxData[0]}, y=${boxData[1]}, size=${boxData[2]}`);
    }
  }
  
  // Set the shader
  shader(glitchShader);
  
  // Send webcam texture to the shader
  glitchShader.setUniform('tex0', video);
  
  // Pass time and resolution to the shader
  glitchShader.setUniform('time', frameCount * 0.01);
  glitchShader.setUniform('resolution', [width, height]);
  
  // Pass the number of active faces
  glitchShader.setUniform('numFaces', numActiveFaces);
  
  // Pass all boxes to the shader as individual uniforms
  glitchShader.setUniform('box0', box0);
  glitchShader.setUniform('box1', box1);
  glitchShader.setUniform('box2', box2);
  glitchShader.setUniform('box3', box3);
  glitchShader.setUniform('box4', box4);
  
  // Draw a rectangle that covers the entire canvas to apply the shader
  rect(0, 0, width, height);
  
  // Debug: Draw the red boxes for all detected faces
  push();
  // translate(-width/2, -height/2, 0);
  rectMode(CENTER);
  noFill();
  stroke(255, 0, 0);
  strokeWeight(5);
  
  for (let i = 0; i < numActiveFaces; i++) {
    if (poses[i] && poses[i].nose && poses[i].left_eye && poses[i].right_eye) {
      let eye1X = poses[i].left_eye.x;
      let eye1Y = poses[i].left_eye.y;
      let eye2X = poses[i].right_eye.x;
      let eye2Y = poses[i].right_eye.y;
      let eyeDist = dist(eye1X, eye1Y, eye2X, eye2Y);
      
      // Draw the red box for this face
      square(poses[i].nose.x, poses[i].nose.y - eyeDist, eyeDist*5);
    }
  }
  
  // square(100,100,100)
  
  pop();
  
  push()
   rectMode(CENTER);
  fill(255,0,0)
  noFill();
  stroke(255, 0, 0);
  
  strokeWeight(19);
  if (poses[0] ) {
    
   let eye1X = poses[0].left_eye.x;
      let eye1Y = poses[0].left_eye.y;
      let eye2X = poses[0].right_eye.x;
      let eye2Y = poses[0].right_eye.y;
      let eyeDist = dist(eye1X, eye1Y, eye2X, eye2Y);
  square(poses[0].nose.x, poses[0].nose.y - eyeDist, eyeDist*4);
  }
 
  pop()
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