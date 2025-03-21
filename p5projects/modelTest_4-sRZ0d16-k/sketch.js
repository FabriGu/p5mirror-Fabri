let shapes = [];
let segmentationMask;
let nn;
let modelLoadedB = false;
let numSquares = 2;
let numTriangles = 2;

const SHAPE_SIZE = 50;
const CANVAS_SIZE = 800;
const GRID_SIZE = 32;
const ATTACHMENT_DISTANCE = 15;
const MAX_SHAPES = 10;
const MAX_CONNECTIONS = 20;

class Shape {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.connections = new Map();
    
    if (type === 'square') {
      this.attachmentPoints = [
        {x: -SHAPE_SIZE/2, y: -SHAPE_SIZE/2},
        {x: SHAPE_SIZE/2, y: -SHAPE_SIZE/2},
        {x: SHAPE_SIZE/2, y: SHAPE_SIZE/2},
        {x: -SHAPE_SIZE/2, y: SHAPE_SIZE/2}
      ];
    } else if (type === 'triangle') {
      this.attachmentPoints = [
        {x: 0, y: -SHAPE_SIZE/2},
        {x: SHAPE_SIZE/2, y: SHAPE_SIZE/2},
        {x: -SHAPE_SIZE/2, y: SHAPE_SIZE/2}
      ];
    }
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    stroke(0);
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
}

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  segmentationMask = createGraphics(CANVAS_SIZE, CANVAS_SIZE);
  segmentationMask.background(0);
  
  // Set backend to webgl
  ml5.setBackend('webgl');
  
  // Initialize the neural network
  const options = {
    task: 'regression',
    debug: true
  };
  
  nn = ml5.neuralNetwork(options);
  
  // Load the model
  const modelDetails = {
    model: './model/model.json',
    metadata: './model/model_meta.json',
    weights: './model/model.weights.bin'
  };
  
  nn.load(modelDetails, modelLoaded);
  
  // Create UI elements
  createButton('Generate').position(100, CANVAS_SIZE + 10).mousePressed(generateShapes);
  createButton('Clear Mask').position(180, CANVAS_SIZE + 10).mousePressed(() => segmentationMask.background(0));
  
  createElement('label', 'Squares:').position(300, CANVAS_SIZE + 10);
  createInput(numSquares.toString(), 'number')
    .position(360, CANVAS_SIZE + 10)
    .input(e => numSquares = parseInt(e.target.value));
  
  createElement('label', 'Triangles:').position(420, CANVAS_SIZE + 10);
  createInput(numTriangles.toString(), 'number')
    .position(480, CANVAS_SIZE + 10)
    .input(e => numTriangles = parseInt(e.target.value));
}

function modelLoaded() {
  console.log('Model loaded');
  modelLoadedB = true;
}

function generateShapes() {
  if (!modelLoadedB) {
    alert('Please wait for model to load');
    return;
  }
  
  // Convert mask to grid
  let maskGrid = [];
  segmentationMask.loadPixels();
  const cellSize = CANVAS_SIZE / GRID_SIZE;
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const px = Math.floor(x * cellSize);
      const py = Math.floor(y * cellSize);
      const index = 4 * (py * CANVAS_SIZE + px);
      maskGrid.push(segmentationMask.pixels[index] > 128 ? 1 : 0);
    }
  }
  
  // Create input array
  const inputs = [...maskGrid, numSquares, numTriangles];
  console.log('Generating with inputs:', inputs);
  
  // Get prediction
  nn.predict(inputs, (results) => {
    // results is the first parameter
    if (!results) {
      console.error('No prediction results received');
      return;
    }
    
    console.log('Got prediction results:', results);
    
    // Clear existing shapes
    shapes = [];
    
    // Create new shapes
    for (let i = 0; i < numSquares; i++) {
      const baseIdx = i * 3;
      if (baseIdx + 2 < results.length) {
        const shape = new Shape('square', 
          results[baseIdx].value * CANVAS_SIZE,
          results[baseIdx + 1].value * CANVAS_SIZE
        );
        shape.rotation = results[baseIdx + 2].value * TWO_PI;
        shapes.push(shape);
        console.log(`Created square at (${shape.x}, ${shape.y})`);
      }
    }
    
    for (let i = 0; i < numTriangles; i++) {
      const baseIdx = (numSquares + i) * 3;
      if (baseIdx + 2 < results.length) {
        const shape = new Shape('triangle',
          results[baseIdx].value * CANVAS_SIZE,
          results[baseIdx + 1].value * CANVAS_SIZE
        );
        shape.rotation = results[baseIdx + 2].value * TWO_PI;
        shapes.push(shape);
        console.log(`Created triangle at (${shape.x}, ${shape.y})`);
      }
    }
  });
}

function draw() {
  background(255);
  tint(255, 127);  // Show mask semi-transparent
  image(segmentationMask, 0, 0);
  noTint();
  
  // Draw all shapes
  for (let shape of shapes) {
    shape.draw();
  }
  
  // Draw segmentation area
  if (mouseIsPressed && keyIsPressed && key === 'b') {
    segmentationMask.fill(255);
    segmentationMask.noStroke();
    segmentationMask.circle(mouseX, mouseY, 30);
  }
}