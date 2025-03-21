let lineCount = 0;
let baseHue = 240; // Blue hue like in the reference image

function setup() {
  createCanvas(1080, 1080);
  background(17);
  colorMode(HSB, 360, 100, 100, 100);
  noLoop();
}

function draw() {
  // Reset line count
   background(255)
  lineCount = 0;
  
  // Center the pattern
  translate(width/2, height/2);
  
  // Draw the recursive pattern
  drawDistortedPattern(0, 0, 350, 6);
  
  // Display final line count
  push()
  fill(0, 0, 0);
  noStroke();
  textSize(16);
  textAlign(LEFT);
  text(`Total lines: ${lineCount}`, -width/2 + 20, -height/2 + 30);
  pop()
}

function drawDistortedPattern(x, y, size, depth) {
  if (size < 1 || depth <= 0) return;
  
  // Calculate color for this depth
  // Vary saturation and brightness based on depth
  let saturation = map(depth, 0, 255, 30, 100);
  let brightness = map(depth, 0, 5, 100, 70);
  stroke(baseHue, saturation, brightness, 50);
  
  // Draw distorted grid
  let steps = 200;
  for (let i = -steps; i <= steps; i++) {
    // Calculate non-linear spacing for hyperbolic effect
    let t = i / steps;
    let distortion = pow(abs(t), 0.5) * sign(t); // Non-linear spacing
    let x1 = x + (distortion * size);
    
    // Vertical lines with hyperbolic curve
    let startY = y - size * pow(1 - abs(t), 2);
    let endY = y + size * pow(1 - abs(t), 2);
    line(x1, startY, x1, endY);
    lineCount++;
    
    // Horizontal lines with similar distortion
    let y1 = y + (distortion * size);
    let startX = x - size * pow(1 - abs(t), 2);
    let endX = x + size * pow(1 - abs(t), 2);
    line(startX, y1, endX, y1);
    lineCount++;
  }
  
  // Recursive calls with reduced size
  let newSize = size * 0.8;
  if (depth > 0) {
    // Adjust recursive pattern positions to create rhombus shape
    drawDistortedPattern(x, y, newSize, depth - 1);
    drawDistortedPattern(x + newSize/2, y, newSize/2, depth - 1);
    drawDistortedPattern(x - newSize/2, y, newSize/2, depth - 1);
    drawDistortedPattern(x, y + newSize/2, newSize/2, depth - 1);
    drawDistortedPattern(x, y - newSize/2, newSize/2, depth - 1);
  }
}

// Helper function to maintain sign of number
function sign(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}