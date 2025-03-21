let shapes = [];
let segmentationMask;
let selectedShape = null;
let nn;

const SHAPE_SIZE = 50;
const CANVAS_SIZE = 800;
const GRID_SIZE = 32;
const ATTACHMENT_DISTANCE = 15;
const MAX_SHAPES = 10;
const MAX_CONNECTIONS = 20;
const ROTATION_SNAP = Math.PI/16;

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
    
    for (let rotOffset = -PI/4; rotOffset <= PI/4; rotOffset += ROTATION_SNAP) {
      const testRotation = this.rotation + rotOffset;
      const testConnections = new Map();
      let maxDistance = 0;
      
      const testPoints = this.attachmentPoints.map(point => {
        const cos = Math.cos(testRotation);
        const sin = Math.sin(testRotation);
        return {
          x: this.x + (point.x * cos - point.y * sin),
          y: this.y + (point.x * sin + point.y * cos)
        };
      });
      
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
      
      if (testConnections.size > 0 && maxDistance < minDistance) {
        minDistance = maxDistance;
        bestRotation = testRotation;
        bestConnections = testConnections;
      }
    }
    
    if (bestConnections.size > 0) {
      this.rotation = bestRotation;
      this.connections = bestConnections;
      
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
  
  ml5.setBackend("webgl");
  
  // Network designed for body segmentation mask
  const options = {
    task: 'regression',
    debug: true,
    inputs: GRID_SIZE * GRID_SIZE,  // Downsampled segmentation mask
    outputs: MAX_SHAPES * 3,        // Position and rotation of shapes
  };
  
  nn = ml5.neuralNetwork(options);
}

function draw() {
  background(255);
  tint(255, 127);  // Show mask semi-transparent
  image(segmentationMask, 0, 0);
  noTint();
  
  for (let shape of shapes) {
    shape.draw();
  }
  
  if (selectedShape) {
    selectedShape.x = mouseX;
    selectedShape.y = mouseY;
  }
  
  // Draw segmentation area
  if (mouseIsPressed && keyIsPressed && key === 'b') {
    segmentationMask.fill(255);
    segmentationMask.noStroke();
    segmentationMask.circle(mouseX, mouseY, 30);
  }
}

function mousePressed() {
  if (keyIsPressed && key === 'b') return;
  
  selectedShape = null;
  for (let shape of shapes) {
    if (shape.contains(mouseX, mouseY)) {
      selectedShape = shape;
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
  if (key === 's') shapes.push(new Shape('square', mouseX, mouseY));
  if (key === 't') shapes.push(new Shape('triangle', mouseX, mouseY));
  if (key === 'd') saveTrainingData();
  if (key === 'm') trainModel();
  if (key === 'c') segmentationMask.background(0);
  
  if (selectedShape) {
    if (keyCode === LEFT_ARROW) selectedShape.rotation -= PI/16;
    if (keyCode === RIGHT_ARROW) selectedShape.rotation += PI/16;
  }
}

function saveTrainingData() {
  // Process segmentation mask image
  segmentationMask.loadPixels();
  
  // Downsample to grid
  let maskGrid = [];
  const cellWidth = CANVAS_SIZE / GRID_SIZE;
  const cellHeight = CANVAS_SIZE / GRID_SIZE;
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      // Sample center of each grid cell
      const px = Math.floor(x * cellWidth + cellWidth/2);
      const py = Math.floor(y * cellHeight + cellHeight/2);
      const index = 4 * (py * CANVAS_SIZE + px);
      
      // In a real segmentation mask, white (255) represents the foreground/body
      // and black (0) is the background
      maskGrid.push(segmentationMask.pixels[index] > 128 ? 1 : 0);
    }
  }
  
  // Verify we have a valid mask
  const hasBody = maskGrid.some(pixel => pixel === 1);
  if (!hasBody || shapes.length === 0) {
    console.log('Need both body mask and shapes to save training data');
    return;
  }
  
  // Create outputs - shape positions and rotations
  const outputs = [];
  shapes.forEach(shape => {
    // Normalize coordinates to 0-1 range
    outputs.push(shape.x / CANVAS_SIZE);
    outputs.push(shape.y / CANVAS_SIZE);
    outputs.push(shape.rotation / (2 * PI));
  });
  
  // Pad outputs to fixed length
  while (outputs.length < MAX_SHAPES * 3) {
    outputs.push(0);
  }
  
  // Add training example
  nn.addData(maskGrid, outputs);
  console.log('Added training example with:', 
              shapes.filter(s => s.type === 'square').length, 'squares,',
              shapes.filter(s => s.type === 'triangle').length, 'triangles');
}

// Function to handle segmentation mask from bodySegmentation API
function processSegmentationMask(segmentationResult) {
  // Clear previous mask
  segmentationMask.background(0);
  
  // Draw the segmentation mask to our graphics buffer
  segmentationMask.image(segmentationResult.mask, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  
  // Now our segmentationMask contains the body segmentation
  // and can be used for training or prediction
}


function trainModel() {
  console.log('Starting training...');
  nn.normalizeData();
  
  nn.train({
    epochs: 100,
    batchSize: 16
  }, 
  (epoch, loss) => {
    console.log(`Epoch ${epoch}: loss = ${loss}`);
  }, 
  () => {
    console.log('Training finished');
    nn.save('body_shapes_model');
  });
}