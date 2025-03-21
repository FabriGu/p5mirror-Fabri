let layers = [];
const numLayers = 5;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 1.0);
  
  // Initialize layers
  for (let i = 0; i < numLayers; i++) {
    layers.push(new Layer(i));
  }
}

function draw() {
  background(0);
  orbitControl(4, 4); // Add sensitivity parameters
  
  // Basic lighting setup
  ambientLight(200);
  specularMaterial(255);
  
  // Draw all layers
  for (let layer of layers) {
    layer.display();
  }
}

class Layer {
  constructor(index) {
    this.points = [];
    this.index = index;
    this.zOffset = index * 31 - (numLayers * 30); // Increased spacing between layers
    this.hue = (index * 25) % 360;
    this.rotationSpeed = random(0.001, 0.03) * (random() > 0.5 ? 1 : -1); // Random direction
    
    // Random radial symmetry (between 3 and 8 divisions)
    this.symmetry = floor(random(3, 9));
    // Base radius for this layer
    this.baseRadius = random(100, 200);
    
    // Generate one segment of points that will be repeated
    this.generateSymmetricShape();
  }
  
  generateSymmetricShape() {
    // Number of points for one segment
    const pointsPerSegment = 8;
    let segmentPoints = [];
    
    // Generate points for one segment
    for (let i = 0; i <= pointsPerSegment; i++) {
      let angle = (TWO_PI / this.symmetry) * (i / pointsPerSegment);
      
      // Create complex radius variation for the segment
      let radius = this.baseRadius + 
                   sin(angle * 3) * random(20, 40) + 
                   cos(angle * 4) * random(15, 35);
      
      let x = cos(angle) * radius;
      let y = sin(angle) * radius;
      segmentPoints.push({x, y});
    }
    
    // Repeat the segment around the circle
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
    
    // Individual layer rotation around z-axis
    rotateZ(frameCount * this.rotationSpeed);
    
    // Set material properties with oscillating opacity
    let opacity = map(sin(frameCount * 0.02 + this.index), -1, 1, 0.2, 0.6);
    fill(this.hue, 70, 80, opacity);
    noStroke();
    
    const depth = -30; // Thickness of the shape
    
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
      vertex(point.x, point.y, 0);      // Front point
      vertex(point.x, point.y, depth);   // Back point
    }
    endShape(CLOSE);
    
    pop();
  }
}