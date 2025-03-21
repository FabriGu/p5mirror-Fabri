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
const NUM_SQUARES = 6;
const NUM_TRIANGLES = 6;
const MAX_SHAPES = 12;

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
  setupShapeControls();
  
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
  
  // Use this in the setup function
  nn.load(modelDetails, () => {
    console.log("Model loaded!");
    modelLoaded = true;

    // Check model structure and metadata
    checkModelStructure();

    // Start segmentation after model is loaded
    bodySegmentation.detectStart(video, gotSegmentation);
  }, (error) => {
    console.error("Error loading model:", error);
    alert("Error loading model. Check console for details.");
  });
}

// Add these variables to your global variables
let shapeInferenceOptions = {
  placeSquares: true,
  placeTriangles: true,
  maxSquares: NUM_SQUARES,
  maxTriangles: NUM_TRIANGLES
};

// Add this function to create UI controls for shape placement options
function setupShapeControls() {
  const buttonY = CANVAS_SIZE_H + 40; // Position below existing controls
  
  // Checkbox for placing squares
  const squaresCheckbox = createCheckbox('Place Squares', shapeInferenceOptions.placeSquares);
  squaresCheckbox.position(10, buttonY);
  squaresCheckbox.changed(() => {
    shapeInferenceOptions.placeSquares = squaresCheckbox.checked();
  });
  
  // Checkbox for placing triangles
  const trianglesCheckbox = createCheckbox('Place Triangles', shapeInferenceOptions.placeTriangles);
  trianglesCheckbox.position(150, buttonY);
  trianglesCheckbox.changed(() => {
    shapeInferenceOptions.placeTriangles = trianglesCheckbox.checked();
  });
  
  // Input for max squares
  createSpan('Max Squares:').position(300, buttonY);
  const squaresInput = createInput(shapeInferenceOptions.maxSquares.toString(), 'number');
  squaresInput.position(380, buttonY);
  squaresInput.size(40);
  squaresInput.changed(() => {
    const value = parseInt(squaresInput.value());
    if (!isNaN(value) && value >= 0) {
      shapeInferenceOptions.maxSquares = value;
    }
  });
  
  // Input for max triangles
  createSpan('Max Triangles:').position(440, buttonY);
  const trianglesInput = createInput(shapeInferenceOptions.maxTriangles.toString(), 'number');
  trianglesInput.position(530, buttonY);
  trianglesInput.size(40);
  trianglesInput.changed(() => {
    const value = parseInt(trianglesInput.value());
    if (!isNaN(value) && value >= 0) {
      shapeInferenceOptions.maxTriangles = value;
    }
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
    // Process for inference using the same method as training
    const maskData = processSegmentationMask();
    
    // Run inference with the processed mask
    runInference(maskData);
    
    // Switch to inference mode
    isCapturingMode = false;
  }
}

// Add this function to help debug model loading issues
function checkModelStructure() {
  console.log("Model input layers:", nn.inputLayers);
  console.log("Model output layers:", nn.outputLayers);
  
  // Try to get model structure information if available
  if (nn.model && nn.model.summary) {
    nn.model.summary();
  }
  
  // Check if the inputs match expected size
  const expectedInputSize = GRID_SIZE_W * GRID_SIZE_H;
  console.log(`Expected input size: ${expectedInputSize}`);
  
  // Check if the outputs match expected size
  const expectedOutputSize = MAX_SHAPES * 3;
  console.log(`Expected output size: ${expectedOutputSize}`);
}



function processSegmentationMask() {
  // Create downsampled representation exactly matching training code
  segmentationMask.loadPixels();
  const pixels = segmentationMask.pixels;
  
  const grid = [];
  const displayArray = []; // For visualization
  const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
  // Use the exact same loop and algorithm from training
  for (let y = 0; y < GRID_SIZE_H; y++) {
    for (let x = 0; x < GRID_SIZE_W; x++) {
      const startX = Math.floor(x * cellWidth);
      const startY = Math.floor(y * cellHeight);
      const endX = Math.floor((x + 1) * cellWidth);
      const endY = Math.floor((y + 1) * cellHeight);
      
      let count = 0;
      let total = 0;
      
      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          if (px < CANVAS_SIZE_W && py < CANVAS_SIZE_H) {
            const idx = 4 * (py * CANVAS_SIZE_W + px);
            // Make sure to check alpha channel exactly like in training
            if (pixels[idx + 3] > 128) {
              count++;
            }
            total++;
          }
        }
      }
      
      // Calculate cell average (0-1) the same way as in training
      const value = total > 0 ? count / total : 0;
      grid.push(value);
      displayArray.push(Math.round(value * 255)); // For visualization
    }
  }
  
  // Log some statistics for debugging
  console.log("Mask statistics:", {
    size: grid.length,
    expectedSize: GRID_SIZE_W * GRID_SIZE_H,
    min: Math.min(...grid),
    max: Math.max(...grid),
    hasVariance: grid.some(v => v > 0.1) && grid.some(v => v < 0.9)
  });
  
  return { grid, displayArray };
}
// Modified runInference function with flexible shape type handling
function runInference(maskGrid) {
  // Clear existing shapes
  shapes = [];
  
  // Visualize the downsampled input
  drawMaskDebug(maskGrid.displayArray);
  
  // Check if we're placing any shapes at all
  if (!shapeInferenceOptions.placeSquares && !shapeInferenceOptions.placeTriangles) {
    console.log("No shapes selected for placement");
    return;
  }
  
  // Run the prediction
  nn.predict(maskGrid.grid, (results) => {
    console.log("Prediction results:", results);
    
    try {
      // Log some basic info about the results
      console.log(`Results length: ${results.length}`);
      
      // Determine how many shapes of each type to place
      const totalShapesFromModel = Math.floor(results.length / 3);
      console.log(`Model predicted ${totalShapesFromModel} total shapes`);
      
      // Calculate actual shapes to place based on our options
      const squaresToPlace = shapeInferenceOptions.placeSquares ? 
        Math.min(shapeInferenceOptions.maxSquares, totalShapesFromModel) : 0;
        
      const trianglesToPlace = shapeInferenceOptions.placeTriangles ? 
        Math.min(shapeInferenceOptions.maxTriangles, 
                totalShapesFromModel - (shapeInferenceOptions.placeSquares ? squaresToPlace : 0)) : 0;
      
      console.log(`Will place: ${squaresToPlace} squares and ${trianglesToPlace} triangles`);
      
      let shapesPlaced = 0;
      
      // First place squares (if any)
      for (let i = 0; i < squaresToPlace; i++) {
        const baseIdx = i * 3;
        
        // Extract and process values
        let x, y, rotation;
        
        // Extract values from results (handle both formats)
        if (results[baseIdx].hasOwnProperty('value')) {
          x = parseFloat(results[baseIdx].value);
          y = parseFloat(results[baseIdx + 1].value);
          rotation = parseFloat(results[baseIdx + 2].value);
        } else {
          // Fallback to first property
          const keys = Object.keys(results[baseIdx]);
          if (keys.length > 0) {
            x = parseFloat(results[baseIdx][keys[0]]);
            y = parseFloat(results[baseIdx + 1][keys[0]]);
            rotation = parseFloat(results[baseIdx + 2][keys[0]]);
          }
        }
        
        // Skip invalid values
        if (isNaN(x) || isNaN(y) || isNaN(rotation)) {
          console.log(`Skipping square ${i}: invalid values`);
          continue;
        }
        
        // Normalize values if needed
        if (x < 0 || x > 1 || y < 0 || y > 1) {
          x = (x + 1) * 0.5;
          y = (y + 1) * 0.5;
          rotation = (rotation + 1) * 0.5;
        }
        
        // Clamp values
        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));
        rotation = Math.max(0, Math.min(1, rotation));
        
        // Scale to canvas size
        x = x * CANVAS_SIZE_W;
        y = y * CANVAS_SIZE_H;
        rotation = rotation * TWO_PI;
        
        console.log(`Placing square ${i}: x=${x.toFixed(1)}, y=${y.toFixed(1)}, r=${rotation.toFixed(2)}`);
        
        // Create shape (square)
        shapes.push(new Shape('square', x, y, rotation));
        shapesPlaced++;
      }
      
      // Then place triangles (if any)
      for (let i = 0; i < trianglesToPlace; i++) {
        // Triangles start after all squares
        const baseIdx = (squaresToPlace + i) * 3;
        
        // Skip if we're out of bounds
        if (baseIdx + 2 >= results.length) {
          console.log(`Cannot place triangle ${i}: not enough data in results`);
          continue;
        }
        
        // Extract and process values
        let x, y, rotation;
        
        // Extract values from results (handle both formats)
        if (results[baseIdx].hasOwnProperty('value')) {
          x = parseFloat(results[baseIdx].value);
          y = parseFloat(results[baseIdx + 1].value);
          rotation = parseFloat(results[baseIdx + 2].value);
        } else {
          // Fallback to first property
          const keys = Object.keys(results[baseIdx]);
          if (keys.length > 0) {
            x = parseFloat(results[baseIdx][keys[0]]);
            y = parseFloat(results[baseIdx + 1][keys[0]]);
            rotation = parseFloat(results[baseIdx + 2][keys[0]]);
          }
        }
        
        // Skip invalid values
        if (isNaN(x) || isNaN(y) || isNaN(rotation)) {
          console.log(`Skipping triangle ${i}: invalid values`);
          continue;
        }
        
        // Normalize values if needed
        if (x < 0 || x > 1 || y < 0 || y > 1) {
          x = (x + 1) * 0.5;
          y = (y + 1) * 0.5;
          rotation = (rotation + 1) * 0.5;
        }
        
        // Clamp values
        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));
        rotation = Math.max(0, Math.min(1, rotation));
        
        // Scale to canvas size
        x = x * CANVAS_SIZE_W;
        y = y * CANVAS_SIZE_H;
        rotation = rotation * TWO_PI;
        
        console.log(`Placing triangle ${i}: x=${x.toFixed(1)}, y=${y.toFixed(1)}, r=${rotation.toFixed(2)}`);
        
        // Create shape (triangle)
        shapes.push(new Shape('triangle', x, y, rotation));
        shapesPlaced++;
      }
      
      // Log success
      console.log(`Placed ${shapesPlaced} shapes from inference (${shapes.filter(s => s.type === 'square').length} squares, ${shapes.filter(s => s.type === 'triangle').length} triangles)`);
    } catch (e) {
      console.error("Error processing results:", e);
      console.error("Error stack:", e.stack);
    }
  });
}
// Function to visualize the downsampled mask for debugging

// Updated version of drawMaskDebug that's clearer
function drawMaskDebug(displayArray) {
  // Create a debug layer if it doesn't exist
  if (!window.debugLayer) {
    window.debugLayer = createGraphics(CANVAS_SIZE_W, CANVAS_SIZE_H);
  }
  
  const debugLayer = window.debugLayer;
  debugLayer.clear();
  
  const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
  debugLayer.noStroke();
  
  // Draw a background for better contrast
  debugLayer.fill(50);
  debugLayer.rect(0, 0, CANVAS_SIZE_W, CANVAS_SIZE_H);
  
  let cellIndex = 0;
  for (let y = 0; y < GRID_SIZE_H; y++) {
    for (let x = 0; x < GRID_SIZE_W; x++) {
      const alphaValue = displayArray[cellIndex++];
      
      // Use a color gradient from black to white for better visualization
      debugLayer.fill(alphaValue);
      debugLayer.rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
  }
  
  // Draw grid lines for clarity
  debugLayer.stroke(100, 100, 255, 50);
  debugLayer.strokeWeight(0.5);
  for (let x = 0; x <= GRID_SIZE_W; x++) {
    debugLayer.line(x * cellWidth, 0, x * cellWidth, CANVAS_SIZE_H);
  }
  for (let y = 0; y <= GRID_SIZE_H; y++) {
    debugLayer.line(0, y * cellHeight, CANVAS_SIZE_W, y * cellHeight);
  }
  
  // Draw debug layer on canvas
  image(debugLayer, 0, 0);
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