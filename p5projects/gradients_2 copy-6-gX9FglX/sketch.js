let time = 0;
const gridSize = 16; // 16x16 grid
const colors = [
  [255, 99, 146],  // Pink
  [75, 192, 240],  // Blue
  [255, 171, 76],  // Orange
  [148, 99, 255],  // Purple
  [76, 255, 171]   // Mint
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  noStroke();
}

function draw() {
  background(0);
  
  // Calculate cell size based on canvas size
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;
  
  // Draw grid of gradient cells
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      drawGradientCell(x * cellWidth, y * cellHeight, cellWidth, cellHeight, x, y);
    }
  }
  
  // Increment time for animation
  time += 0.03;
}

function drawGradientCell(x, y, w, h, gridX, gridY) {
  // Create wave-like offsets
  const offsetX = sin((time + gridX * 0.5 + gridY * 0.5) * 2) * 2;
  const offsetY = cos((time + gridX * 0.3 + gridY * 0.7) * 2) * 2;
  
  // Calculate color indices based on position and time
  const colorIndex1 = floor((time * 0.5 + gridX * 0.3 + gridY * 0.3) % colors.length);
  const colorIndex2 = (colorIndex1 + 2) % colors.length;
  
  // Get base colors
  const color1 = colors[colorIndex1];
  const color2 = colors[colorIndex2];
  
  // Create gradient by drawing many rectangles
  const steps = 20;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    
    // Add wave effect to interpolation
    const waveEffect = sin((t * PI + time + gridX * 0.5 + gridY * 0.5) * 2) * 0.2;
    const adjustedT = constrain(t + waveEffect, 0, 1);
    
    // Interpolate colors with wave effect
    const r = lerp(color1[0], color2[0], adjustedT);
    const g = lerp(color1[1], color2[1], adjustedT);
    const b = lerp(color1[2], color2[2], adjustedT);
    
    // Calculate position with wave displacement
    const xPos = x + t * w + sin(time + gridX * 0.5 + gridY * 0.5 + t * PI) * (w * 0.05);
    const yPos = y + t * h + cos(time + gridX * 0.7 + gridY * 0.3 + t * PI) * (h * 0.05);
    
    // Draw gradient step
    const stepWidth = w / steps * 1.5; // Slightly wider to avoid gaps
    const stepHeight = h / steps * 1.5;
    
    fill(r, g, b, 255);
    rect(xPos, yPos, stepWidth, stepHeight);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}