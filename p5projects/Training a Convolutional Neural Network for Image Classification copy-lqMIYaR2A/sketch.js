// Constants defining canvas size and grid
const CANVAS_SIZE_W = 640;
const CANVAS_SIZE_H = 480;
const GRID_SIZE_W = 64; // Width of downsampled grid
const GRID_SIZE_H = 48; // Height of downsampled grid (preserves aspect ratio)

// Calculate scale factors between canvas and grid
const SCALE_FACTOR_W = CANVAS_SIZE_W / GRID_SIZE_W;
const SCALE_FACTOR_H = CANVAS_SIZE_H / GRID_SIZE_H;

// Shape-related constants
const SHAPE_SIZE = 50;
const ATTACHMENT_DISTANCE = 15;
const MAX_SHAPES = 20;

// Global variables
let video;
let model;
let shapes = [];
let isModelLoaded = false;
let isModelRunning = false;

function setup() {
  pixelDensity(1);
  // Create canvas with ratio equal to video
  createCanvas(CANVAS_SIZE_W, CANVAS_SIZE_H);
  
  // Set up video capture
  video = createCapture(VIDEO);
  video.size(CANVAS_SIZE_W, CANVAS_SIZE_H);
  video.hide();

  // Start body segmentation model
  bodySegmentation.detectStart(video, gotResults);
  
  // Set up UI
  createUI();
  
  // Load the pre-trained model
  loadModel();
}

// Create basic UI elements
function createUI() {
  const buttonY = CANVAS_SIZE_H + 10;
  
  createButton("Get New Frame")
    .position(10, 10)
    .mousePressed(() => {
      console.log("Getting new frame");
      bodySegmentation.detectStart(video, gotResults);
    });

  createButton("Run Model [r]")
    .position(120, buttonY)
    .mousePressed(runModelOnCurrentFrame);

  createButton("Clear Shapes [c]")
    .position(230, buttonY)
    .mousePressed(() => shapes = []);
}

// Load the pre-trained neural network model
function loadModel() {
  console.log("Loading model...");
  
  // Initialize ml5 neural network
  const options = {
    inputs: GRID_SIZE_W * GRID_SIZE_H * 4, // Flattened RGBA data
    outputs: MAX_SHAPES * 4, // type, x, y, rotation for each shape
    modelType: 'neuralNetwork',
    task: 'regression',
    debug: true
  };
  
  model = ml5.neuralNetwork(options);
  
  // Load the pre-trained model
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin'
  };
  
  model.load(modelInfo, modelLoaded);
}

// Callback when model is loaded
function modelLoaded() {
  console.log("Model loaded successfully!");
  isModelLoaded = true;
}

// Run the model on the current segmentation mask
function runModelOnCurrentFrame() {
  if (!isModelLoaded || isModelRunning) {
    console.log("Model not ready or already running");
    return;
  }
  
  if (!normalizedImageData || normalizedImageData.length === 0) {
    console.log("No segmentation data available");
    return;
  }
  
  console.log("Running model prediction...");
  isModelRunning = true;
  
  // Ensure we have the right input format
  if (normalizedImageData.length !== GRID_SIZE_W * GRID_SIZE_H * 4) {
    console.error(`Input data has wrong length: ${normalizedImageData.length}, expected ${GRID_SIZE_W * GRID_SIZE_H * 4}`);
    isModelRunning = false;
    return;
  }

  // Predict using the model
  model.predict(normalizedImageData, gotPrediction);
}

// Process model prediction output
function gotPrediction(error, results) {
  isModelRunning = false;
  
  if (error) {
    console.error("Prediction error:", error);
    return;
  }
  
  console.log("Got prediction:", results);
  
  // Clear existing shapes
  shapes = [];
  
  // Process the output to create shapes
  const outputs = results[0].value; // Get the array of outputs
  
  // Loop through each shape's data (MAX_SHAPES * 4 values)
  for (let i = 0; i < MAX_SHAPES; i++) {
    const baseIndex = i * 4;
    const type = outputs[baseIndex]; // 1 = square, 2 = triangle
    const normX = outputs[baseIndex + 1]; // Normalized x (0-1)
    const normY = outputs[baseIndex + 2]; // Normalized y (0-1)
    const normRotation = outputs[baseIndex + 3]; // Normalized rotation (0-1)
    
    // Skip if type is close to 0 (no shape)
    if (type < 0.5) continue;
    
    // Determine shape type
    const shapeType = type < 1.5 ? 'square' : 'triangle';
    
    // Convert normalized coordinates back to canvas coordinates
    const gridX = normX * GRID_SIZE_W;
    const gridY = normY * GRID_SIZE_H;
    const canvasX = gridX * SCALE_FACTOR_W;
    const canvasY = gridY * SCALE_FACTOR_H;
    
    // Convert normalized rotation back to radians
    const rotation = normRotation * (2 * PI);
    
    // Create the shape
    const shape = new Shape(shapeType, canvasX, canvasY);
    shape.rotation = rotation;
    
    // Add it to our shapes array
    shapes.push(shape);
  }
  
  console.log(`Created ${shapes.length} shapes from model prediction`);
}

// Keyboard controls
function keyPressed() {
  if (key === 'r') {
    runModelOnCurrentFrame();
  } else if (key === 'c') {
    shapes = [];
  }
}

function draw() {
  // Clear the canvas
  background(240);
  
  // Draw the segmentation mask if available
  if (segmentationMask) {
    image(segmentationMask, 0, 0);
  }
  
  // Draw all shapes
  for (let shape of shapes) {
    shape.draw();
  }
  
  // Display status
  fill(0);
  textSize(14);
  textAlign(LEFT);
  text(`Model Status: ${isModelLoaded ? 'Loaded' : 'Loading...'}`, 10, 20);
  text(`Shapes: ${shapes.length}`, 10, 40);
  
  // Display "press R to run" reminder if model is loaded
  if (isModelLoaded && shapes.length === 0 && normalizedImageData && normalizedImageData.length > 0) {
    fill(0, 102, 153);
    textSize(16);
    textAlign(CENTER);
    text("Press 'R' to run the model", width/2, height/2);
  }
}