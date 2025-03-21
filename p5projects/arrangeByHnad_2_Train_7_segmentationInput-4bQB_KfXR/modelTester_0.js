// Model Tester - Uses the same mechanics as training to test the trained model
let testMode = false;  // Flag to indicate if we're in testing mode
let testNN;  // Neural network instance for testing
let isModelLoaded = false;  // Flag to indicate if the model is loaded
let testingInProgress = false;  // Flag to indicate if testing is in progress

// Initialize the tester
function initModelTester() {
  const testButtonY = CANVAS_SIZE_H + 200;  // Position below other controls

  // Create test button
  const testButton = createButton('Test Model [t]');
  testButton.position(10, testButtonY);
  testButton.mousePressed(toggleTestMode);
  
  // Create square count input
  createSpan('Test Squares: ').position(120, testButtonY);
  const testSquaresInput = createInput('0', 'number');
  testSquaresInput.position(200, testButtonY);
  testSquaresInput.size(30);
  testSquaresInput.attribute('min', '0');
  testSquaresInput.attribute('max', MAX_SHAPES);
  testSquaresInput.id('testSquares');
  
  // Create triangle count input
  createSpan('Test Triangles: ').position(240, testButtonY);
  const testTrianglesInput = createInput('10', 'number');
  testTrianglesInput.position(330, testButtonY);
  testTrianglesInput.size(30);
  testTrianglesInput.attribute('min', '0');
  testTrianglesInput.attribute('max', MAX_SHAPES);
  testTrianglesInput.id('testTriangles');
  
  // Create predict button (initially hidden)
  const predictButton = createButton('Predict Shapes with Model [p]');
  predictButton.position(370, testButtonY);
  predictButton.mousePressed(predictWithModel);
  predictButton.id('predictButton');
  predictButton.style('display', 'none');
  
  // Create test model options
  const options = {
    task: 'regression',
    debug: false,
    inputs: GRID_SIZE_W * GRID_SIZE_H,
    outputs: MAX_SHAPES * 3,
    learningRate: 0.5,
    layers: [
      { type: 'dense', units: 128, activation: 'relu' },
      { type: 'dense', units: 64, activation: 'relu' },
      { type: 'dense', units: MAX_SHAPES * 3, activation: 'linear' }
    ]
  };
  
  // Initialize the neural network for testing
  testNN = ml5.neuralNetwork(options);
  
  // Add key bindings
  const originalKeyPressed = window.keyPressed || function() {};
  window.keyPressed = function() {
    originalKeyPressed();
    
    if (key === 'l') toggleTestMode();
    if (key === 'p' && testMode) predictWithModel();
  };
}

// Toggle between training and testing modes
function toggleTestMode() {
  testMode = !testMode;
  
  // Clear any existing shapes
  shapes = [];
  
  if (testMode) {
    // Enter test mode
    console.log("Entering test mode");
    
    // Stop training mode capture if running
    if (isCapturingMode) {
      bodySegmentation.detectStop();
      isCapturingMode = false;
    }
    
    // Load model if not already loaded
    if (!isModelLoaded) {
      const modelDetails = {
        model: './model/model.json',
        metadata: './model/model_meta.json',
        weights: './model/model.weights.bin'
      };
      
      testNN.load(modelDetails, () => {
        console.log("Model loaded for testing");
        isModelLoaded = true;
      });
    }
    
    // Start segmentation for testing
    bodySegmentation.detectStart(video, gotTestSegmentation);
    
    // Show predict button
    select('#predictButton').style('display', 'inline');
  } else {
    // Exit test mode
    console.log("Exiting test mode");
    
    // Stop test mode segmentation
    bodySegmentation.detectStop();
    
    // Hide predict button
    select('#predictButton').style('display', 'none');
    
    // Return to training mode
    isCapturingMode = true;
    bodySegmentation.detectStart(video, gotSegmentation);
  }
}

// Callback function for body segmentation in test mode
function gotTestSegmentation(result) {
  if (!testMode || !result || !result.mask) return;
  
  segmentation = result;
  
  // Copy the segmentation to our mask
  segmentationMask.clear();
  segmentationMask.image(segmentation.mask, 0, 0, CANVAS_SIZE_W, CANVAS_SIZE_H);
  
  // Create the downsampled version - using the exact same code as in training
  downsampledMaskArray = downsampleMask();
  
  // If testing is in progress, predict shapes
  if (testingInProgress && isModelLoaded) {
    runModelPrediction();
    testingInProgress = false;
  }
}

// Predict shapes with the model
function predictWithModel() {
  if (!testMode || !isModelLoaded) {
    console.log("Cannot predict: Not in test mode or model not loaded");
    return;
  }
  
  // Clear any existing shapes
  shapes = [];
  
  // Set flag to trigger prediction when next segmentation arrives
  testingInProgress = true;
  console.log("Preparing to predict shapes with model...");
}

// Run model prediction with current mask
function runModelPrediction() {
  console.log("Running model prediction...");
  
  // Ensure we have mask data
  if (downsampledMaskArray.length === 0) {
    console.error("No mask data available for prediction");
    return;
  }
  
  // Log sample mask values for debugging
  console.log("Sample mask values:", downsampledMaskArray.slice(0, 5), 
              "... (total:", downsampledMaskArray.length, "values)");
  
  // Run prediction
  testNN.predict(downsampledMaskArray, handlePredictionResults);
}

// Handle prediction results
function handlePredictionResults(results) {
  if (!results) {
    console.error("No prediction results");
    return;
  }
  
  console.log("Got prediction results:", results);
  
  // Get shape counts
  const numSquares = parseInt(select('#testSquares').value());
  const numTriangles = parseInt(select('#testTriangles').value());
  const totalShapes = numSquares + numTriangles;
  
  // Create shapes based on prediction
  let shapesCreated = 0;
  let squaresCreated = 0;
  let trianglesCreated = 0;
  
  for (let i = 0; i < totalShapes && shapesCreated < MAX_SHAPES; i++) {
    const index = i * 3;
    
    // Get predicted x, y, rotation
    const x = constrain(results[index].value * CANVAS_SIZE_W, SHAPE_SIZE, CANVAS_SIZE_W - SHAPE_SIZE);
    const y = constrain(results[index + 1].value * CANVAS_SIZE_H, SHAPE_SIZE, CANVAS_SIZE_H - SHAPE_SIZE);
    const rotation = results[index + 2].value * (2 * PI);
    
    // Determine shape type
    let shapeType;
    if (squaresCreated < numSquares) {
      shapeType = 'square';
      squaresCreated++;
    } else if (trianglesCreated < numTriangles) {
      shapeType = 'triangle';
      trianglesCreated++;
    } else {
      break;
    }
    
    // Create and add the shape
    const newShape = new Shape(shapeType, x, y);
    newShape.rotation = rotation;
    shapes.push(newShape);
    shapesCreated++;
    
    console.log(`Created ${shapeType} at x=${x.toFixed(1)}, y=${y.toFixed(1)}, rotation=${rotation.toFixed(2)}`);
  }
  
  // Try to connect shapes (like in the auto placement algorithm)
  tryConnectShapes();
  
  console.log(`Prediction complete: Created ${shapesCreated} shapes (${squaresCreated} squares, ${trianglesCreated} triangles)`);
}

// Try to connect shapes after prediction
function tryConnectShapes() {
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      tryConnectShapePair(shapes[i], shapes[j]);
    }
  }
}

// Try to connect a pair of shapes
function tryConnectShapePair(shapeA, shapeB) {
  const pointsA = shapeA.getTransformedPoints();
  const pointsB = shapeB.getTransformedPoints();
  
  for (let i = 0; i < pointsA.length; i++) {
    for (let j = 0; j < pointsB.length; j++) {
      const d = dist(pointsA[i].x, pointsA[i].y, pointsB[j].x, pointsB[j].y);
      
      if (d < ATTACHMENT_DISTANCE) {
        // Create connection
        if (!shapeA.connections.has(i)) {
          shapeA.connections.set(i, []);
        }
        shapeA.connections.get(i).push({
          shape: shapeB,
          pointIndex: j
        });
        
        if (!shapeB.connections.has(j)) {
          shapeB.connections.set(j, []);
        }
        shapeB.connections.get(j).push({
          shape: shapeA,
          pointIndex: i
        });
        
        return true;
      }
    }
  }
  
  return false;
}

// Modified draw function
const originalDraw = window.draw || function() {};
window.draw = function() {
  originalDraw();
  
  // In test mode, add additional UI elements
  if (testMode) {
    fill(255, 0, 0);
    textSize(14);
    textAlign(LEFT);
    text("TEST MODE | Model " + (isModelLoaded ? "Loaded" : "Loading..."), 10, CANVAS_SIZE_H - 10);
  }
};

// Call this function after your setup completes
window.addEventListener('load', function() {
  // Wait for the main sketch to initialize
  setTimeout(initModelTester, 1000);
});