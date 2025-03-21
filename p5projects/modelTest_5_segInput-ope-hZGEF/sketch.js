let bodySegmentation;
let video;
let segmentation;
let segmentationMask;
let downsampledMaskArray = [];
let shapes = [];
let nn;
let isCapturingMode = true; // Start in capturing mode
let showDownsampled = false; // Show downsampled version
let downsampledMaskActualAlphaArray = [];
let modelLoadedB = false;
let inferenceActive = false;
let continuousInference = false;
let shapeColors = {
  square: [255, 0, 0],    // Red for squares
  triangle: [0, 255, 0]   // Green for triangles
};

// Constants
const CANVAS_SIZE_W = 640;
const CANVAS_SIZE_H = 480;
const SHAPE_SIZE = 50;
const GRID_SIZE_W = 64; // Width of downsampled grid
const GRID_SIZE_H = 48; // Height of downsampled grid (preserves aspect ratio)
const MAX_SHAPES = 10;  // Maximum number of shapes (as used in training)
const NUM_SQUARES = 3;  // Number of squares to place
const NUM_TRIANGLES = 2; // Number of triangles to place

// Options for body segmentation
const segmentationOptions = {
  maskType: "person", // Person mask (separates person from background)
};

function preload() {
  // Load the body segmentation model
  bodySegmentation = ml5.bodySegmentation("BodyPix", segmentationOptions);
}

function setup() {
  pixelDensity(1);
  createCanvas(CANVAS_SIZE_W, CANVAS_SIZE_H);
  
  // Create buffer for the segmentation mask
  segmentationMask = createGraphics(CANVAS_SIZE_W, CANVAS_SIZE_H);
  segmentationMask.background(0);
  
  // Setup webcam video
  video = createCapture(VIDEO);
  video.size(CANVAS_SIZE_W, CANVAS_SIZE_H);
  video.hide();
  
  // Set the WebGL backend for better performance
  ml5.setBackend("webgl");
  
  // Create neural network for inference - simpler initialization similar to your working code
  nn = ml5.neuralNetwork({
    task: 'regression',
    debug: true
  });
  
  // Start body segmentation in detection mode
  bodySegmentation.detectStart(video, gotSegmentation);
  
  // Load the model using the structure from your working code
  const modelDetails = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin'
  };
  
  nn.load(modelDetails, modelLoaded);
  
  // Create UI controls
  createUI();
}

function modelLoaded() {
  console.log("Model loaded successfully!");
  modelLoadedB = true;
}

function createUI() {
  const buttonY = CANVAS_SIZE_H + 10;
  
  // Create UI buttons for inference
  createButton('Start Single Inference').position(10, buttonY)
    .mousePressed(() => {
      inferenceActive = true;
      continuousInference = false;
      isCapturingMode = true; // Capture a new frame
    });
  
  createButton('Start Continuous Inference').position(160, buttonY)
    .mousePressed(() => {
      inferenceActive = true;
      continuousInference = true;
      isCapturingMode = true; // Capture a new frame
    });
  
  createButton('Stop Inference').position(340, buttonY)
    .mousePressed(() => {
      inferenceActive = false;
      continuousInference = false;
    });
  
  createButton('Toggle View [v]').position(460, buttonY)
    .mousePressed(() => showDownsampled = !showDownsampled);
  
  // Add status text
  createP('Load a model and press "Start Inference" to see the shapes placed automatically.').position(10, CANVAS_SIZE_H + 50);
}

function draw() {
  background(240);
  
  if (isCapturingMode) {
    // In capturing mode, show the webcam feed with semi-transparent overlay
    tint(255, 150);
    image(video, 0, 0);
    noTint();
    
    fill(0);
    textSize(20);
    textAlign(CENTER);
    text("Waiting for segmentation...", width/2, height/2);
  } else {
    // In inference mode, show either the original mask or downsampled mask behind shapes
    if (showDownsampled) {
      drawDownsampledMask();
    } else {
      // Show the video with a transparency
      tint(255, 100);
      image(video, 0, 0);
      noTint();
      
      // Overlay the segmentation mask with transparency
      push();
      tint(255, 80);
      image(segmentationMask, 0, 0);
      pop();
    }
    
    // Draw all shapes
    drawShapes();
    
    // Display status
    fill(0);
    textSize(14);
    textAlign(LEFT);
    text(`Inference ${inferenceActive ? (continuousInference ? '(Continuous)' : '(Single)') : 'Inactive'} | Model ${modelLoadedB ? 'Loaded' : 'Loading...'}`, 10, 20);
    text(`Shapes: ${shapes.length} | ${shapes.filter(s => s.type === 'square').length} squares, ${shapes.filter(s => s.type === 'triangle').length} triangles`, 10, 40);
    text(`Viewing: ${showDownsampled ? 'Downsampled Mask' : 'Original Video & Mask'}`, width - 250, 20);
  }
}

// Callback function for body segmentation results
function gotSegmentation(result) {
  if (!result || !result.mask) return;
  
  segmentation = result;
  
  if (isCapturingMode && inferenceActive && modelLoadedB) {
    // Process the segmentation mask and prepare for inference
    segmentationMask.clear();
    segmentationMask.image(segmentation.mask, 0, 0, CANVAS_SIZE_W, CANVAS_SIZE_H);
    
    // Clear previous arrays before creating new ones
    downsampledMaskArray = [];
    downsampledMaskActualAlphaArray = [];
    
    // Create the downsampled version
    downsampledMaskArray = downsampleMask();
    
    // Switch to inference mode (displaying shapes)
    isCapturingMode = false;
    
    // Run inference with the current mask
    runInference();
    
    // If continuous inference, prepare to capture the next frame
    if (continuousInference) {
      setTimeout(() => {
        isCapturingMode = true;
      }, 100); // Small delay to avoid overwhelming the system
    } else {
      // For single inference, stop detection to save resources
      bodySegmentation.detectStop();
    }
  } else if (continuousInference && isCapturingMode) {
    // For continuous inference, just keep getting new frames
    isCapturingMode = true;
  }
}

function drawDownsampledMask() {
  noStroke();
  
  const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
  let cellIndex = 0;
  
  // Use the exact same loop structure for consistency
  for (let y = 0; y < CANVAS_SIZE_H; y += cellHeight) {
    for (let x = 0; x < CANVAS_SIZE_W; x += cellWidth) {
      // Get the stored alpha value for this cell
      const alphaValue = downsampledMaskActualAlphaArray[cellIndex++];
      
      // Set fill color based on the alpha value
      if (alphaValue > 128) {
        fill(0); // Black for person 
      } else {
        fill(255); // White for background
      }
      
      // Draw this cell as a rectangle
      rect(x, y, cellWidth, cellHeight);
    }
  }
}

function downsampleMask() {
  segmentationMask.loadPixels();
  const pixels = segmentationMask.pixels;
  
  const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
  // Clear previous arrays
  const grid = [];
  downsampledMaskActualAlphaArray = [];
  
  // Loop through the canvas in cell-sized chunks
  for (let y = 0; y < CANVAS_SIZE_H; y += cellHeight) {
    for (let x = 0; x < CANVAS_SIZE_W; x += cellWidth) {
      let personPixels = 0;
      let totalPixels = 0;
      
      // For each cell, scan all pixels inside it
      for (let scanY = y; scanY < y + cellHeight && scanY < CANVAS_SIZE_H; scanY++) {
        for (let scanX = x; scanX < x + cellWidth && scanX < CANVAS_SIZE_W; scanX++) {
          // Get the exact pixel index in the pixels array
          const pixelIndex = 4 * (Math.floor(scanY) * CANVAS_SIZE_W + Math.floor(scanX));
          
          // Check if this is a person pixel (alpha > 128)
          if (pixels[pixelIndex + 3] > 128) {
            personPixels++;
          }
          totalPixels++;
        }
      }
      
      // Calculate ratio and store both normalized and 0-255 versions
      const ratio = personPixels/totalPixels;
      grid.push(ratio); // 0-1 range for neural network
      
      // Also store a 0-255 version for visualization
      const alphaValue = Math.round(ratio * 255);
      downsampledMaskActualAlphaArray.push(alphaValue);
    }
  }
  
  return grid;
}

function runInference() {
  if (!modelLoadedB) {
    console.log("Model not loaded yet. Please wait.");
    return;
  }
  
  // Clear current shapes
  shapes = [];
  
  // Run inference with the current downsampled mask
  nn.predict(downsampledMaskArray, (error, results) => {
    if (error) {
      console.error("Inference error:", error);
      return;
    }
    
    // Process results
    console.log("Inference results:", results);
    
    // For each shape, we have 3 values (x, y, rotation)
    // We'll place the requested number of squares and triangles
    let squaresPlaced = 0;
    let trianglesPlaced = 0;
    
    // Handle cases where results are in different formats
    // Some ml5.js versions return array of objects with 'value' property
    // Others might return a flat array of values
    
    // First, check if we have the results array
    if (!Array.isArray(results) || results.length < 3) {
      console.error("Invalid results format or empty results");
      return;
    }
    
    // Process squares first
    for (let i = 0; i < MAX_SHAPES && squaresPlaced < NUM_SQUARES; i++) {
      const baseIndex = i * 3;
      if (baseIndex + 2 >= results.length) break;
      
      // Get values, handling different possible formats
      const xValue = typeof results[baseIndex].value !== 'undefined' ? 
                    results[baseIndex].value : results[baseIndex];
      const yValue = typeof results[baseIndex + 1].value !== 'undefined' ? 
                    results[baseIndex + 1].value : results[baseIndex + 1];
      const rotValue = typeof results[baseIndex + 2].value !== 'undefined' ? 
                      results[baseIndex + 2].value : results[baseIndex + 2];
      
      // Skip if values are undefined or very small (likely placeholder zeros)
      if (typeof xValue !== 'number' || typeof yValue !== 'number' || typeof rotValue !== 'number') continue;
      if ((Math.abs(xValue) + Math.abs(yValue) + Math.abs(rotValue)) < 0.01) continue;
      
      // Convert normalized values to actual coordinates and rotation
      const x = xValue * CANVAS_SIZE_W;
      const y = yValue * CANVAS_SIZE_H;
      const rotation = rotValue * (2 * PI);
      
      console.log(`Square ${squaresPlaced + 1}: x=${x.toFixed(2)}, y=${y.toFixed(2)}, rot=${rotation.toFixed(2)}`);
      
      // Create and add square
      shapes.push(new Shape('square', x, y, rotation));
      squaresPlaced++;
    }
    
    // Then place triangles
    const triangleStartIndex = MAX_SHAPES / 2 * 3; // Assuming first half are squares, second half triangles
    
    for (let i = 0; i < MAX_SHAPES && trianglesPlaced < NUM_TRIANGLES; i++) {
      const baseIndex = triangleStartIndex + (i * 3);
      if (baseIndex + 2 >= results.length) break;
      
      // Get values, handling different possible formats
      const xValue = typeof results[baseIndex].value !== 'undefined' ? 
                    results[baseIndex].value : results[baseIndex];
      const yValue = typeof results[baseIndex + 1].value !== 'undefined' ? 
                    results[baseIndex + 1].value : results[baseIndex + 1];
      const rotValue = typeof results[baseIndex + 2].value !== 'undefined' ? 
                      results[baseIndex + 2].value : results[baseIndex + 2];
      
      // Skip if values are undefined or very small (likely placeholder zeros)
      if (typeof xValue !== 'number' || typeof yValue !== 'number' || typeof rotValue !== 'number') continue;
      if ((Math.abs(xValue) + Math.abs(yValue) + Math.abs(rotValue)) < 0.01) continue;
      
      // Convert normalized values to actual coordinates and rotation
      const x = xValue * CANVAS_SIZE_W;
      const y = yValue * CANVAS_SIZE_H;
      const rotation = rotValue * (2 * PI);
      
      console.log(`Triangle ${trianglesPlaced + 1}: x=${x.toFixed(2)}, y=${y.toFixed(2)}, rot=${rotation.toFixed(2)}`);
      
      // Create and add triangle
      shapes.push(new Shape('triangle', x, y, rotation));
      trianglesPlaced++;
    }
    
    console.log(`Placed ${shapes.length} shapes: ${squaresPlaced} squares, ${trianglesPlaced} triangles`);
  });
}

// Shape class for drawing
class Shape {
  constructor(type, x, y, rotation = 0) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.size = SHAPE_SIZE;
    this.color = shapeColors[type] || [255, 255, 255];
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    // Set fill and stroke
    fill(...this.color, 200);
    stroke(0);
    strokeWeight(2);
    
    if (this.type === 'square') {
      rectMode(CENTER);
      rect(0, 0, this.size, this.size);
    } else if (this.type === 'triangle') {
      const halfSize = this.size / 2;
      triangle(0, -halfSize, -halfSize, halfSize, halfSize, halfSize);
    }
    
    // Draw a small dot at the center
    fill(0);
    ellipse(0, 0, 5, 5);
    
    pop();
  }
}

function drawShapes() {
  // Draw all shapes
  for (let shape of shapes) {
    shape.draw();
  }
}

function keyPressed() {
  if (key === 'v') showDownsampled = !showDownsampled;
  
  // Add a single inference trigger with spacebar
  if (key === ' ' && modelLoadedB) {
    inferenceActive = true;
    continuousInference = false;
    isCapturingMode = true;
  }
  
  // Toggle continuous inference with 'c'
  if (key === 'c' && modelLoadedB) {
    continuousInference = !continuousInference;
    if (continuousInference) {
      inferenceActive = true;
      isCapturingMode = true;
    }
  }
}