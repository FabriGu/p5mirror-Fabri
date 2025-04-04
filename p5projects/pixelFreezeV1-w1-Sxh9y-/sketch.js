let video;
let prevFrame;
let currFrame;
let isCapturing = false;

// Effect controls
let freezeThreshold = 30;      // Pixel difference threshold to trigger freezing
let freezeProbability = 0.2;   // Probability of freezing a pixel
let freezeDuration = 60;       // How long pixels stay frozen (in frames)
let motionSensitivity = 5.0;   // How sensitive the effect is to motion
let glitchStrength = 0.8;      // How strongly new frames displace frozen pixels
let colorBlendRate = 0.05;     // How quickly frozen pixels blend to new colors
let showDebug = false;         // Toggle debug visualization

// Internal variables
let frozenPixels = [];         // Array to track which pixels are frozen
let freezeTimers = [];         // How long each pixel has been frozen
let motionVectors = [];        // Store motion vectors for each pixel

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
  
  // Initialize arrays for tracking frozen pixels
  for (let i = 0; i < width * height; i++) {
    frozenPixels[i] = false;
    freezeTimers[i] = 0;
    motionVectors[i] = { x: 0, y: 0 };
  }
  
  // Create UI controls
  createUI();
}

function draw() {
  // Capture current frame from video
  currFrame.image(video, 0, 0, width, height);
  
  // Start pixel manipulation
  loadPixels();
  prevFrame.loadPixels();
  currFrame.loadPixels();
  
  // Process each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4; // Pixel index (RGBA)
      
      // Calculate difference between frames to detect motion
      const rDiff = abs(currFrame.pixels[i] - prevFrame.pixels[i]);
      const gDiff = abs(currFrame.pixels[i+1] - prevFrame.pixels[i+1]);
      const bDiff = abs(currFrame.pixels[i+2] - prevFrame.pixels[i+2]);
      const pixelDiff = (rDiff + gDiff + bDiff) / 3;
      
      // Calculate pixel index for our tracking arrays (no RGBA, just position)
      const pixelIndex = y * width + x;
      
      // Estimate motion vector (simplified)
      if (pixelDiff > 10) {
        // Simplified motion estimation - just a random direction when motion detected
        // A real implementation would use optical flow algorithms
        motionVectors[pixelIndex] = {
          x: random(-motionSensitivity, motionSensitivity),
          y: random(-motionSensitivity, motionSensitivity)
        };
      } else {
        // Decay motion vectors over time
        motionVectors[pixelIndex].x *= 0.9;
        motionVectors[pixelIndex].y *= 0.9;
      }
      
      // Decide if this pixel should be frozen
      if (pixelDiff > freezeThreshold && random() < freezeProbability && !frozenPixels[pixelIndex]) {
        frozenPixels[pixelIndex] = true;
        freezeTimers[pixelIndex] = freezeDuration;
      }
      
      // Process frozen pixels
      if (frozenPixels[pixelIndex]) {
        // Calculate displacement based on motion vectors in the scene
        const displaceX = int(x + motionVectors[pixelIndex].x * glitchStrength);
        const displaceY = int(y + motionVectors[pixelIndex].y * glitchStrength);
        
        // Make sure the displaced coordinates are within bounds
        if (displaceX >= 0 && displaceX < width && displaceY >= 0 && displaceY < height) {
          const displaceIndex = (displaceY * width + displaceX) * 4;
          
          // Get color from the displaced position in current frame
          const currR = currFrame.pixels[displaceIndex];
          const currG = currFrame.pixels[displaceIndex+1];
          const currB = currFrame.pixels[displaceIndex+2];
          
          // Get color from our frozen pixel
          const frozenR = pixels[i];
          const frozenG = pixels[i+1];
          const frozenB = pixels[i+2];
          
          // Blend between frozen and current colors
          pixels[i] = lerp(frozenR, currR, colorBlendRate);
          pixels[i+1] = lerp(frozenG, currG, colorBlendRate);
          pixels[i+2] = lerp(frozenB, currB, colorBlendRate);
        }
        
        // Decrease freeze timer
        freezeTimers[pixelIndex]--;
        if (freezeTimers[pixelIndex] <= 0) {
          frozenPixels[pixelIndex] = false;
        }
      } else {
        // Not frozen, just use current frame
        pixels[i] = currFrame.pixels[i];
        pixels[i+1] = currFrame.pixels[i+1];
        pixels[i+2] = currFrame.pixels[i+2];
      }
      
      // Alpha channel always at maximum
      pixels[i+3] = 255;
    }
  }
  
  // Display the processed frame
  updatePixels();
  
  // Debug visualization
  if (showDebug) {
    drawDebugOverlay();
  }
  
  // Update previous frame
  prevFrame.image(currFrame, 0, 0);
}

function drawDebugOverlay() {
  // Draw motion vectors
  stroke(255, 0, 0);
  strokeWeight(1);
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const pixelIndex = y * width + x;
      const vx = motionVectors[pixelIndex].x;
      const vy = motionVectors[pixelIndex].y;
      
      if (abs(vx) > 0.5 || abs(vy) > 0.5) {
        line(x, y, x + vx * 5, y + vy * 5);
      }
    }
  }
  
  // Draw frozen pixels
  noStroke();
  fill(0, 255, 0, 100);
  for (let y = 0; y < height; y += 5) {
    for (let x = 0; x < width; x += 5) {
      const pixelIndex = y * width + x;
      if (frozenPixels[pixelIndex]) {
        rect(x, y, 5, 5);
      }
    }
  }
  
  // Display current settings
  fill(255);
  noStroke();
  text(`Freeze Threshold: ${freezeThreshold}`, 10, 20);
  text(`Freeze Probability: ${freezeProbability.toFixed(2)}`, 10, 40);
  text(`Freeze Duration: ${freezeDuration}`, 10, 60);
  text(`Motion Sensitivity: ${motionSensitivity.toFixed(2)}`, 10, 80);
  text(`Glitch Strength: ${glitchStrength.toFixed(2)}`, 10, 100);
  text(`Color Blend Rate: ${colorBlendRate.toFixed(2)}`, 10, 120);
}

function createUI() {
  // Creating sliders for controlling the effect
  createP('Datamoshing Controls');
  
  createP('Freeze Threshold:');
  let thresholdSlider = createSlider(5, 100, freezeThreshold, 1);
  thresholdSlider.input(() => { freezeThreshold = thresholdSlider.value(); });
  
  createP('Freeze Probability:');
  let probSlider = createSlider(0, 1, freezeProbability, 0.01);
  probSlider.input(() => { freezeProbability = probSlider.value(); });
  
  createP('Freeze Duration:');
  let durationSlider = createSlider(1, 200, freezeDuration, 1);
  durationSlider.input(() => { freezeDuration = durationSlider.value(); });
  
  createP('Motion Sensitivity:');
  let sensitivitySlider = createSlider(0.1, 20, motionSensitivity, 0.1);
  sensitivitySlider.input(() => { motionSensitivity = sensitivitySlider.value(); });
  
  createP('Glitch Strength:');
  let glitchSlider = createSlider(0, 2, glitchStrength, 0.05);
  glitchSlider.input(() => { glitchStrength = glitchSlider.value(); });
  
  createP('Color Blend Rate:');
  let blendSlider = createSlider(0, 0.5, colorBlendRate, 0.01);
  blendSlider.input(() => { colorBlendRate = blendSlider.value(); });
  
  let debugButton = createButton('Toggle Debug View');
  debugButton.mousePressed(() => { showDebug = !showDebug; });
  
  let resetButton = createButton('Reset Frozen Pixels');
  resetButton.mousePressed(() => {
    for (let i = 0; i < width * height; i++) {
      frozenPixels[i] = false;
      freezeTimers[i] = 0;
    }
  });
  
  let captureButton = createButton('Force Datamosh');
  captureButton.mousePressed(() => {
    // Freeze a significant portion of the frame
    for (let i = 0; i < width * height; i++) {
      if (random() < 0.3) {
        frozenPixels[i] = true;
        freezeTimers[i] = freezeDuration * 2;
      }
    }
  });
}

// Add keyboard shortcuts
function keyPressed() {
  if (key === 'd' || key === 'D') {
    showDebug = !showDebug;
  } else if (key === 'r' || key === 'R') {
    // Reset all frozen pixels
    for (let i = 0; i < width * height; i++) {
      frozenPixels[i] = false;
      freezeTimers[i] = 0;
    }
  } else if (key === 'f' || key === 'F') {
    // Force freeze random pixels
    for (let i = 0; i < width * height; i++) {
      if (random() < 0.3) {
        frozenPixels[i] = true;
        freezeTimers[i] = freezeDuration;
      }
    }
  }
}