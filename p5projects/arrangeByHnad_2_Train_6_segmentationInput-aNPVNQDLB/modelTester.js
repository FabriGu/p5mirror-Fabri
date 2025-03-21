// Model Loader Tester - Loads the trained model from files and tests it
// Uses the same data processing as the training code

// Variables for testing
let testNN;
let isModelLoaded = false;
let isTesting = false;

function setupModelTester() {
  const buttonY = CANVAS_SIZE_H + 100; // Position below other controls
  
  // Create model loading button
  const loadButton = createButton('Load Saved Model');
  loadButton.position(10, buttonY);
  loadButton.mousePressed(loadSavedModel);
  
  // Create button to capture new segmentation frame
  const captureButton = createButton('Capture New Frame');
  captureButton.position(150, buttonY);
  captureButton.mousePressed(captureNewFrame);
  
  // Shape count inputs
  createSpan('Squares:').position(280, buttonY);
  const squaresInput = createInput('0', 'number');
  squaresInput.position(340, buttonY);
  squaresInput.size(30);
  squaresInput.id('testSquares');
  
  createSpan('Triangles:').position(380, buttonY);
  const trianglesInput = createInput('10', 'number');
  trianglesInput.position(440, buttonY);
  trianglesInput.size(30);
  trianglesInput.id('testTriangles');
  
  // Predict button
  const predictButton = createButton('Predict Shapes');
  predictButton.position(480, buttonY);
  predictButton.mousePressed(predictShapes);
  
  // Button to return to training mode
  const trainButton = createButton('Training Mode');
  trainButton.position(590, buttonY);
  trainButton.mousePressed(switchToTrainingMode);
  
  // Create the neural network for testing
  const options = {
  task: 'regression',
  debug: true,
  inputs: GRID_SIZE_W * GRID_SIZE_H,
  outputs: MAX_SHAPES * 3,
  learningRate: 0.5,  // Increased from 0.01
  layers: [
    { type: 'dense', units: 128, activation: 'relu' },
    { type: 'dense', units: 64, activation: 'relu' },
    { type: 'dense', units: MAX_SHAPES * 3, activation: 'linear' }  // Changed from sigmoid to linear
  ]
};
  // Initialize neural network
  testNN = ml5.neuralNetwork(options);
  
  console.log("Model Loader Tester initialized");
}

// Load the saved model from files
function loadSavedModel() {
  // Define paths to model files
  const modelInfo = {
    model: './model/model.json',
    metadata: './model/model_meta.json',
    weights: './model/model.weights.bin'
  };
  
  console.log("Loading model from files...");
  
  // Load the model
  testNN.load(modelInfo, () => {
    console.log("Model loaded successfully!");
    isModelLoaded = true;
    
    // Switch to testing mode and capture a frame
    isTesting = true;
    captureNewFrame();
  });
}

// Capture a new segmentation frame
function captureNewFrame() {
  if (!isTesting) {
    isTesting = true;
  }
  
  // Clear existing shapes
  shapes = [];
  
  // Stop any ongoing detection
  bodySegmentation.detectStop();
  
  // Reset capturing mode
  isCapturingMode = false;
  
  console.log("Capturing new segmentation frame...");
  
  // Start segmentation with our callback
  bodySegmentation.detectStart(video, gotTestFrame);
}

// Callback for segmentation
function gotTestFrame(result) {
  if (!result || !result.mask) return;
  
  console.log("Got new segmentation frame");
  
  // Process exactly as in training mode
  segmentation = result;
  
  // Copy to mask
  segmentationMask.clear();
  segmentationMask.image(segmentation.mask, 0, 0, CANVAS_SIZE_W, CANVAS_SIZE_H);
  
  // Downsample mask using the same function as in training
  downsampledMaskArray = downsampleMask();
  
  // Stop continuous segmentation after getting a frame
  bodySegmentation.detectStop();
}

// Predict shapes with the model
function predictShapes() {
  if (!isModelLoaded) {
    alert("Please load the model first by clicking 'Load Saved Model'");
    return;
  }
  
  if (!downsampledMaskArray || downsampledMaskArray.length === 0) {
    alert("No segmentation frame available. Please capture a frame first.");
    return;
  }
  
  // Clear existing shapes
  shapes = [];
  
  // Get shape counts
  const numSquares = parseInt(select('#testSquares').value()) || 0;
  const numTriangles = parseInt(select('#testTriangles').value()) || 0;
  const totalShapes = numSquares + numTriangles;
  
  if (totalShapes <= 0) {
    alert("Please specify at least one shape (square or triangle)");
    return;
  }
  
  console.log("Running prediction with loaded model...");
  console.log(`Input array length: ${downsampledMaskArray.length}`);
  
  // Use the predict method to run the model
  testNN.predict(downsampledMaskArray, (results) => {
    console.log("Model prediction complete");
    
    // Create shapes based on prediction
    let shapesCreated = 0;
    let squaresCreated = 0;
    let trianglesCreated = 0;
    
    // Log some raw results for debugging
    console.log("Sample prediction results:");
    for (let i = 0; i < Math.min(9, results.length); i += 3) {
      console.log(`Shape ${i/3}: x=${results[i].value.toFixed(3)}, y=${results[i+1].value.toFixed(3)}, r=${results[i+2].value.toFixed(3)}`);
    }
    
    // Process and create shapes
    for (let i = 0; i < Math.min(totalShapes, MAX_SHAPES); i++) {
      const index = i * 3;
      
      // Make sure we have data for this shape
      if (index + 2 >= results.length) {
        console.log(`No more data available at index ${index}`);
        break;
      }
      
      // Determine shape type
      let shapeType = "square"
      // let shapeType;
      // if (squaresCreated < numSquares) {
      //   shapeType = 'square';
      //   squaresCreated++;
      // } else if (trianglesCreated < numTriangles) {
      //   shapeType = 'triangle';
      //   trianglesCreated++;
      // } else {
      //   break;
      // }
      
      // Get predicted coordinates and rotation
//       const x = constrain(results[index].value * CANVAS_SIZE_W, SHAPE_SIZE, CANVAS_SIZE_W - SHAPE_SIZE);
      // const y = constrain(results[index + 1].value * CANVAS_SIZE_H, SHAPE_SIZE, CANVAS_SIZE_H - SHAPE_SIZE);
      // const x = results[index].value * CANVAS_SIZE_W;
// const y = results[index + 1].value * CANVAS_SIZE_H;
      
      const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
const x = results[index].value * GRID_SIZE_W * cellWidth;
const y = results[index + 1].value * GRID_SIZE_H * cellHeight;
      const rotation = results[index + 2].value * (2 * PI);
      
      // Create the shape
      const newShape = new Shape(shapeType, x, y);
      newShape.rotation = rotation;
      shapes.push(newShape);
      shapesCreated++;
      
      console.log(`Created ${shapeType} at x=${x.toFixed(0)}, y=${y.toFixed(0)}, rotation=${rotation.toFixed(2)}`);
    }
    
    console.log(`Model prediction created ${shapesCreated} shapes (${squaresCreated} squares, ${trianglesCreated} triangles)`);
    
    // Try to connect the shapes
    connectShapes();
  });
}

// Connect shapes that are close to each other
function connectShapes() {
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      const pointsA = shapes[i].getTransformedPoints();
      const pointsB = shapes[j].getTransformedPoints();
      
      for (let pi = 0; pi < pointsA.length; pi++) {
        for (let pj = 0; pj < pointsB.length; pj++) {
          const d = dist(pointsA[pi].x, pointsA[pi].y, pointsB[pj].x, pointsB[pj].y);
          
          if (d < ATTACHMENT_DISTANCE) {
            // Create connections between the shapes
            if (!shapes[i].connections.has(pi)) {
              shapes[i].connections.set(pi, []);
            }
            shapes[i].connections.get(pi).push({
              shape: shapes[j],
              pointIndex: pj
            });
            
            if (!shapes[j].connections.has(pj)) {
              shapes[j].connections.set(pj, []);
            }
            shapes[j].connections.get(pj).push({
              shape: shapes[i],
              pointIndex: pi
            });
          }
        }
      }
    }
  }
}

// Switch back to training mode
function switchToTrainingMode() {
  // Stop any ongoing detection
  bodySegmentation.detectStop();
  
  // Clear shapes
  shapes = [];
  
  // Reset to training mode
  isTesting = false;
  isCapturingMode = true;
  
  // Clear the mask
  segmentationMask.clear();
  segmentationMask.background(0);
  
  // Restart detection in training mode
  bodySegmentation.detectStart(video, gotSegmentation);
  
  console.log("Switched to training mode");
}

// Override the draw function to show model loading status
const originalDraw = window.draw || function() {};
window.draw = function() {
  originalDraw();
  
  // Display status information
  if (isTesting) {
    fill(0, 255, 0);
    textSize(14);
    textAlign(LEFT);
    text(`TESTING MODE | Model ${isModelLoaded ? 'LOADED' : 'NOT LOADED'}`, 10, CANVAS_SIZE_H - 10);
  }
};

// Initialize the tester
window.addEventListener('load', function() {
  setTimeout(setupModelTester, 1000);
});