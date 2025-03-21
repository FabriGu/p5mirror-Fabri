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
const MAX_SHAPES = 4; // 2 squares and 2 triangles
const ATTACHMENT_DISTANCE = 15;

// Options for body segmentation
const segmentationOptions = {
  maskType: "person", // Person mask (separates person from background)
};

// Shape class for creating and managing shapes
class Shape {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.connections = new Map();
    
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
    
    if (this === selectedShape) {
      stroke(255, 0, 0);
      strokeWeight(3);
    } else {
      stroke(0);
      strokeWeight(2);
    }
    
    fill(200);
    
    if (this.type === 'square') {
      rectMode(CENTER);
      rect(0, 0, SHAPE_SIZE, SHAPE_SIZE);
    } else if (this.type === 'triangle') {
      triangle(0, -SHAPE_SIZE/2, 
              SHAPE_SIZE/2, SHAPE_SIZE/2, 
              -SHAPE_SIZE/2, SHAPE_SIZE/2);
    }
    
    // Draw attachment points
    for (let i = 0; i < this.attachmentPoints.length; i++) {
      if (this.connections.has(i)) {
        fill(0, 0, 255); // Connected points in blue
      } else {
        fill(0, 255, 0); // Unconnected points in green
      }
      circle(this.attachmentPoints[i].x, this.attachmentPoints[i].y, 8);
    }
    
    pop();
  }
  
  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    const rotX = dx * cos - dy * sin;
    const rotY = dx * sin + dy * cos;
    
    if (this.type === 'square') {
      return abs(rotX) < SHAPE_SIZE/2 && abs(rotY) < SHAPE_SIZE/2;
    } else if (this.type === 'triangle') {
      if (rotY > SHAPE_SIZE/2 || rotY < -SHAPE_SIZE/2) return false;
      const halfBase = SHAPE_SIZE/2 * (1 - rotY/SHAPE_SIZE);
      return abs(rotX) < halfBase;
    }
    return false;
  }
  
  disconnectAll() {
    this.connections.clear();
    for (let shape of shapes) {
      if (shape === this) continue;
      for (let [pointIndex, connections] of shape.connections) {
        shape.connections.set(pointIndex, 
          connections.filter(conn => conn.shape !== this));
        if (shape.connections.get(pointIndex).length === 0) {
          shape.connections.delete(pointIndex);
        }
      }
    }
  }
  
  tryConnect() {
    const selectedPoints = this.getTransformedPoints();
    let bestRotation = this.rotation;
    let minDistance = Infinity;
    let bestConnections = new Map();
    
    // Try rotations in small increments
    for (let rotOffset = -PI/4; rotOffset <= PI/4; rotOffset += PI/16) {
      const testRotation = this.rotation + rotOffset;
      const testConnections = new Map();
      let maxDistance = 0;
      
      // Get points at this test rotation
      const testPoints = this.attachmentPoints.map(point => {
        const cos = Math.cos(testRotation);
        const sin = Math.sin(testRotation);
        return {
          x: this.x + (point.x * cos - point.y * sin),
          y: this.y + (point.x * sin + point.y * cos)
        };
      });
      
      // Look for potential connections to other shapes
      for (let shape of shapes) {
        if (shape === this) continue;
        const otherPoints = shape.getTransformedPoints();
        
        for (let i = 0; i < testPoints.length; i++) {
          for (let j = 0; j < otherPoints.length; j++) {
            const d = dist(testPoints[i].x, testPoints[i].y,
                         otherPoints[j].x, otherPoints[j].y);
            
            if (d < ATTACHMENT_DISTANCE) {
              if (!testConnections.has(i)) {
                testConnections.set(i, []);
              }
              testConnections.get(i).push({shape, pointIndex: j});
              maxDistance = max(maxDistance, d);
            }
          }
        }
      }
      
      // Keep track of the best rotation (with most connections and smallest distances)
      if (testConnections.size > 0 && maxDistance < minDistance) {
        minDistance = maxDistance;
        bestRotation = testRotation;
        bestConnections = testConnections;
      }
    }
    
    // Apply the best rotation and connections
    if (bestConnections.size > 0) {
      this.rotation = bestRotation;
      this.connections = bestConnections;
      
      // Adjust position to align attachment points
      let totalDx = 0;
      let totalDy = 0;
      let count = 0;
      
      const finalPoints = this.getTransformedPoints();
      for (let [pointIndex, connections] of bestConnections) {
        for (let conn of connections) {
          const otherPoints = conn.shape.getTransformedPoints();
          const dx = otherPoints[conn.pointIndex].x - finalPoints[pointIndex].x;
          const dy = otherPoints[conn.pointIndex].y - finalPoints[pointIndex].y;
          totalDx += dx;
          totalDy += dy;
          count++;
        }
      }
      
      if (count > 0) {
        this.x += totalDx / count;
        this.y += totalDy / count;
      }
      
      // Also add connections to the other shapes
      for (let [pointIndex, connections] of bestConnections) {
        for (let conn of connections) {
          if (!conn.shape.connections.has(conn.pointIndex)) {
            conn.shape.connections.set(conn.pointIndex, []);
          }
          conn.shape.connections.get(conn.pointIndex).push({
            shape: this,
            pointIndex: pointIndex
          });
        }
      }
    }
  }
}

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
  
  // Create neural network for regression
  const options = {
    task: 'regression',
    debug: true,
    inputs: GRID_SIZE_W * GRID_SIZE_H,  // Downsampled mask with correct dimensions
    outputs: MAX_SHAPES * 3,            // [x, y, rotation] for each shape
    learningRate: 0.1,
    hiddenUnits: 64
  };
  
  nn = ml5.neuralNetwork(options);
  
  // Start body segmentation in detection mode
  bodySegmentation.detectStart(video, gotSegmentation);
  
  // Create UI controls
  createUI();
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

// Draw the downsampled mask directly using the array values
function drawDownsampledMask() {
  noStroke();
  
  const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
  
  
//   for (let y = 0; y < GRID_SIZE_H; y++) {
//     for (let x = 0; x < GRID_SIZE_W; x++) {
//       const index = y * GRID_SIZE_W + x;
//       const value = downsampledMaskArray[index] || 0;
      
//       // Use pure black or white (no grayscale)
//       if (value > 0.5) {
//         fill(255); // White for person
//       } else {
//         fill(0);   // Black for background
//       }
      
//       rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
//     }
//   }
  
  // Loop through the image in 2-dimensions
  let i = 0;
  for(let x = 0; x < CANVAS_SIZE_W; x+=cellWidth) {
    for(let y = 0; y < CANVAS_SIZE_H; y+=cellHeight) {
      
      // This is too slow
      //let c = cam.get(x,y);
      
      // Calculate the index number of the r-value of the pixel at x,y
      // let i = (y*width + x)*4;
      let a = downsampledMaskActualAlphaArray[i]
      i++;
      
      // Fill with the rgb values of the pixel at x,y
      if ( a == 255) {
        fill(0,0,0);
      } else {
        fill(255,255,255);
      }
      
      
      // Draw a big rect to represent this pixel 
      rect(x, y, cellWidth, cellHeight);
    }
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
    
    // Create the downsampled version
    const downsampledMaskI = downsampleMask();
    console.log(downsampledMaskI)
    downsampledMaskArray = downsampledMaskI;
    
    // Switch to training mode (placing shapes)
    isCapturingMode = false;
    
    // Stop continuous detection (we just need one snapshot)
    bodySegmentation.detectStop();
  }
}

// Downsample the mask image to a grid with proper aspect ratio
function downsampleMask() {
  // Access the segmentation mask pixels
  segmentationMask.loadPixels();
  const pixels = segmentationMask.pixels;
  // console.log(pixels)
  
  // Create a downsampled grid representation
  let cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  let cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  const grid = [];
  
  
//   for (let y = 0; y < GRID_SIZE_H; y++) {
//     for (let x = 0; x < GRID_SIZE_W; x++) {
//       // Calculate cell region
//       const startX = Math.floor(x * cellWidth);
//       const startY = Math.floor(y * cellHeight);
//       const endX = Math.floor((x + 1) * cellWidth);
//       const endY = Math.floor((y + 1) * cellHeight);
      
//       // Count white pixels in this region
//       let count = 0;
//       let total = 0;
      
//       for (let py = startY; py < endY; py++) {
//         for (let px = startX; px < endX; px++) {
//           if (px < CANVAS_SIZE_W && py < CANVAS_SIZE_H) {
//             const idx = 4 * (py * CANVAS_SIZE_W + px);
//             // Check alpha value (person mask has alpha 255 for person, 0 for background)
//             if (pixels[idx + 3] > 128) {
//               count++;
//             }
//             total++;
//           }
//         }
//       }
      
//       // Binary value (1 or 0) - no grayscale
//       const value = (total > 0 && count / total > 0.5) ? 1 : 0;
//       grid.push(value);
//     }
  
  // }
  
  for(let x = 0; x < CANVAS_SIZE_W; x+=cellWidth) {
    for(let y = 0; y < CANVAS_SIZE_H; y+=cellHeight) {
      
      // Calculate the index number of the r-value of the pixel at x,y
      let i = (y*CANVAS_SIZE_W + x)*4;
      let a = pixels[i + 3];
      downsampledMaskActualAlphaArray.push(a)
      const value = a > 128 ? 1 : 0;
      grid.push(value)
      
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
  
  
//   // Check for any variation in the mask data
//   const hasOnes = downsampledMaskArray.some(v => v === 1);
//   const hasZeros = downsampledMaskArray.some(v => v === 0);
  
//   console.log("Mask data check: hasOnes =", hasOnes, "hasZeros =", hasZeros);
  
//   if (!hasOnes && !hasZeros) {
//     console.log("Mask data is empty or invalid");
//     return;
//   }
  
//   if (!hasOnes || !hasZeros) {
//     console.log("Warning: Mask lacks variation (all ones or all zeros)");
//     // Add artificial variation to prevent normalization errors
//     if (!hasZeros) {
//       // If all 1s, add some 0s at the corners
//       downsampledMaskArray[0] = 0; // Top-left corner
//       downsampledMaskArray[GRID_SIZE_W - 1] = 0; // Top-right
//       downsampledMaskArray[downsampledMaskArray.length - GRID_SIZE_W] = 0; // Bottom-left
//       downsampledMaskArray[downsampledMaskArray.length - 1] = 0; // Bottom-right
//       console.log("Added zeros to prevent normalization issues");
//     } else if (!hasOnes) {
//       // If all 0s, add some 1s in the center
//       const centerIdx = Math.floor((GRID_SIZE_H/2) * GRID_SIZE_W + GRID_SIZE_W/2);
//       downsampledMaskArray[centerIdx] = 1;
//       downsampledMaskArray[centerIdx+1] = 1;
//       downsampledMaskArray[centerIdx+GRID_SIZE_W] = 1;
//       downsampledMaskArray[centerIdx+GRID_SIZE_W+1] = 1;
//       console.log("Added ones to prevent normalization issues");
//     }
//   }
  
  // Check if mask has content
  if (!downsampledMaskArray.some(v => v > 0)) {
    console.log("Mask is empty, cannot save");
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
    outputs.push(shape.x / CANVAS_SIZE_W);  
    outputs.push(shape.y / CANVAS_SIZE_H);
    outputs.push(shape.rotation / (2 * PI));  // Normalize rotation to 0-1
  });
  
  // Pad outputs with zeros to ensure fixed length
  while (outputs.length < MAX_SHAPES * 3) {
    outputs.push(0);
  }
  
  // Add to neural network
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
  /////////
  // Clear shapes
  shapes = [];
  
  // IMPORTANT FIX: Clear the mask arrays too
  downsampledMaskArray = [];
  downsampledMaskActualAlphaArray = [];
  
  // Clear the segmentation maskt
  segmentationMask.clear();
  segmentationMask.background(0);
  
  // Reset to capturing mode
  isCapturingMode = true;
  
  // Restart body segmentation for the next example
  bodySegmentation.detectStart(video, gotSegmentation);
  ///////////
  // Clear shapes and reset to capturing mode
  // shapes = [];
  // isCapturingMode = true;
  
  // Restart body segmentation for the next example
  // bodySegmentation.detectStart(video, gotSegmentation);
}

// Train the neural network on collected examples
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
  
  // Configure training parameters
  const trainingOptions = {
    epochs: 100,
    batchSize: Math.min(16, trainingData.length)
  };
  
  // Start training
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
      
      // Update UI during training
      background(240);
      fill(0);
      textSize(20);
      textAlign(CENTER);
      text(`Training: Epoch ${epoch} / 100, Loss: ${lossValue.toFixed ? lossValue.toFixed(4) : lossValue}`, width/2, height/2);
    },
    () => {
      console.log("Training finished!");
      // Save the model
      nn.save("shape-placement-model");
      
      // Reset to capturing mode for new examples
      isCapturingMode = true;
      bodySegmentation.detectStart(video, gotSegmentation);
    }
  );
}