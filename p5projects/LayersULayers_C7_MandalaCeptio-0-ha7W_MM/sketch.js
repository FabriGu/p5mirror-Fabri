let stackSets = [];
const numStacks = 8;  // Number of stacks around each latitude ring
const numRings = 3;   // Number of latitude rings (not including poles)
const numLayers = 6;  // Layers per stack
const sphereRadius = 400;  // Sphere radius

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
  constructor(longIndex, latIndex, isPoleCap = false) {
    this.longIndex = longIndex;
    this.latIndex = latIndex;
    this.isPoleCap = isPoleCap;
    
    // Calculate spherical coordinates
    this.longitude = (TWO_PI / numStacks) * longIndex;
    
    if (isPoleCap) {
      this.latitude = latIndex === 0 ? -PI/2 : PI/2;
    } else {
      // Adjust latitude range to avoid clustering at poles
      this.latitude = map(latIndex, 1, numRings, -PI/3, PI/3);
    }
  }
  
  display() {
    push();
    
    // Convert spherical coordinates to Cartesian
    let x = sphereRadius * cos(this.latitude) * sin(this.longitude);
    let y = sphereRadius * sin(this.latitude);
    let z = sphereRadius * cos(this.latitude) * cos(this.longitude);
    
    translate(x, y, z);
    
    // Calculate rotations to face center
    let horizontalAngle = this.longitude + PI;
    let verticalAngle = -this.latitude;
    
    rotateY(horizontalAngle);
    rotateX(verticalAngle);
    
    for (let layer of templateLayers) {
      layer.display();
    }
    pop();
  }
}

class BowlStackSet {
  constructor(longIndex, latIndex) {
    this.longIndex = longIndex;
    this.latIndex = latIndex;
    
    // Calculate spherical coordinates
    this.longitude = (TWO_PI / numStacks) * longIndex;
    
    // Only use bottom hemisphere range, shifted up slightly
    this.latitude = map(latIndex, 0, numRings/2, -PI/2.5, -PI/6);
  }
  
  display() {
    push();
    
    // Convert spherical coordinates to Cartesian
    let x = sphereRadius * cos(this.latitude) * sin(this.longitude);
    let y = sphereRadius * sin(this.latitude);
    let z = sphereRadius * cos(this.latitude) * cos(this.longitude);
    
    translate(x, y, z);
    
    // Calculate rotations to face center
    let horizontalAngle = this.longitude + PI;
    let verticalAngle = -this.latitude;
    
    rotateY(horizontalAngle);
    rotateX(verticalAngle);
    
    for (let layer of templateLayers) {
      layer.display();
    }
    pop();
  }
}

function setupSphere() {
  stackSets = [];
  
  // Add top pole cap
  stackSets.push(new StackSet(0, 1, true));
  
  // Add latitude rings
  for (let lat = 1; lat <= numRings; lat++) {
    for (let long = 0; long < numStacks; long++) {
      stackSets.push(new StackSet(long, lat));
    }
  }
  
  // Add bottom pole cap
  stackSets.push(new StackSet(0, 0, true));
}

function setupBowl() {
  stackSets = [];
  
  // Add bottom rings only
  for (let lat = 0; lat <= numRings/2; lat++) {
    for (let long = 0; long < numStacks; long++) {
      stackSets.push(new BowlStackSet(long, lat));
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 1.0);
  
  // Generate template layers
  for (let i = 0; i < numLayers; i++) {
    templateLayers.push(new Layer(i));
  }
  
  // Choose which version to use:
  setupSphere(); // For full sphere version
  // setupBowl();    // For bowl/flower version
}

function draw() {
  background(0);
  orbitControl(4, 4);
  
  // Basic lighting setup
  ambientLight(200);
  specularMaterial(255);
  
  // Draw all stacks
  for (let stack of stackSets) {
    stack.display();
  }
}