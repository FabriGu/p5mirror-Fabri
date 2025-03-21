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
  const squaresInput = createInput('5', 'number');
  squaresInput.position(340, buttonY);
  squaresInput.size(30);
  squaresInput.id('testSquares');
  
  createSpan('Triangles:').position(380, buttonY);
  const trianglesInput = createInput('5', 'number');
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
  
  // Create the neural network for testing - same options as in main sketch
  const options = {
    task: 'imageClassification',
    debug: true,
    inputs: GRID_SIZE_W * GRID_SIZE_H,
    outputs: MAX_SHAPES * 3,
    learningRate: 0.5,
    // layers: [
    //   { type: 'dense', units: 128, activation: 'relu' },
    //   { type: 'dense', units: 64, activation: 'relu' },
    //   { type: 'dense', units: MAX_SHAPES * 3, activation: 'linear' }
    // ]
  };
  
  // Initialize neural network
  testNN = ml5.neuralNetwork(options);
  
  console.log("Model Loader Tester initialized");
}

// Load the saved model from files
function loadSavedModel() {
  const modelInfo = {
    model: './model/model.json',
    metadata: './model/model_meta.json',
    weights: './model/model.weights.bin'
  };
  
  console.log("Loading model from files...");
  
  testNN.load(modelInfo, () => {
    console.log("Model loaded successfully!");
    isModelLoaded = true;
    isTesting = true;
    captureNewFrame();
  });
}

// Capture a new segmentation frame
function captureNewFrame() {
  // Stop any ongoing detection
  bodySegmentation.detectStop();
  
  // Clear existing shapes
  shapes = [];
  
  // Force testing mode
  isTesting = true;
  
  // Important: temporarily set isCapturingMode = true
  // This tricks gotSegmentation into processing the result
  const originalCapturingMode = isCapturingMode;
  isCapturingMode = true;
  
  console.log("Starting new frame capture...");
  
  // Use the same segmentation callback as the main sketch
  bodySegmentation.detectStart(video, (result) => {
    // Process using the same function from the main sketch
    gotSegmentation(result);
    
    // Force back to testing mode display
    isCapturingMode = false;
    isTesting = true;
    
    console.log("New frame captured successfully");
    console.log(`Mask array length: ${downsampledMaskArray.length}`);
  });
}
// Predict shapes with the model - with extra debugging
function predictShapes() {
  console.log("=== PREDICTING SHAPES ===");
  
  if (!isModelLoaded) {
    alert("Please load the model first by clicking 'Load Saved Model'");
    return;
  }
  
  if (!downsampledMaskArray || downsampledMaskArray.length === 0) {
    alert("No segmentation frame available. Please capture a frame first.");
    return;
  }
  
  // Display same sample values as in frame capture for comparison
  console.log("Mask array being used for prediction, sample values:");
  for (let i = 0; i < Math.min(5, downsampledMaskArray.length); i++) {
    console.log(`  [${i}]: ${downsampledMaskArray[i].toFixed(4)}`);
  }
  
  // Print some values from the end of the array
  if (downsampledMaskArray.length > 10) {
    console.log("Sample values from end:");
    for (let i = downsampledMaskArray.length - 5; i < downsampledMaskArray.length; i++) {
      console.log(`  [${i}]: ${downsampledMaskArray[i].toFixed(4)}`);
    }
  }
  
  // Clear existing shapes
  shapes = [];
  
  // Get shape counts from the input fields
  const squaresInput = select('#testSquares');
  const trianglesInput = select('#testTriangles');
  
  // Parse values and verify them
  const numSquares = parseInt(squaresInput.value()) || 0;
  const numTriangles = parseInt(trianglesInput.value()) || 0;
  
  console.log(`Inputs - Squares: ${squaresInput.value()}, Triangles: ${trianglesInput.value()}`);
  console.log(`Parsed - Squares: ${numSquares}, Triangles: ${numTriangles}`);
  
  // Create array of shape types
  const shapeTypes = [];
  for (let i = 0; i < numSquares; i++) shapeTypes.push('square');
  for (let i = 0; i < numTriangles; i++) shapeTypes.push('triangle');
  
  console.log(`Shape types array (${shapeTypes.length}): ${shapeTypes.join(', ')}`);
  
  if (shapeTypes.length === 0) {
    alert("Please specify at least one shape");
    return;
  }
  
  // Clone the array to make sure we're using a clean copy
  const predictionInput = [...downsampledMaskArray];
  console.log(`Using prediction input length: ${predictionInput.length}`);
  
  // Run prediction
  testNN.predict(predictionInput, (results) => {
    console.log("Prediction complete - results length: " + results.length);
    
    // Show raw results for debugging
    console.log("First 9 prediction values:");
    for (let i = 0; i < Math.min(9, results.length); i++) {
      console.log(`  [${i}]: ${results[i].value.toFixed(4)}`);
    }
    
    let squaresCreated = 0;
    let trianglesCreated = 0;
    
    // Create each requested shape
    for (let i = 0; i < shapeTypes.length && i < MAX_SHAPES; i++) {
      const index = i * 3;
      
      if (index + 2 >= results.length) {
        console.log(`Not enough results for shape ${i}`);
        break;
      }
      
      const shapeType = shapeTypes[i];
      
      // Use the exact same coordinate calculation as in training
      const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
      const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
      const x = results[index].value * GRID_SIZE_W * cellWidth;
      const y = results[index + 1].value * GRID_SIZE_H * cellHeight;
      const rotation = results[index + 2].value * (2 * PI);
      
      // Create the shape
      const newShape = new Shape(shapeType, x, y);
      newShape.rotation = rotation;
      shapes.push(newShape);
      
      if (shapeType === 'square') squaresCreated++;
      else trianglesCreated++;
      
      console.log(`Created ${shapeType} at x=${x.toFixed(2)}, y=${y.toFixed(2)}, rotation=${rotation.toFixed(2)}`);
    }
    
    console.log(`CREATED: ${squaresCreated} squares and ${trianglesCreated} triangles`);
    
    // Connect shapes
    connectShapes();
    
    console.log("=== PREDICTION COMPLETE ===");
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