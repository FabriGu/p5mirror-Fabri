let flowerField = [];
const maxStackRadius = 100;
const minSpacing = 1.4;

class Layer {
  constructor(index, baseRadius) {
    this.points = [];
    this.index = index;
    this.zOffset = index * 11 - (5 * 30);
    this.hue = (index * 15) % 360 + 200;
    this.rotationSpeed = random(0.005, 0.02) * (random() > 0.5 ? 1 : -1);
    this.symmetry = floor(random(5, 11));
    this.baseRadius = baseRadius;
    
    this.generateSymmetricShape();
  }
  
  generateSymmetricShape() {
    const pointsPerSegment = random(3, 7);
    let segmentPoints = [];
    
    for (let i = 0; i <= pointsPerSegment; i++) {
      let angle = (TWO_PI / this.symmetry) * (i / pointsPerSegment);
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
    let opacity = map(sin(frameCount * 0.02 + this.index), -1, 1, 0.1, 0.8);
    fill(this.hue, 85, 90, opacity);
    noStroke();
    
    const depth = -10;
    
    beginShape();
    for (let point of this.points) {
      vertex(point.x, point.y, 0);
    }
    endShape(CLOSE);
    
    beginShape();
    for (let point of this.points) {
      vertex(point.x, point.y, depth);
    }
    endShape(CLOSE);
    
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
    this.baseRadius = random(8, 60);
    this.lifespan = random(200, 500);
    this.age = 0;
    
    for (let i = 0; i < 5; i++) {
      this.layers.push(new Layer(i, this.baseRadius));
    }
  }
  
  display() {
    push();
    translate(this.x, this.y, 0);
    for (let layer of this.layers) {
      push();
      translate(0, 0, layer.zOffset);
      layer.display();
      pop();
    }
    pop();
    this.age++;
  }
  
  isDead() {
    return this.age >= this.lifespan;
  }
  
  overlaps(other) {
    const minDistance = (this.baseRadius + other.baseRadius) * minSpacing;
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy < minDistance * minDistance;
  }
}

function tryPlaceStack(bounds, existingStacks, x, y, attempts = 50) {
  if (x !== undefined && y !== undefined) {
    const newStack = new LayerStack(x, y);
    let overlapping = false;
    for (let existing of existingStacks) {
      if (newStack.overlaps(existing)) {
        overlapping = true;
        break;
      }
    }
    return overlapping ? null : newStack;
  }

  for (let i = 0; i < attempts; i++) {
    const newX = random(bounds.minX, bounds.maxX);
    const newY = random(bounds.minY, bounds.maxY);
    const newStack = new LayerStack(newX, newY);
    
    let overlapping = false;
    for (let existing of existingStacks) {
      if (newStack.overlaps(existing)) {
        overlapping = true;
        break;
      }
    }
    
    if (!overlapping) {
      return newStack;
    }
  }
  return null;
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 1.0);
  
  const bounds = {
    minX: -windowWidth/2 + 100,
    maxX: windowWidth/2 - 100,
    minY: -windowHeight/2 + 100,
    maxY: windowHeight/2 - 100
  };
  
  flowerField.push(new LayerStack(0, 0));
  
  let maxAttempts = 1000;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const newStack = tryPlaceStack(bounds, flowerField);
    if (newStack) {
      flowerField.push(newStack);
    } else {
      attempts++;
    }
    
    if (flowerField.length >= 200 || attempts >= 50) break;
  }
}

function draw() {
  background(255);
  orbitControl(4, 4);
  ambientLight(200);
  
  for (let i = flowerField.length - 1; i >= 0; i--) {
    const stack = flowerField[i];
    stack.display();
    
    if (stack.isDead()) {
      const newStack = tryPlaceStack(
        {
          minX: -windowWidth/2 + 100,
          maxX: windowWidth/2 - 100,
          minY: -windowHeight/2 + 100,
          maxY: windowHeight/2 - 100
        },
        flowerField,
        stack.x,
        stack.y
      );
      
      if (newStack) {
        flowerField[i] = newStack;
      } else {
        flowerField.splice(i, 1);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  flowerField = [];
  setup();
}