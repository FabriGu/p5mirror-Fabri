// Constants for the application
const CANVAS_SIZE = 800;
const SHAPE_SIZE = 50;
const GRID_SIZE = 32; // Size of downsampled grid (32x32)
const MAX_SHAPES = 20; // 2 squares and 2 triangles
const ATTACHMENT_DISTANCE = 15;

// Global variables
let shapes = [];
let segmentationMask;
let nn;
let isTraining = false;
let trainingData = [];
let selectedShape = null;

// Shape class to handle drawing and connections
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
    } else {
      stroke(0);
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
    const transformedPoints = this.getTransformedPoints();
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
      return abs(rotX) < SHAPE_SIZE/2 && 
             rotY > -SHAPE_SIZE/2 && 
             rotY < SHAPE_SIZE/2;
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

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  segmentationMask = createGraphics(CANVAS_SIZE, CANVAS_SIZE);
  segmentationMask.background(0);
  
  // Set the WebGL backend for better performance
  ml5.setBackend("webgl");
  
  // Create neural network for regression
  const options = {
    task: 'regression',
    debug: true,
    inputs: GRID_SIZE * GRID_SIZE,  // Downsampled mask (32x32 grid)
    outputs: MAX_SHAPES * 3,        // [x, y, rotation] for each shape
    learningRate: 0.05,
    // hiddenUnits: 64
  };
  
  nn = ml5.neuralNetwork(options);
  
  // Setup UI
  setupUI();
}

function setupUI() {
  const buttonY = CANVAS_SIZE + 10;
  
  // Create UI buttons
  createButton('Add Square [s]').position(10, buttonY).mousePressed(() => addShape('square'));
  createButton('Add Triangle [t]').position(120, buttonY).mousePressed(() => addShape('triangle'));
  createButton('Clear [c]').position(230, buttonY).mousePressed(clearCanvas);
  createButton('Save Example [d]').position(300, buttonY).mousePressed(saveTrainingData);
  createButton('Train Model [m]').position(420, buttonY).mousePressed(trainModel);
  createButton('Generate [g]').position(530, buttonY).mousePressed(generateShapes);
  
  // Add status text
  createP('Draw segmentation mask with mouse + "b" key. Add and arrange shapes, then save examples.').position(10, CANVAS_SIZE + 50);
}

function draw() {
  background(240);
  
  // Show segmentation mask with transparency
  tint(255, 130);
  image(segmentationMask, 0, 0);
  noTint();
  
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
        line(fromPoints[fromIdx].x, fromPoints[fromIdx].y, 
             toPoints[conn.pointIndex].x, toPoints[conn.pointIndex].y);
      }
    }
  }
  
  // Handle shape dragging
  if (selectedShape) {
    selectedShape.x = mouseX;
    selectedShape.y = mouseY;
  }
  
  // Draw segmentation brush
  if (mouseIsPressed && keyIsPressed && key === 'b') {
    segmentationMask.fill(255);
    segmentationMask.noStroke();
    segmentationMask.circle(mouseX, mouseY, 60);
  }
  
  // Display status
  fill(0);
  textSize(14);
  text(`Shapes: ${shapes.length} | Training Examples: ${trainingData.length}`, 10, 20);
  if (isTraining) {
    fill(255, 0, 0);
    text("Training in progress...", CANVAS_SIZE/2, 20);
  }
}

function mousePressed() {
  if (keyIsPressed && key === 'b') return;
  
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
  if (selectedShape) {
    selectedShape.tryConnect();
    selectedShape = null;
  }
}

function keyPressed() {
  if (key === 's') addShape('square');
  if (key === 't') addShape('triangle');
  if (key === 'c') clearCanvas();
  if (key === 'd') saveTrainingData();
  if (key === 'm') trainModel();
  if (key === 'g') generateShapes();
  
  if (selectedShape) {
    if (keyCode === LEFT_ARROW) selectedShape.rotation -= PI/16;
    if (keyCode === RIGHT_ARROW) selectedShape.rotation += PI/16;
  }
}

function addShape(type) {
  // Add shape at mouse position or random position
  const x = mouseX || random(100, CANVAS_SIZE - 100);
  const y = mouseY || random(100, CANVAS_SIZE - 100);
  shapes.push(new Shape(type, x, y));
}

function clearCanvas() {
  shapes = [];
  segmentationMask.background(0);
}

// Downsample the mask image to a grid of specified size
function downsampleMask(maskImageData) {
  // Access the segmentation mask pixels
  segmentationMask.loadPixels();
  const pixels = segmentationMask.pixels;
  
  // Create a downsampled grid representation
  const cellWidth = CANVAS_SIZE / GRID_SIZE;
  const cellHeight = CANVAS_SIZE / GRID_SIZE;
  const grid = [];
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      // Calculate cell region
      const startX = Math.floor(x * cellWidth);
      const startY = Math.floor(y * cellHeight);
      const endX = Math.floor((x + 1) * cellWidth);
      const endY = Math.floor((y + 1) * cellHeight);
      
      // Count white pixels in this region
      let count = 0;
      let total = 0;
      
      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          if (px < CANVAS_SIZE && py < CANVAS_SIZE) {
            const idx = 4 * (py * CANVAS_SIZE + px);
            // Check if pixel is white (using red channel)
            if (pixels[idx] > 128) {
              count++;
            }
            total++;
          }
        }
      }
      
      // Normalize to 0-1 range
      const value = total > 0 ? count / total : 0;
      grid.push(value);
    }
  }
  
  return grid;
}

// Save current scene as training data
function saveTrainingData() {
  // Check if we have both mask and shapes
  if (shapes.length === 0) {
    console.log("No shapes to save");
    return;
  }
  
  // Get downsampled mask
  const downsampledMask = downsampleMask();
  
  // Check if mask has content
  if (!downsampledMask.some(v => v > 0)) {
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
    outputs.push(shape.x / CANVAS_SIZE);  
    outputs.push(shape.y / CANVAS_SIZE);
    outputs.push(shape.rotation / (2 * PI));  // Normalize rotation to 0-1
  });
  
  // Pad outputs with zeros to ensure fixed length
  while (outputs.length < MAX_SHAPES * 3) {
    outputs.push(0);
  }
  
  // Add to neural network
  nn.addData(downsampledMask, outputs);
  
  // Also save locally for reference
  trainingData.push({
    mask: downsampledMask,
    shapes: sortedShapes.map(s => ({
      type: s.type,
      x: s.x,
      y: s.y,
      rotation: s.rotation
    }))
  });
  
  console.log(`Added training example #${trainingData.length}`);
  console.log(`- Shapes: ${sortedShapes.filter(s => s.type === 'square').length} squares, ${sortedShapes.filter(s => s.type === 'triangle').length} triangles`);
  console.log(`- Mask: ${downsampledMask.filter(v => v > 0).length} active cells out of ${downsampledMask.length}`);
}

// Train the neural network on collected examples
function trainModel() {
  if (trainingData.length < 5) {
    console.log("Need at least 5 training examples");
    return;
  }
  
  isTraining = true;
  console.log(`Training model on ${trainingData.length} examples...`);
  
  // Normalize the data
  nn.normalizeData();
  
  // Configure training parameters
  const trainingOptions = {
    epochs: 300,
    batchSize: 5
  };
  
  // Start training
  nn.train(
    trainingOptions,
    (epoch, loss) => {
      console.log(`Epoch ${epoch}: loss = ${loss}`);
    },
    () => {
      console.log("Training finished!");
      isTraining = false;
      // Save the model
      nn.save("shape-placement-model");
    }
  );
}

// Generate shapes based on current mask
function generateShapes() {
  // Check if mask has content
  const downsampledMask = downsampleMask();
  if (!downsampledMask.some(v => v > 0)) {
    console.log("Mask is empty, cannot generate shapes");
    return;
  }
  
  // Predict shape placements
  nn.predict(downsampledMask, (error, results) => {
    if (error) {
      console.error("Prediction error:", error);
      return;
    }
    
    // Clear existing shapes
    shapes = [];
    
    // Create new shapes from predicted values
    // Start with 2 squares
    for (let i = 0; i < 2; i++) {
      const xIndex = i * 3;
      const yIndex = i * 3 + 1;
      const rotIndex = i * 3 + 2;
      
      // Skip if position is near zero (likely padding)
      if (results[xIndex].value < 0.01 && results[yIndex].value < 0.01) continue;
      
      const shape = new Shape(
        'square',
        results[xIndex].value * CANVAS_SIZE,
        results[yIndex].value * CANVAS_SIZE
      );
      shape.rotation = results[rotIndex].value * (2 * PI);
      shapes.push(shape);
    }
    
    // Then 2 triangles
    for (let i = 2; i < 4; i++) {
      const xIndex = i * 3;
      const yIndex = i * 3 + 1;
      const rotIndex = i * 3 + 2;
      
      // Skip if position is near zero (likely padding)
      if (results[xIndex].value < 0.01 && results[yIndex].value < 0.01) continue;
      
      const shape = new Shape(
        'triangle',
        results[xIndex].value * CANVAS_SIZE,
        results[yIndex].value * CANVAS_SIZE
      );
      shape.rotation = results[rotIndex].value * (2 * PI);
      shapes.push(shape);
    }
    
    // Attempt to connect shapes
    for (let shape of shapes) {
      shape.tryConnect();
    }
    
    console.log(`Generated ${shapes.length} shapes`);
  });
}

// For compatibility with segmentation API output
function processBodySegmentation(segmentationResult) {
  // Clear previous mask
  segmentationMask.background(0);
  
  // Draw the segmentation mask to our graphics buffer
  if (segmentationResult && segmentationResult.mask) {
    segmentationMask.image(segmentationResult.mask, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }
}