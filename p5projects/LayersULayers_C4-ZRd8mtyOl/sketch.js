let flowerField = [];
const maxStackRadius = 100; // Reduced from 250 to create smaller flowers
const spacing = maxStackRadius * 1.1; // Reduced spacing multiplier for tighter packing

class Layer {
  constructor(index, baseRadius) {
    this.points = [];
    this.index = index;
    this.zOffset = index * 11 - (5 * 30);
    // Adjust hue range to be more poppy-like (reds and slight variations)
this.hue = (index * 15) % 360+200;    this.rotationSpeed = random(0.005, 0.02) * (random() > 0.5 ? 1 : -1);
    this.symmetry = floor(random(5, 11)); // Increased minimum symmetry for more flower-like appearance
    this.baseRadius = baseRadius;
    
    this.generateSymmetricShape();
  }
  
  generateSymmetricShape() {
    const pointsPerSegment = random(3,7);
    let segmentPoints = [];
    
    for (let i = 0; i <= pointsPerSegment; i++) {
      let angle = (TWO_PI / this.symmetry) * (i / pointsPerSegment);
      // Adjusted radius variation for more natural flower shapes
      let radius = this.baseRadius + 
                   sin(angle * 3) * random(5, 20) + 
                   cos(angle * 4) * random(10, 15);
      
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
    rotateZ(frameCount * this.rotationSpeed);
    
    let opacity = map(sin(frameCount * 0.02 + this.index), -1, 1, 0.3, 0.8); // Increased opacity range
    fill(this.hue, 85, 90, opacity); // Increased saturation and brightness
    noStroke();
    
    const depth = -10; // Reduced depth for more delicate appearance
    
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
    // Reduced radius range for more consistent flower sizes
    this.baseRadius = random(10, 40);
    
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
  
  // Increase density by adding more columns and rows
  const cols = ceil(windowWidth / spacing) * 1.5;
  const rows = ceil(windowHeight / spacing) * 1.5;
  
  // Center offset to place the field in the middle of the screen
  const offsetX = -((cols - 1) * spacing) / 2;
  const offsetY = -((rows - 1) * spacing) / 2;
  
  // Create grid of layer stacks with hexagonal-like positioning
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Add hexagonal offset to odd rows for better packing
      let hexOffset = row % 2 === 0 ? 0 : spacing / 2;
      // Reduced random variation for more uniform distribution
      let xPos = offsetX + col * spacing + hexOffset + random(-10, 10);
      let yPos = offsetY + row * spacing * 0.866 + random(-10, 10); // 0.866 = sin(60°) for hexagonal spacing
      
      // Add height variation
      let zPos = random(-50, 50);
      flowerField.push(new LayerStack(xPos, yPos));
    }
  }
}

function draw() {
  background(200, 30, 10); // Darker, warmer background
  orbitControl(4, 4);
  
  // Warmer, softer lighting
  ambientLight(200);
  // pointLight(30, 30, 100, 0, -1000, 500);
  // specularMaterial(255);
  
  // Draw all stacks in the field
  for (let stack of flowerField) {
    stack.display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  flowerField = [];
  setup();
}