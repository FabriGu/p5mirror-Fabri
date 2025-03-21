let baseHue = 240;
let allLines = [];
let currentLineIndex = 0;
let linesPerFrame = 20; // Increased for smoother animation
let drawnLines = new Set(); // Track unique lines
let otherD = 5;

function setup() {
  createCanvas(1080, 1080);
  colorMode(HSB, 360, 100, 100, 100);
  background(255);
  
  // Generate all line data first
  push();
  generateAllLines(0, 0, 350, otherD, 0.5, 1);
  rotate(PI/2)
   // generateAllLines(0, 0, 350, otherD, 1,1);
  pop();
  push();
  // rotate(PI);
  // generateAllLines(0, 0, 350, otherD);
  pop();
  // Sort lines from largest to smallest for better visual effect
  allLines.sort((a, b) => b.size - a.size);
  
  loop();
}

function generateAllLines(x, y, size, depth, dist, opac) {
  if (size < 1 || depth <= 0) return;
  
  // More dramatic color variation based on depth
  let saturation = map(depth, 0, otherD, 20, 60);  // Higher saturation for outer layers
  let brightness = map(depth, 0,otherD, 20, 90);   // Brighter outer layers, darker inner
  let alpha = map(depth, 0, otherD, 20, 80);        // More opaque outer layers
  // alpha*=opac;
  // Adjust steps based on size to prevent overcrowding at smaller scales
  let steps = Math.max(90, Math.min(200, Math.floor(size)));
  
  for (let i = -steps; i <= steps; i++) {
    let t = i / steps;
    let distortion = pow(abs(t), dist) * sign(t);
    let x1 = x + (distortion * size);
    
    // Store vertical line data
    let startY = y - size * pow(1 - abs(t), 2);
    let endY = y + size * pow(1 - abs(t), 2);
    
    // Only add line if it's significantly long (avoid tiny lines)
    if (abs(endY - startY) > 1) {
      allLines.push({
        x1: x1,
        y1: startY,
        x2: x1,
        y2: endY,
        hue: baseHue,
        sat: saturation,
        brt: brightness,
        alpha: alpha,
        depth: depth,
        size: size
      });
    }
    
    // Store horizontal line data
    let y1 = y + (distortion * size);
    let startX = x - size * pow(1 - abs(t), 2);
    let endX = x + size * pow(1 - abs(t), 2);
    
    if (abs(endX - startX) > 1) {
      allLines.push({
        x1: startX,
        y1: y1,
        x2: endX,
        y2: y1,
        hue: baseHue,
        sat: saturation,
        brt: brightness,
        alpha: alpha,
        depth: depth,
        size: size
      });
    }
  }
  
  // Generate recursive patterns with size-based step reduction
  let newSize = size * 0.9;
  if (depth > 0) {
    generateAllLines(x, y, newSize, depth - 1, dist);
    generateAllLines(x + newSize/2, y, newSize/2, depth - 1, dist, opac);
    generateAllLines(x - newSize/2, y, newSize/2, depth - 1, dist, opac);
    generateAllLines(x, y + newSize/2, newSize/2, depth - 1, dist, opac);
    generateAllLines(x, y - newSize/2, newSize/2, depth - 1,dist, opac);
  }
}

function draw() {
  if (currentLineIndex === 0) {
    background(255);
  }
  
  translate(width/2, height/2);
  
  // Draw new lines for this frame
  for (let i = 0; i < linesPerFrame && currentLineIndex < allLines.length; i++) {
    let l = allLines[currentLineIndex];
    stroke(l.hue, l.sat, l.brt, l.alpha);
    
    // Create unique key for this line with reduced precision
    let precision = 1; // Round to nearest 1 pixel
    let x1Key = floor(l.x1 / precision) * precision;
    let y1Key = floor(l.y1 / precision) * precision;
    let x2Key = floor(l.x2 / precision) * precision;
    let y2Key = floor(l.y2 / precision) * precision;
    
    // Ensure consistent order for line endpoints
    let lineKey = x1Key <= x2Key ? 
      `${x1Key},${y1Key},${x2Key},${y2Key}` : 
      `${x2Key},${y2Key},${x1Key},${y1Key}`;
    
    // Only draw and count if we haven't drawn this line before
    if (!drawnLines.has(lineKey)) {
      line(l.x1, l.y1, l.x2, l.y2);
      drawnLines.add(lineKey);
    }
    
    currentLineIndex++;
  }
  
  // Clear the counter area and display progress
  push();
  translate(-width/2, -height/2);  // Move to top-left corner
  // Draw white rectangle behind counter
  fill(255);
  noStroke();
  rect(10, 10, 200, 40);
  // Draw counter text
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Unique lines drawn: ${drawnLines.size}`, 20, 20);
  pop();
  
  // Stop when all lines are drawn
  if (currentLineIndex >= allLines.length) {
    noLoop();
  }
}

function sign(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}