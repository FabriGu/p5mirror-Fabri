let shapes = [];
let colors;
const numShapes = 15;
const shapeSize = 80;
let scrollSpeed = 2;
let noiseOffset = 0;

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 1);
  
  // Create a vibrant color palette
  colors = [
    color(320, 80, 100), // Pink
    color(280, 80, 100), // Purple
    color(200, 80, 100), // Blue
    color(160, 80, 100), // Turquoise
    color(120, 80, 100)  // Green
  ];
  
  // Initialize shapes with random properties
  for (let i = 0; i < numShapes; i++) {
    shapes.push({
      x: random(width),
      y: random(height),
      rotation: random(TWO_PI),
      size: random(0.5, 1.5) * shapeSize,
      color: random(colors),
      noiseOffsetX: random(1000),
      noiseOffsetY: random(1000)
    });
  }
}

function draw() {
  background(0, 0, 15);
  
  // Update noise offset for organic movement
  noiseOffset += 0.005;
  
  // Draw and update each shape
  for (let shape of shapes) {
    push();
    translate(shape.x, shape.y);
    rotate(shape.rotation);
    
    // Create organic movement using noise
    let xOffset = map(noise(shape.noiseOffsetX + noiseOffset), 0, 1, -2, 2);
    let yOffset = map(noise(shape.noiseOffsetY + noiseOffset), 0, 1, -2, 2);
    
    shape.x += xOffset;
    shape.y += scrollSpeed + yOffset;
    
    // Reset position when shape goes off screen
    if (shape.y > height + shape.size) {
      shape.y = -shape.size;
      shape.x = random(width);
      shape.rotation = random(TWO_PI);
      shape.color = random(colors);
    }
    
    // Draw the shape
    noStroke();
    fill(shape.color);
    
    // Create a complex shape
    beginShape();
    for (let angle = 0; angle < TWO_PI; angle += PI/16) {
      let rad = shape.size * (0.7 + 0.3 * sin(3 * angle + frameCount * 0.05));
      let x = rad * cos(angle);
      let y = rad * sin(angle);
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // Add inner detail
    fill(0, 0, 100, 0.3);
    ellipse(0, 0, shape.size * 0.3);
    
    pop();
    
    // Update rotation
    shape.rotation += 0.01;
    shape.noiseOffsetX += 0.01;
    shape.noiseOffsetY += 0.01;
  }
}

// Add interactivity
function mouseMoved() {
  scrollSpeed = map(mouseY, 0, height, 0.5, 4);
}

function mousePressed() {
  // Change color palette on click
  colors = colors.map(() => color(random(360), 80, 100));
}