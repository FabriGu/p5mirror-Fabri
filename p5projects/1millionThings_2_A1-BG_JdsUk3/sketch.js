let lineCount = 0;
let baseHue = 240;

function setup() {
  createCanvas(1080, 1080);
  colorMode(HSB, 360, 100, 100, 100);
  loop();
}

function draw() {
  background(255);
  translate(width/2, height/2);
  
  lineCount = 0;
  
  // Use time to create subtle movement
  let time = millis() / 1000;
  
  // Draw the recursive pattern with movement
  drawDistortedPattern(0, 0, 350, 6, time);
  
  push();
  fill(0, 0, 0);
  noStroke();
  textSize(16);
  textAlign(LEFT);
  text(`Total lines: ${lineCount}`, -width/2 + 20, -height/2 + 30);
  pop();
}

function drawDistortedPattern(x, y, size, depth, time) {
  if (size < 1 || depth <= 0) return;
  
  let saturation = map(depth, 0, 255, 30, 100);
  let brightness = map(depth, 0, 5, 100, 70);
  stroke(baseHue, saturation, brightness, 50);
  
  let steps = 200;
  
  // Add subtle movement based on depth and time
  let moveScale = map(depth, 0, 6, 1, 0.2);
  let xOffset = sin(time + depth) * size * 0.02 * moveScale;
  let yOffset = cos(time * 0.7 + depth) * size * 0.02 * moveScale;
  
  for (let i = -steps; i <= steps; i++) {
    let t = i / steps;
    // Add wave movement to distortion
    let waveOffset = sin(t * PI + time) * 0.02 * moveScale;
    let distortion = (pow(abs(t), 0.5) * sign(t) + waveOffset);
    let x1 = x + (distortion * size) + xOffset;
    
    // Vertical lines with movement
    let startY = y - size * pow(1 - abs(t), 2) + yOffset;
    let endY = y + size * pow(1 - abs(t), 2) + yOffset;
    line(x1, startY, x1, endY);
    lineCount++;
    
    // Horizontal lines with movement
    let y1 = y + (distortion * size) + yOffset;
    let startX = x - size * pow(1 - abs(t), 2) + xOffset;
    let endX = x + size * pow(1 - abs(t), 2) + xOffset;
    line(startX, y1, endX, y1);
    lineCount++;
  }
  
  // Recursive calls with movement
  let newSize = size * 0.8;
  if (depth > 0) {
    drawDistortedPattern(x + xOffset, y + yOffset, newSize, depth - 1, time);
    drawDistortedPattern(x + newSize/2 + xOffset, y + yOffset, newSize/2, depth - 1, time);
    drawDistortedPattern(x - newSize/2 + xOffset, y + yOffset, newSize/2, depth - 1, time);
    drawDistortedPattern(x + xOffset, y + newSize/2 + yOffset, newSize/2, depth - 1, time);
    drawDistortedPattern(x + xOffset, y - newSize/2 + yOffset, newSize/2, depth - 1, time);
  }
}

function sign(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}