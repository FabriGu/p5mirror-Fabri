let video;
let bodyPose;
let poses = [];
let connections;
let glitchShader;

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

// Fragment shader program - modified to include a mask for the glitch effect
const fragShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform float time;
uniform vec2 resolution;
uniform vec4 glitchBox; // x, y, size, enabled

// Random function for noise
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  // Flip the texture coords
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  
  // Get the webcam pixel color
  vec4 originalColor = texture2D(tex0, uv);
  
  // Check if the current pixel is inside the glitch box
  float boxSize = glitchBox.z;
  float halfSize = boxSize / 2.0;
  vec2 boxCenter = vec2(glitchBox.x / resolution.x, 1.0 - (glitchBox.y / resolution.y));
  vec2 boxMin = boxCenter - vec2(halfSize / resolution.x, halfSize / resolution.y);
  vec2 boxMax = boxCenter + vec2(halfSize / resolution.x, halfSize / resolution.y);
  
  bool insideBox = glitchBox.w > 0.5 && 
                   uv.x >= boxMin.x && uv.x <= boxMax.x && 
                   uv.y >= boxMin.y && uv.y <= boxMax.y;
  
  if (insideBox) {
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
  bodyPose = ml5.bodyPose("MoveNet",
                          {modelType: "MULTIPOSE_LIGHTNING", // "MULTIPOSE_LIGHTNING", "SINGLEPOSE_LIGHTNING", or "SINGLEPOSE_THUNDER".
  enableSmoothing: true,
  minPoseScore: 0.25,
  multiPoseMaxDimension: 256,
  enableTracking: true,
  trackerType: "boundingBox", // "keypoint" or "boundingBox"
  trackerConfig: {},
  modelUrl: undefined,
  flipped: false
                          });
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
}

function draw() {
  // Set default shader parameters
  let boxX = width / 2;
  let boxY = height / 2;
  let boxSize = 100;
  let boxEnabled = 0.0; // 0.0 = disabled, 1.0 = enabled
  
  // If poses detected, update the box position and enable it
  if (poses.length) {
    // console.log(poses[poses.length-1])
    for(let i = 0; i < poses.length; i++) {
      console.log(i)

      let noseX = poses[i].nose.x;
      let noseY = poses[i].nose.y;

      let eye1X = poses[i].left_eye.x;
      let eye1Y = poses[i].left_eye.y;
      let eye2X = poses[i].right_eye.x;
      let eye2Y = poses[i].right_eye.y;
      let eyeDist = dist(eye1X, eye1Y, eye2X, eye2Y);

      // Update box parameters with nose position and eye distance
      boxX = noseX;
      boxY = noseY - eyeDist;
      boxSize = eyeDist * 4;
      boxEnabled = 1.0;
    }
  }
  
  // Set the shader
  shader(glitchShader);
  
  // Send webcam texture to the shader
  glitchShader.setUniform('tex0', video);
  
  // Pass time and resolution to the shader
  glitchShader.setUniform('time', frameCount * 0.01);
  glitchShader.setUniform('resolution', [width, height]);
  
  // Pass the glitch box parameters to the shader
  glitchShader.setUniform('glitchBox', [boxX, boxY, boxSize, boxEnabled]);
  
  // Draw a rectangle that covers the entire canvas to apply the shader
  rect(0, 0, width, height);
  
  // Draw the red box outline (if poses are detected)
  if (poses.length) {
    for(let i = 0; i < poses.length; i++) {
      console.log(i)
      let eye1X = poses[i].left_eye.x;
      let eye1Y = poses[i].left_eye.y;
      let eye2X = poses[i].right_eye.x;
      let eye2Y = poses[i].right_eye.y;
      let eyeDist = dist(eye1X, eye1Y, eye2X, eye2Y);

      // Convert from WEBGL coordinates to screen coordinates
      push();
      translate(-width/2, -height/2, 0);

      // Draw the red box
      rectMode(CENTER);
      noFill();
      stroke(255, 0, 0);
      strokeWeight(5);
      square(poses[i].nose.x, poses[i].nose.y - eyeDist/2, eyeDist*4);

      pop();
    }
  }
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