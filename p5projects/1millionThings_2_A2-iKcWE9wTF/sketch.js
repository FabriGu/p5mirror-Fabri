let lineCount = 0;
let baseHue = 240;
let currentDepth = 0;
let progress = 0;
let generationSpeed = 0.02; // Adjust this to control generation speed

function setup() {
  createCanvas(1080, 1080);
  colorMode(HSB, 360, 100, 100, 100);
  background(255);
  loop();
}

function draw() {
  background(255);
  translate(width/2, height/2);
  
  lineCount = 0;
  drawProgressivePattern(0, 0, 350, 6, progress);
  
  // Update progress
  progress += generationSpeed;
  
  // Display line count
  push();
  fill(0, 0, 0);
  noStroke();
  textSize(16);
  textAlign(LEFT);
  text(`Total lines: ${lineCount}`, -width/2 + 20, -height/2 + 30);
  pop();
}

function drawProgressivePattern(x, y, size, maxDepth, currentProgress) {
  // Calculate which depth we're currently revealing
  let currentDepth = floor(currentProgress);
  let depthProgress = currentProgress % 1;
  
  if (currentDepth > maxDepth) return;
  
  for (let d = 0; d <= min(currentDepth, maxDepth); d++) {
    let alpha = d < currentDepth ? 50 : 50 * depthProgress;
    drawDepthLayer(x, y, size, d, alpha);
  }
}

function drawDepthLayer(x, y, size, depth, alpha) {
  if (size < 1) return;
  
  let saturation = map(depth, 0, 255, 30, 100);
  let brightness = map(depth, 0, 5, 100, 70);
  stroke(baseHue, saturation, brightness, alpha);
  
  let steps = 200;
  for (let i = -steps; i <= steps; i++) {
    let t = i / steps;
    let distortion = pow(abs(t), 0.5) * sign(t);
    let x1 = x + (distortion * size);
    
    // Vertical lines
    let startY = y - size * pow(1 - abs(t), 2);
    let endY = y + size * pow(1 - abs(t), 2);
    line(x1, startY, x1, endY);
    lineCount++;
    
    // Horizontal lines
    let y1 = y + (distortion * size);
    let startX = x - size * pow(1 - abs(t), 2);
    let endX = x + size * pow(1 - abs(t), 2);
    line(startX, y1, endX, y1);
    lineCount++;
  }
  
  // Recursive calls
  let newSize = size * 0.8;
  if (depth > 0) {
    drawDepthLayer(x, y, newSize, depth - 1, alpha);
    drawDepthLayer(x + newSize/2, y, newSize/2, depth - 1, alpha);
    drawDepthLayer(x - newSize/2, y, newSize/2, depth - 1, alpha);
    drawDepthLayer(x, y + newSize/2, newSize/2, depth - 1, alpha);
    drawDepthLayer(x, y - newSize/2, newSize/2, depth - 1, alpha);
  }
}

function sign(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}