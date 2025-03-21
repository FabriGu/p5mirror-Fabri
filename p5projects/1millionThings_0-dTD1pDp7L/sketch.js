let lineCount = 0;

function setup() {
  createCanvas(800, 800);
  background(17);
  stroke(255, 50);
  noLoop();
}

function draw() {
  // Reset line count
  lineCount = 0;
  
  // Draw the recursive pattern in all four quadrants
  drawQuadrantPattern(width/2, height/2, width/2, 5);
  
  // Display final line count
  fill(255);
  noStroke();
  textSize(16);
  text(`Total lines: ${lineCount}`, 20, 30);
}

function drawQuadrantPattern(x, y, size, depth) {
  if (size < 10 || depth <= 0) return;
  
  // Draw curve stitch pattern in each quadrant
  drawCurveStitch(x, y, size, 1, 1);    // Bottom right
  drawCurveStitch(x, y, size, -1, 1);   // Bottom left
  drawCurveStitch(x, y, size, -1, -1);  // Top left
  drawCurveStitch(x, y, size, 1, -1);   // Top right
  
  // Recursive calls for each sub-quadrant
  let newSize = size * 0.5;
  let offset = newSize * 0.5;
  
  if (depth > 0) {
    drawQuadrantPattern(x + offset, y + offset, newSize, depth - 1);
    drawQuadrantPattern(x - offset, y + offset, newSize, depth - 1);
    drawQuadrantPattern(x - offset, y - offset, newSize, depth - 1);
    drawQuadrantPattern(x + offset, y - offset, newSize, depth - 1);
  }
}

function drawCurveStitch(centerX, centerY, size, dirX, dirY) {
  let steps = 10;
  let stepSize = size / steps;
  
  // Draw vertical lines
  for (let i = 0; i <= steps; i++) {
    let x = centerX + (i * stepSize * dirX);
    let y1 = centerY;
    let y2 = centerY + (size * dirY);
    line(x, y1, x, y2);
    lineCount++;
  }
  
  // Draw horizontal lines
  for (let i = 0; i <= steps; i++) {
    let y = centerY + (i * stepSize * dirY);
    let x1 = centerX;
    let x2 = centerX + (size * dirX);
    line(x1, y, x2, y);
    lineCount++;
  }
  
  // Draw diagonal lines
  for (let i = 0; i <= steps; i++) {
    let startX = centerX + (i * stepSize * dirX);
    let startY = centerY;
    let endX = centerX + (size * dirX);
    let endY = centerY + ((steps - i) * stepSize * dirY);
    line(startX, startY, endX, endY);
    lineCount++;
    
    // Draw second set of diagonal lines for the curve stitch effect
    startY = centerY + (i * stepSize * dirY);
    endX = centerX + ((steps - i) * stepSize * dirX);
    endY = centerY + (size * dirY);
    line(centerX, startY, endX, endY);
    lineCount++;
  }
}