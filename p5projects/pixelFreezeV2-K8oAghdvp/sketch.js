let video;
let prevFrame;
let currFrame;
let frozenFrame;

// Effect controls
let frameHoldDuration = 120;     // How long to hold frozen frames (in frames)
let motionThreshold = 30;        // Amount of motion needed to trigger a freeze
let displacementStrength = 8.0;  // How strongly new frames displace frozen pixels
let useBlockArtifacts = true;    // Use block-based artifacts (more like real compression)
let blockSize = 16;              // Size of blocks for block-based artifacts
let glitchProbability = 0.03;    // Probability of a random glitch per frame
let keyframeInterval = 300;      // Force a new keyframe after this many frames
let showDebug = false;           // Toggle debug visualization

// Internal variables
let isFrozen = false;            // Is the frame currently frozen?
let timeSinceFreeze = 0;         // Frames since last freeze
let timeSinceKeyframe = 0;       // Frames since last keyframe
let blockMotionVectors = [];     // Motion vectors for blocks
let forceTrigger = false;        // Flag to force a new freeze

function setup() {
  createCanvas(640, 480);
  pixelDensity(1); // For consistent pixel manipulation
  
  // Create video capture
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  // Initialize our frame buffers
  prevFrame = createGraphics(width, height);
  currFrame = createGraphics(width, height);
  frozenFrame = createGraphics(width, height);
  
  // Initialize block motion vectors
  const numBlocksX = Math.ceil(width / blockSize);
  const numBlocksY = Math.ceil(height / blockSize);
  for (let y = 0; y < numBlocksY; y++) {
    for (let x = 0; x < numBlocksX; x++) {
      blockMotionVectors.push({
        x: 0,
        y: 0,
        motionAmount: 0
      });
    }
  }
  
  // Create UI controls
  createUI();
}

function draw() {
  // Capture current frame from video
  currFrame.image(video, 0, 0, width, height);
  
  // Increment timers
  timeSinceFreeze++;
  timeSinceKeyframe++;
  
  // Check if we should trigger a new freeze
  let shouldFreeze = false;
  
  // Calculate global motion amount
  let totalMotion = calculateMotion();
  
  // Force a new keyframe after keyframeInterval
  if (timeSinceKeyframe >= keyframeInterval) {
    isFrozen = false;
    timeSinceKeyframe = 0;
  }
  
  // Trigger freeze based on motion or force trigger
  if (!isFrozen && (totalMotion > motionThreshold || forceTrigger || random() < glitchProbability)) {
    isFrozen = true;
    timeSinceFreeze = 0;
    frozenFrame.image(prevFrame, 0, 0);
    forceTrigger = false;
  }
  
  // End freeze if we've reached the hold duration
  if (isFrozen && timeSinceFreeze >= frameHoldDuration) {
    isFrozen = false;
  }
  
  // Start pixel manipulation
  loadPixels();
  
  if (isFrozen) {
    // When frozen, we use the frozen frame but displace pixels based on motion
    frozenFrame.loadPixels();
    currFrame.loadPixels();
    
    if (useBlockArtifacts) {
      // Block-based displacement (more like real compression artifacts)
      applyBlockDisplacement();
    } else {
      // Pixel-by-pixel displacement
      applyPixelDisplacement();
    }
  } else {
    // When not frozen, just display the current frame
    currFrame.loadPixels();
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = currFrame.pixels[i];
    }
  }
  
  // Display the processed frame
  updatePixels();
  
  // Debug visualization
  if (showDebug) {
    drawDebugOverlay(totalMotion);
  }
  
  // Update previous frame for next cycle
  prevFrame.image(currFrame, 0, 0);
}

function calculateMotion() {
  currFrame.loadPixels();
  prevFrame.loadPixels();
  
  let totalDiff = 0;
  const numBlocksX = Math.ceil(width / blockSize);
  const numBlocksY = Math.ceil(height / blockSize);
  
  // Calculate motion for each block
  for (let by = 0; by < numBlocksY; by++) {
    for (let bx = 0; bx < numBlocksX; bx++) {
      const blockIndex = by * numBlocksX + bx;
      let blockDiff = 0;
      let sampleCount = 0;
      
      // Sample points within block
      for (let y = by * blockSize; y < (by + 1) * blockSize && y < height; y += 4) {
        for (let x = bx * blockSize; x < (bx + 1) * blockSize && x < width; x += 4) {
          const i = (y * width + x) * 4;
          
          // Calculate color difference
          const rDiff = abs(currFrame.pixels[i] - prevFrame.pixels[i]);
          const gDiff = abs(currFrame.pixels[i+1] - prevFrame.pixels[i+1]);
          const bDiff = abs(currFrame.pixels[i+2] - prevFrame.pixels[i+2]);
          blockDiff += (rDiff + gDiff + bDiff) / 3;
          sampleCount++;
        }
      }
      
      // Average difference for this block
      blockDiff = sampleCount > 0 ? blockDiff / sampleCount : 0;
      blockMotionVectors[blockIndex].motionAmount = blockDiff;
      
      // Update motion vectors (simplified)
      if (blockDiff > 10) {
        blockMotionVectors[blockIndex].x = random(-displacementStrength, displacementStrength);
        blockMotionVectors[blockIndex].y = random(-displacementStrength, displacementStrength);
      } else {
        // Decay motion vectors
        blockMotionVectors[blockIndex].x *= 0.95;
        blockMotionVectors[blockIndex].y *= 0.95;
      }
      
      totalDiff += blockDiff;
    }
  }
  
  return totalDiff / (numBlocksX * numBlocksY);
}

function applyBlockDisplacement() {
  const numBlocksX = Math.ceil(width / blockSize);
  
  // For each block
  for (let by = 0; by < height / blockSize; by++) {
    for (let bx = 0; bx < width / blockSize; bx++) {
      const blockIndex = by * numBlocksX + bx;
      
      // Get this block's motion vector
      const mvX = blockMotionVectors[blockIndex].x;
      const mvY = blockMotionVectors[blockIndex].y;
      
      // Apply displacement to the entire block
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const pixelX = bx * blockSize + x;
          const pixelY = by * blockSize + y;
          
          if (pixelX >= width || pixelY >= height) continue;
          
          // Calculate source position with displacement
          const sourceX = constrain(pixelX + int(mvX), 0, width - 1);
          const sourceY = constrain(pixelY + int(mvY), 0, height - 1);
          
          // Copy the pixel
          const destIndex = (pixelY * width + pixelX) * 4;
          const sourceIndex = (sourceY * width + sourceX) * 4;
          
          pixels[destIndex] = frozenFrame.pixels[sourceIndex];
          pixels[destIndex+1] = frozenFrame.pixels[sourceIndex+1];
          pixels[destIndex+2] = frozenFrame.pixels[sourceIndex+2];
          pixels[destIndex+3] = 255;
        }
      }
    }
  }
}

function applyPixelDisplacement() {
  const numBlocksX = Math.ceil(width / blockSize);
  
  // For each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Find which block this pixel belongs to
      const blockX = Math.floor(x / blockSize);
      const blockY = Math.floor(y / blockSize);
      const blockIndex = blockY * numBlocksX + blockX;
      
      // Get motion vector for this pixel's block
      const mvX = blockMotionVectors[blockIndex].x;
      const mvY = blockMotionVectors[blockIndex].y;
      
      // Calculate source position with displacement
      const sourceX = constrain(x + int(mvX), 0, width - 1);
      const sourceY = constrain(y + int(mvY), 0, height - 1);
      
      // Copy the pixel
      const destIndex = (y * width + x) * 4;
      const sourceIndex = (sourceY * width + sourceX) * 4;
      
      pixels[destIndex] = frozenFrame.pixels[sourceIndex];
      pixels[destIndex+1] = frozenFrame.pixels[sourceIndex+1];
      pixels[destIndex+2] = frozenFrame.pixels[sourceIndex+2];
      pixels[destIndex+3] = 255;
    }
  }
}

function drawDebugOverlay(motionAmount) {
  const numBlocksX = Math.ceil(width / blockSize);
  
  // Draw motion vectors for blocks
  stroke(255, 0, 0);
  strokeWeight(1);
  
  for (let by = 0; by < height / blockSize; by++) {
    for (let bx = 0; bx < width / blockSize; bx++) {
      const blockIndex = by * numBlocksX + bx;
      const centerX = bx * blockSize + blockSize/2;
      const centerY = by * blockSize + blockSize/2;
      
      const mvX = blockMotionVectors[blockIndex].x;
      const mvY = blockMotionVectors[blockIndex].y;
      
      if (abs(mvX) > 0.5 || abs(mvY) > 0.5) {
        line(centerX, centerY, centerX + mvX, centerY + mvY);
      }
    }
  }
  
  // Display current settings and state
  fill(255);
  noStroke();
  text(`Motion Amount: ${motionAmount.toFixed(2)}`, 10, 20);
  text(`Threshold: ${motionThreshold}`, 10, 40);
  text(`Frozen: ${isFrozen ? 'Yes' : 'No'}`, 10, 60);
  text(`Time Since Freeze: ${timeSinceFreeze}`, 10, 80);
  text(`Time Since Keyframe: ${timeSinceKeyframe}`, 10, 100);
  text(`Block Size: ${blockSize}px`, 10, 120);
  text(`Displacement: ${displacementStrength.toFixed(1)}`, 10, 140);
}

function createUI() {
  // Creating sliders for controlling the effect
  createP('Extreme Datamoshing Controls');
  
  createP('Frame Hold Duration:');
  let durationSlider = createSlider(30, 300, frameHoldDuration, 10);
  durationSlider.input(() => { frameHoldDuration = durationSlider.value(); });
  
  createP('Motion Threshold:');
  let thresholdSlider = createSlider(5, 100, motionThreshold, 1);
  thresholdSlider.input(() => { motionThreshold = thresholdSlider.value(); });
  
  createP('Displacement Strength:');
  let strengthSlider = createSlider(0, 20, displacementStrength, 0.5);
  strengthSlider.input(() => { displacementStrength = strengthSlider.value(); });
  
  createP('Block Size:');
  let blockSlider = createSlider(4, 64, blockSize, 4);
  blockSlider.input(() => { 
    blockSize = blockSlider.value(); 
    // Reinitialize block motion vectors
    blockMotionVectors = [];
    const numBlocksX = Math.ceil(width / blockSize);
    const numBlocksY = Math.ceil(height / blockSize);
    for (let y = 0; y < numBlocksY; y++) {
      for (let x = 0; x < numBlocksX; x++) {
        blockMotionVectors.push({
          x: 0,
          y: 0,
          motionAmount: 0
        });
      }
    }
  });
  
  createP('Keyframe Interval:');
  let keyframeSlider = createSlider(100, 600, keyframeInterval, 50);
  keyframeSlider.input(() => { keyframeInterval = keyframeSlider.value(); });
  
  createP('Random Glitch Probability:');
  let glitchSlider = createSlider(0, 0.1, glitchProbability, 0.005);
  glitchSlider.input(() => { glitchProbability = glitchSlider.value(); });
  
  let blockModeCheckbox = createCheckbox('Use Block Artifacts', useBlockArtifacts);
  blockModeCheckbox.changed(() => { useBlockArtifacts = blockModeCheckbox.checked(); });
  
  let debugButton = createButton('Toggle Debug View');
  debugButton.mousePressed(() => { showDebug = !showDebug; });
  
  let freezeButton = createButton('FORCE DATAMOSH');
  freezeButton.style('background-color', '#ff0000');
  freezeButton.style('color', '#ffffff');
  freezeButton.style('padding', '10px');
  freezeButton.style('font-weight', 'bold');
  freezeButton.mousePressed(() => { forceTrigger = true; });
  
  let resetButton = createButton('Reset Effect');
  resetButton.mousePressed(() => {
    isFrozen = false;
    timeSinceFreeze = 0;
    timeSinceKeyframe = 0;
  });
}

// Add keyboard shortcuts
function keyPressed() {
  if (key === 'd' || key === 'D') {
    showDebug = !showDebug;
  } else if (key === 'r' || key === 'R') {
    // Reset effect
    isFrozen = false;
    timeSinceFreeze = 0;
    timeSinceKeyframe = 0;
  } else if (key === 'f' || key === 'F') {
    // Force a freeze
    forceTrigger = true;
  } else if (key === '1') {
    // Preset: Subtle effect
    frameHoldDuration = 60;
    motionThreshold = 40;
    displacementStrength = 3.0;
    blockSize = 8;
    glitchProbability = 0.01;
  } else if (key === '2') {
    // Preset: Medium effect
    frameHoldDuration = 120;
    motionThreshold = 30;
    displacementStrength = 8.0;
    blockSize = 16;
    glitchProbability = 0.03;
  } else if (key === '3') {
    // Preset: Extreme effect
    frameHoldDuration = 200;
    motionThreshold = 20;
    displacementStrength = 15.0;
    blockSize = 32;
    glitchProbability = 0.05;
  }
}