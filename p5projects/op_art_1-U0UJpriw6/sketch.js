// P5.js Drill Spiral Pattern
let segments = 12;  // Number of segments around the center
let rotationSpeed = 0.0009;

// Complementary color pairs
const colorPairs1 = [
  // Blue-Orange pair
  [[50, 100, 255], [255, 150, 50]],
  // Red-Green pair
  [[255, 50, 50], [50, 255, 100]]
];

const colorPairs2 = [
  // Blue-Orange pair
  [[150, 120, 255], [255, 150, 50]],
  // Red-Green pair
  [[25, 50, 50], [50, 55, 150]]
];

function setup() {
  const size = min(windowWidth * 0.8, 800);
  createCanvas(size, size);
  angleMode(RADIANS);
  colorMode(RGB);
}

function draw() {
  background(20);
  translate(width / 2, height / 2);

  // let radius = width * 0.45;  // Reduced to ensure spirals touch perfectly
  let radius = width * 0.8;
  
  // Calculate segment angle for perfect alignment
  const segmentAngle = TWO_PI / segments;
  
  // Draw each spiral segment
  for (let i = 0; i < segments; i++) {
    const baseAngle = segmentAngle * i;
    const colorPairIndex = i % 2;
    const colors1 = colorPairs1[colorPairIndex];
    const colors2 = colorPairs2[colorPairIndex]
    
    // Alternate rotation direction
    const rotation = (i % 2 === 0) ? millis() * rotationSpeed : -millis() * rotationSpeed;

    drawDrillSpiral(
      radius,
      baseAngle,
      segmentAngle,
      colors1,
      rotation,
      i % 2 === 0
    );
    
    drawDrillSpiral(
      radius,
      baseAngle,
      segmentAngle,
      colors2,
      rotation-100,
      i % 2 === 0
    );
  }
}

function drawDrillSpiral(radius, baseAngle, segmentAngle, colors, rotation, clockwise) {
  const spiralSteps = 24;  // Increased for smoother spiral
  const segmentSteps = 3;  // Number of segments in each spiral
  
  push();
  // Rotate to position and align segment
  // stroke(250)
  rotate(baseAngle);
  
  // Create the drill spiral effect
  for (let step = 0; step < segmentSteps; step++) {
    beginShape(TRIANGLE_STRIP);
    
    const colorIndex = step % 2;
    fill(colors[colorIndex][0], colors[colorIndex][1], colors[colorIndex][2]);
    noStroke();

    for (let i = 0; i <= spiralSteps; i++) {
      const t = i / spiralSteps;
      const r = radius * (1 - t * 1);  // Slightly reduce inner radius for better center convergence
      
      // Calculate spiral twist
      const twist = rotation + (clockwise ? t * TWO_PI : -t * TWO_PI);
      
      // Calculate points along the spiral edge
      const angle1 = twist;
      const angle2 = twist + segmentAngle;
      
      // Create perfectly aligned edges
      const x1 = r * cos(angle1);
      const y1 = r * sin(angle1);
      const x2 = r * cos(angle2);
      const y2 = r * sin(angle2);
      
      vertex(x1, y1);
      vertex(x2, y2);
    }
    endShape();
  }
  pop();
}

function windowResized() {
  const size = min(windowWidth * 0.8, 800);
  resizeCanvas(size, size);
}