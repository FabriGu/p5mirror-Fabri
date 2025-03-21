let flowerField = [];
const maxStackRadius = 250; // Maximum possible radius for any stack
const spacing = maxStackRadius * 2.2; // Space between stack centers with some padding

class Layer {
  constructor(index, baseRadius) {
    this.points = [];
    this.index = index;
    this.zOffset = index * 31 - (5 * 30); // Keeping 5 layers per stack
    this.hue = (index * 15) % 360;
    this.rotationSpeed = random(0.001, 0.01) * (random() > 0.5 ? 1 : -1);
    this.symmetry = floor(random(3, 9));
    this.baseRadius = baseRadius;
    
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
    // Individual layer rotation around z-axis
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
  }
}

class LayerStack {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.layers = [];
    this.baseRadius = random(30, 100);
    
    // Initialize layers for this stack
    for (let i = 0; i < 5; i++) {
      this.layers.push(new Layer(i, this.baseRadius));
    }
  }
  
  display() {
    push();
    translate(this.x, this.y, 0);
    
    // Draw all layers in the stack
    for (let layer of this.layers) {
      push();
      translate(0, 0, layer.zOffset);
      layer.display();
      pop();
    }
    
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 1.0);
  
  // Calculate number of stacks needed to fill the screen
  const cols = ceil(windowWidth / spacing);
  const rows = ceil(windowHeight / spacing);
  
  // Center offset to place the field in the middle of the screen
  const offsetX = -((cols - 1) * spacing) / 2;
  const offsetY = -((rows - 1) * spacing) / 2;
  
  // Create grid of layer stacks
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Add some randomness to positions for more natural look
      let xPos = offsetX + col * spacing + random(-20, 20);
      let yPos = offsetY + row * spacing + random(-20, 20);
      flowerField.push(new LayerStack(xPos, yPos));
    }
  }
}

function draw() {
  background(0);
  orbitControl(4, 4);
  
  // Basic lighting setup
  ambientLight(200);
  specularMaterial(255);
  
  // Draw all stacks in the field
  for (let stack of flowerField) {
    stack.display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recreate the field for new window size
  flowerField = [];
  setup();
}