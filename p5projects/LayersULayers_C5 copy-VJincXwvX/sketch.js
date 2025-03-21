let flowerField = [];
const maxStackRadius = 100;
const minSpacing = 1.8; // Minimum spacing multiplier between flowers

class Layer {
  constructor(index, baseRadius) {
    this.points = [];
    this.index = index;
    this.zOffset = index * 6 - (5*30);
    this.hue = ((index ) + random(0,360))% 360;
    this.rotationSpeed = random(0.005, 0.007) * (random() > 0.5 ? 1 : -1);
    this.symmetry = floor(random(5, 11));
    this.baseRadius = baseRadius;
    
    this.generateSymmetricShape();
    this.opacityAdd = random(0, 100);
  }
  
  generateSymmetricShape() {
    const pointsPerSegment = random(5, 8);
    let segmentPoints = [];
    
    for (let i = 0; i <= pointsPerSegment; i++) {
      let angle = (TWO_PI*1.5 / this.symmetry) * (i / pointsPerSegment);
      let radius = this.baseRadius + 
                   sin(angle * 2) * random(5, 15) + 
                   cos(angle * 2) * random(5, 15);
      
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
    let opacity = map(sin(frameCount * 0.05 + (this.index+this.opacityAdd)), -1, 1, 0.3, 0.6);
    // opacity = opacity + this.opacityAdd % 0.7
    // console.log(opacity);
    fill(this.hue, 200, 100, opacity);
    noStroke();
    
    const depth = -5;
    
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
    // Significantly increased size range for more variation
    this.baseRadius = random(10, 60); // Changed from (10, 40)
    
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
  }
  
  // Helper function to check overlap with other stacks
  overlaps(other) {
    const minDistance = (this.baseRadius + other.baseRadius) * minSpacing;
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy < minDistance*(minDistance/1.5) ;
  }
}

function tryPlaceStack(bounds, existingStacks, attempts = 50) {
  for (let i = 0; i < attempts; i++) {
    const x = random(bounds.minX, bounds.maxX);
    const y = random(bounds.minY, bounds.maxY);
    const newStack = new LayerStack(x, y);
    
    // Check if this position overlaps with any existing stack
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
  createCanvas(1080, 1080, WEBGL);
  colorMode(HSB, 360, 100, 100, 1.0);
  frameRate(20)
  // const bounds = {
  //   minX: -windowWidth/2 + 120,
  //   maxX: windowWidth/2 - 120,
  //   minY: -windowHeight/2 + 120,
  //   maxY: windowHeight/2 - 120
  // };
  const bounds = {
    minX: -1080/2 + 200,
    maxX: 1080/2 - 200,
    minY: -1080/2 + 200,
    maxY: 1080/2 - 200
  };
  
  // Start with a single flower in the center
  flowerField.push(new LayerStack(0, 0));
  
  // Try to place flowers until we can't find valid positions
  let maxAttempts = 500; // Limit total attempts to prevent infinite loops
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const newStack = tryPlaceStack(bounds, flowerField);
    if (newStack) {
      flowerField.push(newStack);
    } else {
      attempts++;
    }
    
    // Break if we've made enough flowers or can't place more
    if (flowerField.length >= 100 || attempts >= 50) break;
  }
}

function draw() {
  // background(200, 30, 10);
  background(255)
  orbitControl(4, 4);
  ambientLight(200);
  translate(0,0,450)
  
  for (let stack of flowerField) {
    stack.display();
  }
}

function windowResized() {
  resizeCanvas(1080, 1080);
  flowerField = [];
  setup();
}