let lineCount = 0;
let baseHue = 240;
let allLines = [];
let currentLineIndex = 0;
let linesPerFrame = 10; // How many lines to add per frame

function setup() {
  createCanvas(1080, 1080);
  colorMode(HSB, 360, 100, 100, 100);
  background(255);
  
  // Generate all line data first
  generateAllLines(0, 0, 350, 6);
  
  loop();
}

function generateAllLines(x, y, size, depth) {
  background(255);
  if (size < 1 || depth <= 0) return;
  
  let saturation = map(depth, 0, 255, 30, 100);
  let brightness = map(depth, 0, 5, 100, 70);
  let alpha = 50;
  
  let steps = 200;
  for (let i = -steps; i <= steps; i++) {
    let t = i / steps;
    let distortion = pow(abs(t), 0.5) * sign(t);
    let x1 = x + (distortion * size);
    
    // Store vertical line data
    let startY = y - size * pow(1 - abs(t), 2);
    let endY = y + size * pow(1 - abs(t), 2);
    allLines.push({
      x1: x1,
      y1: startY,
      x2: x1,
      y2: endY,
      hue: baseHue,
      sat: saturation,
      brt: brightness,
      alpha: alpha,
      depth: depth
    });
    
    // Store horizontal line data
    let y1 = y + (distortion * size);
    let startX = x - size * pow(1 - abs(t), 2);
    let endX = x + size * pow(1 - abs(t), 2);
    allLines.push({
      x1: startX,
      y1: y1,
      x2: endX,
      y2: y1,
      hue: baseHue,
      sat: saturation,
      brt: brightness,
      alpha: alpha,
      depth: depth
    });
  }
  
  // Generate recursive patterns
  let newSize = size * 0.8;
  if (depth > 0) {
    generateAllLines(x, y, newSize, depth - 1);
    generateAllLines(x + newSize/2, y, newSize/2, depth - 1);
    generateAllLines(x - newSize/2, y, newSize/2, depth - 1);
    generateAllLines(x, y + newSize/2, newSize/2, depth - 1);
    generateAllLines(x, y - newSize/2, newSize/2, depth - 1);
  }
}

function draw() {
  if (currentLineIndex === 0) {
    background(255);
  }
  
  translate(width/2, height/2);
  
  // Draw existing lines
  for (let i = 0; i < currentLineIndex; i++) {
    let l = allLines[i];
    stroke(l.hue, l.sat, l.brt, l.alpha);
    line(l.x1, l.y1, l.x2, l.y2);
  }
  
  // Add new lines
  for (let i = 0; i < linesPerFrame && currentLineIndex < allLines.length; i++) {
    currentLineIndex++;
  }
  
  // Display progress
  push();
  fill(0, 0, 0);
  noStroke();
  textSize(16);
  textAlign(LEFT);
  let progress = floor((currentLineIndex / allLines.length) * 100);
  text(`Progress: ${progress}% (${currentLineIndex} / ${allLines.length} lines)`, -width/2 + 20, -height/2 + 30);
  pop();
  
  // Stop when all lines are drawn
  if (currentLineIndex >= allLines.length) {
    noLoop();
  }
}

function sign(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}