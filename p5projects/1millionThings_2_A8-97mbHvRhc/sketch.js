let baseHue = 20;
let allLines = [];
let currentLineIndex = 0;
let linesPerFrame = 800; // Dramatically increased for faster drawing
let drawnLines = new Set();

function setup() {
  createCanvas(1080, 1080);
  colorMode(HSB, 360, 100, 100, 100);
  background(0);
  
  // Generate all line data first - with both normal and rotated patterns
  generateAllLines(0, 0, 350, 6, 0);        // Original pattern
  generateAllLines(0, 0, 350, 6, PI/2);     // 90-degree rotated pattern
  generateAllLines(0, 0, 350, 6, PI/4);     // 90-degree rotated pattern
  
  // Sort lines from largest to smallest for better visual effect
  allLines.sort((a, b) => b.size - a.size);
  
  console.log(`Generated ${allLines.length} total lines`);
  loop();
}

function generateAllLines(x, y, size, depth, rotation) {
  if (size < 1 || depth <= 0) return;
  
  // Inverse mapping so deeper levels are darker and more saturated
  let hue = (baseHue - depth * 10 + 360) % 360;
  let saturation = map(depth, 0, 7, 80, 20);
  let brightness = map(depth, 0, 7, 120, 100);
  let alpha = map(depth, 0, 7, 1, 50);
  
  // Adjust steps based on size
  let steps = Math.max(30, Math.min(200, Math.floor(size)));
  
  for (let i = -steps; i <= steps; i++) {
    let t = i / steps;
    let distortion = pow(abs(t), 0.5) * sign(t);
    
    // Apply rotation to coordinates
    let cosR = cos(rotation);
    let sinR = sin(rotation);
    
    // Calculate base coordinates
    let x1 = x + (distortion * size);
    let startY = y - size * pow(1 - abs(t), 2);
    let endY = y + size * pow(1 - abs(t), 2);
    
    // Rotate coordinates
    let rx1 = x + (x1 - x) * cosR - (startY - y) * sinR;
    let ry1 = y + (x1 - x) * sinR + (startY - y) * cosR;
    let rx2 = x + (x1 - x) * cosR - (endY - y) * sinR;
    let ry2 = y + (x1 - x) * sinR + (endY - y) * cosR;
    
    // Store rotated vertical line
    if (abs(ry2 - ry1) > 1) {
      allLines.push({
        x1: rx1, y1: ry1, x2: rx2, y2: ry2,
        hue, sat: saturation, brt: brightness, alpha, depth, size
      });
    }
    
    // Calculate and rotate horizontal line coordinates
    let y1 = y + (distortion * size);
    let startX = x - size * pow(1 - abs(t), 2);
    let endX = x + size * pow(1 - abs(t), 2);
    
    rx1 = x + (startX - x) * cosR - (y1 - y) * sinR;
    ry1 = y + (startX - x) * sinR + (y1 - y) * cosR;
    rx2 = x + (endX - x) * cosR - (y1 - y) * sinR;
    ry2 = y + (endX - x) * sinR + (y1 - y) * cosR;
    
    // Store rotated horizontal line
    if (abs(rx2 - rx1) > 1) {
      allLines.push({
        x1: rx1, y1: ry1, x2: rx2, y2: ry2,
        hue, sat: saturation, brt: brightness, alpha, depth, size
      });
    }
  }
  
  // Generate recursive patterns
  let newSize = size * 0.75;
  if (depth > 0) {
    // Center pattern
    generateAllLines(x, y, newSize, depth - 1, rotation);
    
    // Surrounding patterns - 6 directions instead of 8 for better performance
    for (let angle = 0; angle < TWO_PI; angle += PI/3) {
      let offsetX = cos(angle) * newSize/2;
      let offsetY = sin(angle) * newSize/2;
      generateAllLines(x + offsetX, y + offsetY, newSize/2, depth - 1, rotation);
    }
  }
}

function draw() {
  if (currentLineIndex === 0) {
    background(255);
  }
  
  translate(width/2, height/2);
  
  // Draw many more lines per frame
  for (let i = 0; i < linesPerFrame && currentLineIndex < allLines.length; i++) {
    let l = allLines[currentLineIndex];
    
    // Create unique key for this line with reduced precision
    let precision = 1;
    let x1Key = floor(l.x1 / precision) * precision;
    let y1Key = floor(l.y1 / precision) * precision;
    let x2Key = floor(l.x2 / precision) * precision;
    let y2Key = floor(l.y2 / precision) * precision;
    
    // Ensure consistent order for line endpoints
    let lineKey = x1Key <= x2Key ? 
      `${x1Key},${y1Key},${x2Key},${y2Key}` : 
      `${x2Key},${y2Key},${x1Key},${y1Key}`;
    
    // Only draw if we haven't drawn this line before
    if (!drawnLines.has(lineKey)) {
      stroke(l.hue, l.sat, l.brt, l.alpha);
      line(l.x1, l.y1, l.x2, l.y2);
      drawnLines.add(lineKey);
    }
    
    currentLineIndex++;
  }
  
  // Clear the counter area and display progress
  push();
  translate(-width/2, -height/2);
  fill(255);
  noStroke();
  rect(10, 10, 300, 40);
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Unique lines drawn: ${drawnLines.size}`, 20, 20);
  pop();
  
  // Stop when all lines are drawn
  if (currentLineIndex >= allLines.length) {
    noLoop();
    console.log("Final line count:", drawnLines.size);
  }
}

function sign(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}