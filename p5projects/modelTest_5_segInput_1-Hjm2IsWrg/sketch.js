let bodySegmentation;
let video;
let segmentationMask;
let shapes = [];
let nn;
let modelLoaded = false;
let isCapturingMode = true;

// Constants
const CANVAS_SIZE_W = 640;
const CANVAS_SIZE_H = 480;
const SHAPE_SIZE = 50;
const GRID_SIZE_W = 64;
const GRID_SIZE_H = 48;
const NUM_SQUARES = 5;
const NUM_TRIANGLES = 5;

// Options for body segmentation
const segmentationOptions = {
  maskType: "person"
};

// Shape class
class Shape {
  constructor(type, x, y, rotation = 0) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.color = (type === 'square') ? [255, 0, 0] : [0, 255, 0];
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    fill(...this.color, 200);
    stroke(0);
    strokeWeight(2);
    
    if (this.type === 'square') {
      rectMode(CENTER);
      rect(0, 0, SHAPE_SIZE, SHAPE_SIZE);
    } else {
      const halfSize = SHAPE_SIZE / 2;
      triangle(0, -halfSize, -halfSize, halfSize, halfSize, halfSize);
    }
    
    pop();
  }
}

function preload() {
  bodySegmentation = ml5.bodySegmentation("BodyPix", segmentationOptions);
}

function setup() {
  createCanvas(CANVAS_SIZE_W, CANVAS_SIZE_H);
  
  // Create buffer for the segmentation mask
  segmentationMask = createGraphics(CANVAS_SIZE_W, CANVAS_SIZE_H);
  segmentationMask.background(0);
  
  // Setup webcam
  video = createCapture(VIDEO);
  video.size(CANVAS_SIZE_W, CANVAS_SIZE_H);
  video.hide();
  
  // Neural network with minimal options
  nn = ml5.neuralNetwork({
    task: 'regression',
    debug: true
  });
  
  // Create UI
  createButton('Run Inference').position(10, CANVAS_SIZE_H + 10)
    .mousePressed(() => {
      if (isCapturingMode) {
        // Already capturing
        return;
      }
      isCapturingMode = true;
      bodySegmentation.detectStart(video, gotSegmentation);
    });
  
  createButton('Toggle Continuous').position(120, CANVAS_SIZE_H + 10)
    .mousePressed(() => {
      // Toggle continuous mode
      if (isCapturingMode) {
        bodySegmentation.detectStop();
        isCapturingMode = false;
      } else {
        isCapturingMode = true;
        bodySegmentation.detectStart(video, gotSegmentation);
      }
    });
  
  // Load model
  const modelDetails = {
    model: './model/model.json',
    metadata: './model/model_meta.json',
    weights: './model/model.weights.bin'
  };
  
  nn.load(modelDetails, () => {
    console.log("Model loaded!");
    modelLoaded = true;
    
    // Start segmentation after model is loaded
    bodySegmentation.detectStart(video, gotSegmentation);
  });
}

function draw() {
  background(240);
  
  if (isCapturingMode) {
    // Show video feed when capturing
    image(video, 0, 0);
    
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("Processing...", width/2, height/2);
  } else {
    // Show video with overlay when inferencing
    image(video, 0, 0);
    
    // Draw semi-transparent segmentation mask
    push();
    tint(255, 100);
    image(segmentationMask, 0, 0);
    pop();
    
    // Draw shapes
    for (let shape of shapes) {
      shape.draw();
    }
  }
  
  // Show status
  fill(0);
  textSize(14);
  textAlign(LEFT, TOP);
  text(`Model: ${modelLoaded ? 'Loaded' : 'Loading...'}`, 10, 10);
  text(`Mode: ${isCapturingMode ? 'Capturing' : 'Inference'}`, 10, 30);
  text(`Shapes: ${shapes.length}`, 10, 50);
}

function gotSegmentation(result) {
  if (!result || !result.mask) return;
  
  // Copy mask to our buffer
  segmentationMask.clear();
  segmentationMask.image(result.mask, 0, 0, CANVAS_SIZE_W, CANVAS_SIZE_H);
  
  if (isCapturingMode && modelLoaded) {
    // Process for inference
    let maskGrid = processSegmentationMask();
    
    // Run inference
    runInference(maskGrid);
    
    // Switch to inference mode
    isCapturingMode = false;
  }
}

function processSegmentationMask() {
  // Create downsampled representation of the mask
  const grid = [];
  segmentationMask.loadPixels();
  
  const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
  for (let y = 0; y < CANVAS_SIZE_H; y += cellHeight) {
    for (let x = 0; x < CANVAS_SIZE_W; x += cellWidth) {
      let sum = 0;
      let count = 0;
      
      // Sample pixels in this cell
      for (let j = 0; j < cellHeight && y + j < CANVAS_SIZE_H; j++) {
        for (let i = 0; i < cellWidth && x + i < CANVAS_SIZE_W; i++) {
          const pixelIndex = 4 * (Math.floor(y + j) * CANVAS_SIZE_W + Math.floor(x + i));
          if (segmentationMask.pixels[pixelIndex + 3] > 128) { // Check alpha channel
            sum += 1;
          }
          count++;
        }
      }
      
      // Calculate cell average (0-1)
      const value = count > 0 ? sum / count : 0;
      grid.push(value);
    }
  }
  
  return grid;
}

function runInference(maskGrid) {
  // Clear existing shapes
  shapes = [];
  
  // Run the prediction
  nn.predict(maskGrid, (results) => {
   
    
    console.log("Prediction results:", results);
    
    try {
      // Place squares
      for (let i = 0; i < NUM_SQUARES; i++) {
        const baseIdx = i * 3;
        
        // Skip if we don't have enough results
        if (baseIdx + 2 >= results.length) continue;
        
        // Extract values - handle both formats (plain value or .value property)
        let x, y, rotation;
        
        if (typeof results[baseIdx] === 'object' && results[baseIdx] !== null) {
          // Format: [{value: 0.5}, {value: 0.3}, ...]
          x = results[baseIdx].value || 0;
          y = results[baseIdx + 1].value || 0;
          rotation = results[baseIdx + 2].value || 0;
        } else {
          // Format: [0.5, 0.3, ...]
          x = results[baseIdx] || 0;
          y = results[baseIdx + 1] || 0;
          rotation = results[baseIdx + 2] || 0;
        }
        
        // Skip if values are too small (probably zeroed output)
        if (x + y + rotation < 0.1) continue;
        
        // Scale to canvas size
        x = x * CANVAS_SIZE_W;
        y = y * CANVAS_SIZE_H;
        rotation = rotation * TWO_PI;
        
        console.log(`Square ${i}: x=${x.toFixed(1)}, y=${y.toFixed(1)}, r=${rotation.toFixed(2)}`);
        
        // Create shape
        shapes.push(new Shape('square', x, y, rotation));
      }
      
      // Place triangles after squares
      const triangleOffset = 15; // This depends on your model's output structure
      for (let i = 0; i < NUM_TRIANGLES; i++) {
        const baseIdx = triangleOffset + (i * 3);
        
        // Skip if we don't have enough results
        if (baseIdx + 2 >= results.length) continue;
        
        // Extract values - handle both formats
        let x, y, rotation;
        
        if (typeof results[baseIdx] === 'object' && results[baseIdx] !== null) {
          // Format: [{value: 0.5}, {value: 0.3}, ...]
          x = results[baseIdx].value || 0;
          y = results[baseIdx + 1].value || 0;
          rotation = results[baseIdx + 2].value || 0;
        } else {
          // Format: [0.5, 0.3, ...]
          x = results[baseIdx] || 0;
          y = results[baseIdx + 1] || 0;
          rotation = results[baseIdx + 2] || 0;
        }
        
        // Skip if values are too small
        if (x + y + rotation < 0.1) continue;
        
        // Scale to canvas size
        x = x * CANVAS_SIZE_W;
        y = y * CANVAS_SIZE_H;
        rotation = rotation * TWO_PI;
        
        console.log(`Triangle ${i}: x=${x.toFixed(1)}, y=${y.toFixed(1)}, r=${rotation.toFixed(2)}`);
        
        // Create shape
        shapes.push(new Shape('triangle', x, y, rotation));
      }
    } catch (e) {
      console.error("Error processing results:", e);
    }
  });
}

function keyPressed() {
  if (key === 's') {
    // Save canvas
    saveCanvas('inference', 'png');
  } else if (key === ' ') {
    // Space bar - trigger new capture
    if (!isCapturingMode) {
      isCapturingMode = true;
      bodySegmentation.detectStart(video, gotSegmentation);
    }
  }
}