let nn;
let boundaryMask;
let shapes = [];
let numSquares = 2;
let numTriangles = 2;
let modelLoadedB = false;

const SHAPE_SIZE = 50;
const CANVAS_SIZE = 800;
const GRID_SIZE = 16;
const MAX_SHAPES = 10;
const MAX_CONNECTIONS = 20;

let tempDrawing;


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
    this.attachmentPoints.forEach((point, i) => {
      if (this.connections.has(i)) {
        fill(0, 0, 255); // Connected points in blue
      } else {
        fill(0, 255, 0); // Unconnected points in green
      }
      circle(point.x, point.y, 8);
    });
    
    pop();
  }
}

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  boundaryMask = createGraphics(CANVAS_SIZE, CANVAS_SIZE);
  boundaryMask.background(0);
  
  // Set backend to webgl
  ml5.setBackend('webgl');
  
  
  // Set up the neural network
  let options = {
    task: "regression",
  };
  nn = ml5.neuralNetwork(options);

  const modelDetails = {
    model: "./model/model.json",
    metadata: "./model/model_meta.json",
    weights: "./model/model.weights.bin",
  };

  nn.load(modelDetails, modelLoaded);
  
  // Create UI elements
  createButton('Generate').position(100, CANVAS_SIZE + 10).mousePressed(generate);
  createButton('Clear Boundary').position(180, CANVAS_SIZE + 10).mousePressed(() => boundaryMask.background(0));
  
  createElement('label', 'Squares:').position(300, CANVAS_SIZE + 10);
  createInput(numSquares.toString(), 'number')
    .position(360, CANVAS_SIZE + 10)
    .input(e => numSquares = parseInt(e.target.value));
  
  createElement('label', 'Triangles:').position(420, CANVAS_SIZE + 10);
  createInput(numTriangles.toString(), 'number')
    .position(480, CANVAS_SIZE + 10)
    .input(e => numTriangles = parseInt(e.target.value));
  
  
}
// ... (previous code up to generate function remains the same)

function generate() {
  if (!modelLoadedB) {
    alert('Please load the model first');
    return;
  }
  
  // Convert boundary mask to grid
  let maskGrid = [];
  boundaryMask.loadPixels();
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const px = Math.floor(x * CANVAS_SIZE/GRID_SIZE);
      const py = Math.floor(y * CANVAS_SIZE/GRID_SIZE);
      const index = 4 * (py * CANVAS_SIZE + px);
      maskGrid.push(boundaryMask.pixels[index] > 128 ? 1 : 0);
    }
  }
  
  const inputs = [...maskGrid, numSquares, numTriangles];
  console.log('Making prediction with inputs:', inputs);
  
  nn.predict(inputs, handlePrediction);
}

function handlePrediction(error, results) {
  const predictionResults = error;
  
  // Clear existing shapes
  shapes = [];
  
  // Create shapes
  const totalShapes = numSquares + numTriangles;
  console.log(`Creating ${numSquares} squares and ${numTriangles} triangles`);
  
  // Create all shapes
  for (let i = 0; i < numSquares; i++) {
    shapes.push(new Shape('square', 0, 0));
  }
  for (let i = 0; i < numTriangles; i++) {
    shapes.push(new Shape('triangle', 0, 0));
  }
  
  // Position shapes
  shapes.forEach((shape, i) => {
    const base = i * 3;
    if (base + 2 < predictionResults.length) {
      // Use the normalized value (between 0-1)
      const x = predictionResults[base].value;
      const y = predictionResults[base + 1].value;
      const rot = predictionResults[base + 2].value;
      
      console.log(`Raw values for shape ${i}: x=${x}, y=${y}, rot=${rot}`);
      
      // Convert to canvas coordinates
      shape.x = x * CANVAS_SIZE;
      shape.y = y * CANVAS_SIZE;
      shape.rotation = rot * TWO_PI;
      
      console.log(`Canvas coordinates for shape ${i}: x=${shape.x}, y=${shape.y}, rot=${shape.rotation}`);
    }
  });
}

function draw() {
  background(255);
  image(boundaryMask, 0, 0);
  
  // Draw boundary points for debugging
  push();
  noFill();
  stroke(255, 0, 0);
  for (let shape of shapes) {
    ellipse(shape.x, shape.y, 5, 5);
  }
  pop();
  
  // Draw shapes
  for (let shape of shapes) {
    shape.draw();
  }
  
  // Draw boundary mask
  if (mouseIsPressed && keyIsPressed && key === 'b') {
    boundaryMask.stroke(255);
    boundaryMask.strokeWeight(4);
    boundaryMask.line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

function gotResults(error, results) {
  if (error) {
    console.error('Error in gotResults:', error);
    return;
  }
  
  console.log('Starting gotResults');
  console.log('Number of results:', results.length);
  
  // Clear existing shapes
  shapes = [];
  
  // Create shapes
  for (let i = 0; i < numSquares; i++) {
    shapes.push(new Shape('square', CANVAS_SIZE/2, CANVAS_SIZE/2)); // Start in center
  }
  for (let i = 0; i < numTriangles; i++) {
    shapes.push(new Shape('triangle', CANVAS_SIZE/2, CANVAS_SIZE/2)); // Start in center
  }
  
  console.log('Created shapes:', shapes.length);
  
  // Update positions
  shapes.forEach((shape, i) => {
    const base = i * 3;
    if (base + 2 < results.length) {
      console.log(`Processing shape ${i}:`);
      console.log(`Base results:`, results[base], results[base+1], results[base+2]);
      
      shape.x = results[base].value * CANVAS_SIZE;
      shape.y = results[base + 1].value * CANVAS_SIZE;
      shape.rotation = results[base + 2].value * TWO_PI;
      
      console.log(`Final position: x=${shape.x}, y=${shape.y}, rot=${shape.rotation}`);
    }
  });
  
  console.log('Final shapes array:', shapes);
}


// Callback function for when the pre-trained model is loaded
function modelLoaded() {
    console.log('Model loaded!');

  modelLoadedB = true;
}