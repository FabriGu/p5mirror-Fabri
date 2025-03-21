let stackSets = [];
const numStacks = 6;  // Number of complete stacks in the arrangement
const numLayers = 6;  // Layers per stack
const stackSpacing = 300;  // Desired spacing between adjacent stacks

// Calculate circle radius based on desired spacing
const circleRadius = (stackSpacing * numStacks) / (2 * Math.PI);

// Create one set of template layers
const templateLayers = [];

class Layer {
  constructor(index) {
    this.points = [];
    this.index = index;
    this.zOffset = index * 31 - (numLayers * 30);
    this.hue = (index * 25) % 360;
    this.rotationSpeed = random(0.001, 0.03) * (random() > 0.5 ? 1 : -1);
    
    this.symmetry = floor(random(3, 9));
    this.baseRadius = random(100, 200);
    
    this.generateSymmetricShape();
  }
  
  generateSymmetricShape() {
    const pointsPerSegment = 8;
    let segmentPoints = [];
    
    for (let i = 0; i <= pointsPerSegment; i++) {
      let angle = (TWO_PI / this.symmetry) * (i / pointsPerSegment);
      
      let radius = this.baseRadius + 
                   sin(angle * 3) * random(20, 40) + 
                   cos(angle * 4) * random(15, 35);
      
      let x = cos(angle) * radius;
      let y = sin(angle) * radius;
      segmentPoints.push({x, y});
    }
    
    for (let i = 0; i < this.symmetry; i++) {
      let rotationAngle = (TWO_PI / this.symmetry) * i;
      
      for (let point of segmentPoints) {
        let rotatedX = point.x * cos(rotationAngle) - point.y * sin(rotationAngle);
        let rotatedY = point.x * sin(rotationAngle) + point.y * cos(rotationAngle);
        this.points.push({x: rotatedX, y: rotatedY});
      }
    }
  }
  
  display() {
    push();
    translate(0, 0, this.zOffset);
    
    rotateZ(frameCount * this.rotationSpeed);
    
    let opacity = map(sin(frameCount * 0.02 + this.index), -1, 1, 0.2, 0.6);
    fill(this.hue, 70, 80, opacity);
    noStroke();
    
    const depth = -30;
    
    // Draw front face
    beginShape();
    for (let point of this.points) {
      vertex(point.x, point.y, 0);
    }
    endShape(CLOSE);
    
    // Draw back face
    beginShape();
    for (let point of this.points) {
      vertex(point.x, point.y, depth);
    }
    endShape(CLOSE);
    
    // Draw outer walls
    beginShape(TRIANGLE_STRIP);
    for (let i = 0; i <= this.points.length; i++) {
      let point = this.points[i % this.points.length];
      vertex(point.x, point.y, 0);
      vertex(point.x, point.y, depth);
    }
    endShape(CLOSE);
    
    pop();
  }
}

class StackSet {
  constructor(index) {
    this.index = index;
    this.angle = (TWO_PI / numStacks) * index;
  }
  
  display() {
    push();
    // First rotate to the correct position in the circle
    rotateY(this.angle);
    // Move out to the circle radius
    translate(0, 0, circleRadius);
    // Rotate the stack to face outward
    rotateY(PI);
    
    // Display using the template layers
    for (let layer of templateLayers) {
      layer.display();
    }
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 1.0);
  
  // Generate one set of template layers first
  for (let i = 0; i < numLayers; i++) {
    templateLayers.push(new Layer(i));
  }
  
  // Initialize stacks in a circular arrangement, each using the template layers
  for (let i = 0; i < numStacks; i++) {
    stackSets.push(new StackSet(i));
  }
}

function draw() {
  // background(0);
  orbitControl(4, 4);
  
  // Basic lighting setup
  ambientLight(200);
  specularMaterial(255);
  
  // Draw all stacks
  for (let stack of stackSets) {
    stack.display();
  }
}