// Constants
const CANVAS_SIZE_W = 640;
const CANVAS_SIZE_H = 480;
const SHAPE_SIZE = 50;
const GRID_SIZE_W = 64; // Width of downsampled grid
const GRID_SIZE_H = 48; // Height of downsampled grid (preserves aspect ratio)
const MAX_SHAPES = 20; // Maximum number of shapes to place

// Variables for segmentation
let bodySegmentation;
let video;
let segmentation;
let segmentationMask;
let downsampledMaskArray = [];
let downsampledMaskActualAlphaArray = [];

// Variables for shapes
let shapes = [];
let selectedShape = null;

// Variables for neural network
let nn;
let predictionReady = false;
let isPredicting = false;

// Shape options
let shapeOptions = {
  squares: true,
  triangles: true,
  count: 10  // Default total number of shapes
};

// Segmentation options
const segmentationOptions = {
  maskType: "person", // Person mask (separates person from background)
};

function preload() {
  // Load the body segmentation model
  bodySegmentation = ml5.bodySegmentation("BodyPix", segmentationOptions);
  
  // Initialize neural network
  const options = {
  task: 'regression',
  inputs: GRID_SIZE_W * GRID_SIZE_H,
  outputs: MAX_SHAPES * 3,
  // Make sure these match your training model
  layers: [
    { type: 'dense', units: 128, activation: 'relu' },
    { type: 'dense', units: 64, activation: 'relu' },
    { type: 'dense', units: 60, activation: 'linear' }
  ]
};
  
  nn = ml5.neuralNetwork(options);
}

function setup() {
  createCanvas(CANVAS_SIZE_W, CANVAS_SIZE_H);
  pixelDensity(1);
  
  // Create buffer for the segmentation mask
  segmentationMask = createGraphics(CANVAS_SIZE_W, CANVAS_SIZE_H);
  segmentationMask.background(0);
  
  // Setup webcam video
  video = createCapture(VIDEO);
  video.size(CANVAS_SIZE_W, CANVAS_SIZE_H);
  video.hide();
  
  // Set the WebGL backend for better performance
  ml5.setBackend("webgl");
  
  // Load the trained model
  const modelDetails = {
    model: './model/model.json',
    metadata: './model/model_meta.json',
    weights: './model/model.weights.bin'
  };
  
  nn.load(modelDetails, modelLoaded);
  
  // Start body segmentation in detection mode
  bodySegmentation.detectStart(video, gotSegmentation);
  
  // Create UI controls
  createUI();
}

function modelLoaded() {
  console.log('Neural network model loaded!');
  predictionReady = true;
}

function createUI() {
  const buttonY = CANVAS_SIZE_H + 10;
  const checkboxY = CANVAS_SIZE_H + 40;
  
  // Create UI buttons
  createButton('Predict Shapes').position(10, buttonY).mousePressed(predictShapes);
  createButton('Clear Shapes').position(120, buttonY).mousePressed(clearShapes);
  
  // Create shape count slider
  createSpan('Number of Shapes: ').position(230, buttonY);
  const countSlider = createSlider(1, MAX_SHAPES, 10, 1);
  countSlider.position(340, buttonY);
  countSlider.input(() => {
    shapeOptions.count = countSlider.value();
  });
  
  // Create checkboxes for shape types
  const squaresCheckbox = createCheckbox('Squares', true);
  squaresCheckbox.position(10, checkboxY);
  squaresCheckbox.changed(() => {
    shapeOptions.squares = squaresCheckbox.checked();
    // Ensure at least one type is selected
    if (!shapeOptions.squares && !shapeOptions.triangles) {
      shapeOptions.triangles = true;
      trianglesCheckbox.checked(true);
    }
  });
  
  const trianglesCheckbox = createCheckbox('Triangles', true);
  trianglesCheckbox.position(100, checkboxY);
  trianglesCheckbox.changed(() => {
    shapeOptions.triangles = trianglesCheckbox.checked();
    // Ensure at least one type is selected
    if (!shapeOptions.squares && !shapeOptions.triangles) {
      shapeOptions.squares = true;
      squaresCheckbox.checked(true);
    }
  });
}

function gotSegmentation(result) {
  if (!result || !result.mask) return;
  
  segmentation = result;
  
  // Copy the segmentation to our mask
  segmentationMask.clear();
  segmentationMask.image(segmentation.mask, 0, 0, CANVAS_SIZE_W, CANVAS_SIZE_H);
  
  // Create the downsampled version - only do this once per frame
  downsampleMask();
  
  // If we're in prediction mode, predict shapes immediately
  if (isPredicting && predictionReady) {
    runPrediction();
    isPredicting = false;
  }
}

function predictShapes() {
  if (!predictionReady) {
    console.log("Model not ready yet!");
    return;
  }
  
  clearShapes();
  
  // Ensure we have the latest segmentation
  if (segmentation) {
    // Refresh the mask and downsampled data
    segmentationMask.clear();
    segmentationMask.image(segmentation.mask, 0, 0, CANVAS_SIZE_W, CANVAS_SIZE_H);
    downsampleMask();
    
    // Run prediction immediately with fresh data
    runPrediction();
  } else {
    // Set flag to predict shapes when next segmentation is available
    isPredicting = true;
  }
}

function runPrediction() {
  console.log('Running prediction...');
  
  // Make a prediction using the neural network
  nn.predict(downsampledMaskArray, handleResults);
}

function handleResults(results) {
  if (!results) {
    console.error("No prediction results!");
    return;
  }
  
  console.log('Got prediction results:', results);
  
  // Determine how many shapes to create based on user selection
  let shapesToCreate = shapeOptions.count;
  
  // Count how many of each type to create
  let squareCount = 0;
  let triangleCount = 0;
  
  if (shapeOptions.squares && shapeOptions.triangles) {
    // Split evenly if both types are selected
    squareCount = Math.floor(shapesToCreate / 2);
    triangleCount = shapesToCreate - squareCount;
  } else if (shapeOptions.squares) {
    squareCount = shapesToCreate;
  } else if (shapeOptions.triangles) {
    triangleCount = shapesToCreate;
  }
  
  // Create shapes based on prediction
  let shapesCreated = 0;
  
  // First place squares if requested
  for (let i = 0; i < squareCount && shapesCreated < MAX_SHAPES; i++) {
    const index = shapesCreated * 3;
    
    // Get predicted x, y, and rotation
    // Clamp values to ensure they're within canvas bounds
    const x = constrain(results[index].value * CANVAS_SIZE_W, SHAPE_SIZE, CANVAS_SIZE_W - SHAPE_SIZE);
    const y = constrain(results[index + 1].value * CANVAS_SIZE_H, SHAPE_SIZE, CANVAS_SIZE_H - SHAPE_SIZE);
    const rotation = results[index + 2].value * (2 * PI);
    
    // Log the actual values
    console.log(`Square ${i}: x=${x}, y=${y}, rotation=${rotation}`);
    
    // Create new square
    shapes.push(new Shape('square', x, y, rotation));
    shapesCreated++;
  }
  
  // Then place triangles if requested
  for (let i = 0; i < triangleCount && shapesCreated < MAX_SHAPES; i++) {
    const index = shapesCreated * 3;
    
    // Get predicted x, y, and rotation
    // Clamp values to ensure they're within canvas bounds
    const x = constrain(results[index].value * CANVAS_SIZE_W, SHAPE_SIZE, CANVAS_SIZE_W - SHAPE_SIZE);
    const y = constrain(results[index + 1].value * CANVAS_SIZE_H, SHAPE_SIZE, CANVAS_SIZE_H - SHAPE_SIZE);
    const rotation = results[index + 2].value * (2 * PI);
    
    // Log the actual values
    console.log(`Triangle ${i}: x=${x}, y=${y}, rotation=${rotation}`);
    
    // Create new triangle
    shapes.push(new Shape('triangle', x, y, rotation));
    shapesCreated++;
  }
  
  console.log(`Created ${shapesCreated} shapes: ${squareCount} squares and ${triangleCount} triangles`);
}

function downsampleMask() {
  segmentationMask.loadPixels();
  const pixels = segmentationMask.pixels;
  
  // Clear previous arrays
  downsampledMaskArray = [];
  downsampledMaskActualAlphaArray = [];
  
  // Loop through the grid cells
  for (let y = 0; y < GRID_SIZE_H; y++) {
    for (let x = 0; x < GRID_SIZE_W; x++) {
      const startX = Math.floor(x * (CANVAS_SIZE_W / GRID_SIZE_W));
      const startY = Math.floor(y * (CANVAS_SIZE_H / GRID_SIZE_H));
      const endX = Math.floor((x + 1) * (CANVAS_SIZE_W / GRID_SIZE_W));
      const endY = Math.floor((y + 1) * (CANVAS_SIZE_H / GRID_SIZE_H));
      
      // Count white pixels in this region
      let count = 0;
      let total = 0;
      
      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          if (px < CANVAS_SIZE_W && py < CANVAS_SIZE_H) {
            const idx = 4 * (py * CANVAS_SIZE_W + px);
            // Check alpha value (person mask has alpha 255 for person, 0 for background)
            if (pixels[idx + 3] > 128) {
              count++;
            }
            total++;
          }
        }
      }
      
      // Calculate ratio and store both normalized and 0-255 versions
      const value = total > 0 ? count / total : 0;
      downsampledMaskArray.push(value);
      
      // Also store a 0-255 version for visualization
      const alphaValue = Math.round(value * 255);
      downsampledMaskActualAlphaArray.push(alphaValue);
    }
  }
}

function clearShapes() {
  shapes = [];
}

function draw() {
  background(240);
  
  // Draw the video as the background layer
  image(video, 0, 0);
  
  // Draw the segmentation mask with transparency
  push();
  tint(255, 150); // Make the mask semi-transparent
  image(segmentationMask, 0, 0);
  noTint();
  pop();
  
  // Draw grid visualization (optional - comment out if not needed)
  drawDownsampledMask();
  
  // Draw all shapes
  for (let shape of shapes) {
    shape.draw();
  }
  
  // Display status
  fill(255);
  stroke(0);
  strokeWeight(3);
  textSize(14);
  textAlign(LEFT);
  text(`Shapes: ${shapes.length} | Model Ready: ${predictionReady ? 'Yes' : 'No'}`, 10, 20);
  text(`Options: ${shapeOptions.squares ? 'Squares' : ''} ${shapeOptions.triangles ? 'Triangles' : ''} | Count: ${shapeOptions.count}`, 10, 40);
  noStroke();
}

function drawDownsampledMask() {
  // Only draw if we have data
  if (downsampledMaskActualAlphaArray.length === 0) return;
  
  noStroke();
  
  const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
  // Draw semi-transparent grid overlay
  push();
  noFill();
  stroke(0, 255, 0, 50);
  strokeWeight(0.5);
  
  // Draw grid lines
  for (let x = 0; x <= CANVAS_SIZE_W; x += cellWidth) {
    line(x, 0, x, CANVAS_SIZE_H);
  }
  for (let y = 0; y <= CANVAS_SIZE_H; y += cellHeight) {
    line(0, y, CANVAS_SIZE_W, y);
  }
  pop();
}

// Shape class
class Shape {
  constructor(type, x, y, rotation = 0) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    
    if (type === 'square') {
      this.attachmentPoints = [
        {x: -SHAPE_SIZE/2, y: -SHAPE_SIZE/2}, // top-left
        {x: SHAPE_SIZE/2, y: -SHAPE_SIZE/2},  // top-right
        {x: SHAPE_SIZE/2, y: SHAPE_SIZE/2},   // bottom-right
        {x: -SHAPE_SIZE/2, y: SHAPE_SIZE/2}   // bottom-left
      ];
    } else if (type === 'triangle') {
      this.attachmentPoints = [
        {x: 0, y: -SHAPE_SIZE/2},             // top
        {x: SHAPE_SIZE/2, y: SHAPE_SIZE/2},   // bottom-right
        {x: -SHAPE_SIZE/2, y: SHAPE_SIZE/2}   // bottom-left
      ];
    }
  }
  
  getTransformedPoints() {
    return this.attachmentPoints.map(point => {
      const cos = Math.cos(this.rotation);
      const sin = Math.sin(this.rotation);
      return {
        x: this.x + (point.x * cos - point.y * sin),
        y: this.y + (point.x * sin + point.y * cos)
      };
    });
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    stroke(0);
    strokeWeight(2);
    
    // Fill based on shape type
    if (this.type === 'square') {
      fill(200, 150, 150, 200);
    } else {
      fill(150, 200, 150, 200);
    }
    
    if (this.type === 'square') {
      rectMode(CENTER);
      rect(0, 0, SHAPE_SIZE, SHAPE_SIZE);
    } else if (this.type === 'triangle') {
      triangle(0, -SHAPE_SIZE/2, 
              SHAPE_SIZE/2, SHAPE_SIZE/2, 
              -SHAPE_SIZE/2, SHAPE_SIZE/2);
    }
    
    // Draw attachment points (optional)
    fill(0, 255, 0);
    for (let point of this.attachmentPoints) {
      circle(point.x, point.y, 6);
    }
    
    pop();
  }
}