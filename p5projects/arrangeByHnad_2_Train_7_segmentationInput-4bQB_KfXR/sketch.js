let bodySegmentation;
let video;
let segmentation;
let segmentationMask;
let downsampledMaskArray = [];
let shapes = [];
let selectedShape = null;
let nn;
let trainingData = [];
let isCapturingMode = true; // Start in capturing mode
let showDownsampled = true; // Show downsampled version
let downsampledMaskActualAlphaArray = [];

// Constants
const CANVAS_SIZE_W = 640;
const CANVAS_SIZE_H = 480;
const SHAPE_SIZE = 50;
const GRID_SIZE_W = 64; // Width of downsampled grid
const GRID_SIZE_H = 48; // Height of downsampled grid (preserves aspect ratio)
const MAX_SHAPES = 20; // 2 squares and 2 triangles
const ATTACHMENT_DISTANCE = 15;

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
 
//   const options = {
//     task: 'regression',
//     debug: true,
//     inputs: GRID_SIZE_W * GRID_SIZE_H,
//     outputs: MAX_SHAPES * 3,
//     learningRate: 0.01,
//     layers: [
//       { type: 'dense', units: 256, activation: 'relu' },
//       { type: 'dense', units: 128, activation: 'relu' },
//       { type: 'dense', units: MAX_SHAPES * 3, activation: 'sigmoid' }
//     ]
//   };
  
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
  
  nn = ml5.neuralNetwork(options);
  
  // Start body segmentation in detection mode
  bodySegmentation.detectStart(video, gotSegmentation);
  
  // Create UI controls
  createUI();
  
  initAutoPlacement();
  window.onload = function() {
      // Wait a bit for the main sketch to initialize
      setTimeout(initAutoPlacement, 1000);
  };
  
  // setupSimpleAutoTester();
  setupModelTester();
}

function createUI() {
  const buttonY = CANVAS_SIZE_H + 10;
  
  // Create UI buttons
  createButton('Add Square [s]').position(10, buttonY).mousePressed(() => addShape('square'));
  createButton('Add Triangle [t]').position(120, buttonY).mousePressed(() => addShape('triangle'));
  createButton('Save Example [d]').position(230, buttonY).mousePressed(saveTrainingExample);
  createButton('Train Model [m]').position(350, buttonY).mousePressed(trainModel);
  createButton('Toggle View [v]').position(460, buttonY).mousePressed(() => showDownsampled = !showDownsampled);
  
  // Add status text
  createP('Press [d] to save a training example. Press [m] to train the model.').position(10, CANVAS_SIZE_H + 50);
}

function draw() {
  background(240);
  
  if (isCapturingMode) {
    // In capturing mode, show the webcam feed with semi-transparent overlay
    // to indicate we're waiting for a segmentation snapshot
    tint(255, 150);
    image(video, 0, 0);
    noTint();
    
    fill(0);
    textSize(20);
    textAlign(CENTER);
    text("Waiting for segmentation...", width/2, height/2);
  } else {
    // In training mode, show either the original mask or downsampled mask
    if (showDownsampled) {
      // Draw the downsampled mask directly from the array
      drawDownsampledMask();
      // image(downsampledMaskI,0,0)
    } else {
      // console.log(segmentationMask)
      image(segmentationMask, 0, 0);
    }
    
    // Draw all shapes
    for (let shape of shapes) {
      shape.draw();
    }
    
    // Draw connections between shapes
    stroke(0, 0, 255, 150);
    strokeWeight(2);
    for (let shape of shapes) {
      const fromPoints = shape.getTransformedPoints();
      for (let [fromIdx, connections] of shape.connections.entries()) {
        for (let conn of connections) {
          const toPoints = conn.shape.getTransformedPoints();
          line(
            fromPoints[fromIdx].x, fromPoints[fromIdx].y, 
            toPoints[conn.pointIndex].x, toPoints[conn.pointIndex].y
          );
        }
      }
    }
    
    // Handle shape dragging
    if (selectedShape) {
      selectedShape.x = mouseX;
      selectedShape.y = mouseY;
    }
    
    // Display status
    fill(0);
    textSize(14);
    textAlign(LEFT);
    text(`Training Examples: ${trainingData.length} | Shapes: ${shapes.length}`, 10, 20);
    text(`Viewing: ${showDownsampled ? 'Downsampled Mask' : 'Original Mask'}`, width - 250, 20);
  }
}



// Callback function for body segmentation results
function gotSegmentation(result) {
  if (!result || !result.mask) return;
  
  segmentation = result;
  
  if (isCapturingMode) {
    // When in capturing mode and we get a valid segmentation,
    // copy it to our mask and switch to training mode
    segmentationMask.clear();
    segmentationMask.image(segmentation.mask, 0, 0, CANVAS_SIZE_W, CANVAS_SIZE_H);
    
    // Clear previous arrays before creating new ones
    downsampledMaskArray = [];
    downsampledMaskActualAlphaArray = [];
    
    // Create the downsampled version
    const downsampledMaskI = downsampleMask();
    // console.log(downsampledMaskI);
    downsampledMaskArray = downsampledMaskI;
    
    // Switch to training mode (placing shapes)
    isCapturingMode = false;
    
    // Make sure to stop detection
    bodySegmentation.detectStop();
  }
}


// Draw the downsampled mask with the same logic as above
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
      // if (alphaValue > 128) {
      //   fill(0); // White for person 
      // } else {
      //   fill(255);   // Black for background
      // }
      fill(alphaValue)
      
      // Draw this cell as a rectangle
      rect(x, y, cellWidth, cellHeight);
    }
  }
}


// function downsampleMask() {
//   segmentationMask.loadPixels();
//   const pixels = segmentationMask.pixels;
//   console.log(pixels)
  
//   const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
//   const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
//   // Clear previous arrays
//   const grid = [];
//   downsampledMaskActualAlphaArray = [];
  
//   // Loop through the canvas in cell-sized chunks
//   for (let y = 0; y < CANVAS_SIZE_H; y += cellHeight) {
//     for (let x = 0; x < CANVAS_SIZE_W; x += cellWidth) {
//       let personPixels = 0;
//       let totalPixels = 0;
      
//       // For each cell, scan all pixels inside it
//       for (let scanY = y; scanY < y + cellHeight && scanY < CANVAS_SIZE_H; scanY++) {
//         for (let scanX = x; scanX < x + cellWidth && scanX < CANVAS_SIZE_W; scanX++) {
//           // Get the exact pixel index in the pixels array
//           const pixelIndex = 4 * (Math.floor(scanY) * CANVAS_SIZE_W + Math.floor(scanX));
          
//           // Check if this is a person pixel (alpha > 128)
//           if (pixels[pixelIndex + 3] > 128) {
//             personPixels++;
//           }
//           totalPixels++;
//         }
//       }
      
//       // const ratio = 1 + 0 - (personPixels/totalPixels);
      
//       // Calculate ratio and store both normalized and 0-255 versions
//       const ratio = totalPixels > 0 ? personPixels / totalPixels : 0;
//       // const ratio = personPixels/totalPixels;
//       grid.push(ratio); // 0-1 range for neural network
      
//       // Also store a 0-255 version for visualization
//       const alphaValue = Math.round(ratio * 255);
//       downsampledMaskActualAlphaArray.push(alphaValue);
//     }
//   }
  
//   return grid;
// }
function downsampleMask() {
  segmentationMask.loadPixels();
  const pixels = segmentationMask.pixels;
  
  const grid = [];
  const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
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
            if (pixels[idx + 3] > 128) {
              count++;
            }
            total++;
          }
        }
      }
      
      const value = total > 0 ? count / total : 0;
      grid.push(value);
      downsampledMaskActualAlphaArray.push(Math.round(value * 255));
    }
  }
  
  return grid;
}

function mousePressed() {
  if (isCapturingMode) return;
  
  // Check if clicking on a shape
  selectedShape = null;
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i].contains(mouseX, mouseY)) {
      selectedShape = shapes[i];
      selectedShape.disconnectAll();
      break;
    }
  }
}

function mouseReleased() {
  if (isCapturingMode) return;
  
  if (selectedShape) {
    selectedShape.tryConnect();
    selectedShape = null;
  }
}

function keyPressed() {
  if (isCapturingMode) return;
  
  if (key === 's') addShape('square');
  if (key === 't') addShape('triangle');
  if (key === 'd') saveTrainingExample();
  if (key === 'm') trainModel();
  if (key === 'v') showDownsampled = !showDownsampled;
  
  if (selectedShape) {
    if (keyCode === LEFT_ARROW) selectedShape.rotation -= PI/16;
    if (keyCode === RIGHT_ARROW) selectedShape.rotation += PI/16;
  }
}

function addShape(type) {
  if (isCapturingMode) return;
  
  // Add shape at mouse position or random position
  const x = mouseX || random(100, CANVAS_SIZE_W - 100);
  const y = mouseY || random(100, CANVAS_SIZE_H - 100);
  shapes.push(new Shape(type, x, y));
}

// Save current arrangement as a training example
function saveTrainingExample() {
  if (isCapturingMode) return;
  
  // Check if we have shapes
  if (shapes.length === 0) {
    console.log("No shapes to save");
    return;
  }
  
  // Sort shapes (squares first, then triangles)
  const sortedShapes = [...shapes].sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === 'square' ? -1 : 1;
  });
  
  // Generate target outputs: [x, y, rotation] for each shape
  const outputs = [];
  
  sortedShapes.forEach(shape => {
    // Normalize coordinates to 0-1 range
    // outputs.push(shape.x / CANVAS_SIZE_W);
    console.log(shape.x/64 )
    console.log(shape.x / CANVAS_SIZE_W)
    console.log(shape.x / GRID_SIZE_W)
    
    // console.log(CANVAS_SIZE_W)
    // console.log(GRID_SIZE_W)
    // outputs.push(shape.y / CANVAS_SIZE_H);
    // In training
outputs.push(shape.x / (CANVAS_SIZE_W / GRID_SIZE_W) / GRID_SIZE_W);  // Convert to grid cell and normalize
outputs.push(shape.y / (CANVAS_SIZE_H / GRID_SIZE_H) / GRID_SIZE_H);

    outputs.push(shape.rotation / (2 * PI));  // Normalize rotation to 0-1
  });
  
  // Pad outputs with zeros to ensure fixed length
  while (outputs.length < MAX_SHAPES * 3) {
    outputs.push(0);
  }
  
  // Add check for data variance
  const hasVariance = downsampledMaskArray.some(v => v > 0.1) && downsampledMaskArray.some(v => v < 0.9);
  if (!hasVariance) {
    console.log("Warning: Mask lacks variation, learning may be difficult, adding variation");
  }
  // Add to neural network
  // nn.addData(downsampledMaskArray, outputs);
  // Add slightly modified versions of the same example
//   for (let i = 0; i < 3; i++) {
//     const noisyMask = downsampledMaskArray.map(v => 
//       Math.min(1, Math.max(0, v + (Math.random() * 0.1 - 0.05)))
//     );
    
//     // Add slightly modified shape positions (±5% variation)
//     const modifiedOutputs = [...outputs];
//     for (let j = 0; j < modifiedOutputs.length; j++) {
//       if (modifiedOutputs[j] > 0) {
//         modifiedOutputs[j] = Math.min(1, Math.max(0, 
//           modifiedOutputs[j] + (Math.random() * 0.1 - 0.05)
//         ));
//       }
//     }
    
//     nn.addData(noisyMask, modifiedOutputs);
//   }
  // nn.addData(downsampledMaskArray, modifiedOutputs);
  nn.addData(downsampledMaskArray, outputs);
  
  // Also save locally for reference
  trainingData.push({
    mask: [...downsampledMaskArray], // Create a copy
    shapes: sortedShapes.map(s => ({
      type: s.type,
      x: s.x,
      y: s.y,
      rotation: s.rotation
    }))
  });
  
  console.log(`Added training example #${trainingData.length}`);
  console.log(`- Shapes: ${sortedShapes.filter(s => s.type === 'square').length} squares, ${sortedShapes.filter(s => s.type === 'triangle').length} triangles`);
  
  // Take a snapshot of the current training example
  // saveCanvas(`example-${trainingData.length}`, 'png');
  
  // Clear shapes
  shapes = [];
  
  // IMPORTANT: Clear the mask arrays
  downsampledMaskArray = [];
  downsampledMaskActualAlphaArray = [];
  
  // Clear the segmentation mask
  segmentationMask.clear();
  segmentationMask.background(0);
  
  // Reset to capturing mode
  isCapturingMode = true;
  
  // Properly handle the detection cycle
  setTimeout(() => {
    // Make sure the previous detection is fully stopped
    bodySegmentation.detectStop();
    
    // Wait a short moment before starting a new detection
    setTimeout(() => {
      // Start a new detection
      bodySegmentation.detectStart(video, gotSegmentation);
    }, 100);
  }, 100);
}
function trainModel() {
  if (trainingData.length < 3) {
    console.log("Need at least 3 training examples");
    return;
  }
  
  console.log(`Training model on ${trainingData.length} examples...`);
  
  // Stop segmentation if it's running
  bodySegmentation.detectStop();
  isCapturingMode = false;
  
  // Normalize the data
  nn.normalizeData();
  
  // Configure training parameters with more epochs for better learning
  // const trainingOptions = {
  //   epochs: 300,
  //   batchSize: 1,
  // };
  // const trainingOptions = {
  //   epochs: 500,
  //   batchSize: 8,
  //   learningRate: 0.01
  // };
  const trainingOptions = {
    epochs: 65,
    batchSize: 4,  // Smaller batch size
    learningRate: 0.5
  };
  
  // Start training with loss object handling
  nn.train(
    trainingOptions,
    (epoch, loss) => {
      console.log(`Epoch ${epoch}: loss =`, loss);
      
      // Handle loss being an object rather than a number
      let lossValue = typeof loss === 'object' ? 
                     (loss.loss || loss.totalLoss || Object.values(loss)[0]) : 
                     loss;
      
      if (typeof lossValue !== 'number') {
        console.log("Loss is not a number:", lossValue);
        lossValue = 0; // Fallback
      }
      
      // // Update UI during training
      // background(240);
      // fill(0);
      // textSize(20);
      // textAlign(CENTER);
      // text(`Training: Epoch ${epoch} / 300, Loss: ${lossValue.toFixed ? lossValue.toFixed(4) : lossValue}`, width/2, height/2);
    },
    () => {
      console.log("Training finished!");
      // Save the model
      nn.save("model");
      
//       // Reset to capturing mode for new examples
//       isCapturingMode = true;
      
//       // Properly restart detection
//       setTimeout(() => {
//         bodySegmentation.detectStart(video, gotSegmentation);
//       }, 100);
    }
  );
}