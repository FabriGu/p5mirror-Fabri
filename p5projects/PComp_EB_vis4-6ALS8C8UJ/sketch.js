let cols = 16;
let rows = 16;
let grid = [];
let startHue = 0;
let xPhase = 0;
let xPhaseMul = 2;
let yPhaseMul = 1;

function setup() {
  createCanvas(400, 400);
  colorMode(HSB, 255);
  noStroke();
  
  // Initialize grid
  for (let y = 0; y < rows; y++) {
    let rowS = [];
    for (let x = 0; x < cols; x++) {
      rowS.push(0);
    }
    grid.push(rowS);
  }
}

function draw() {
  background(20);
  startHue += 2; // Increment for color animation
  xPhase += 0.05; // Phase shift for wave movement
  
  // Update each cell's color based on its position and animation variables
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let pixelHue = startHue + x * xPhaseMul + y * yPhaseMul + xPhase * 100;
      grid[y][x] = color(pixelHue % 255, 200, 255);
      
      // Draw each "LED" as a square
      fill(grid[y][x]);
      let cellSize = width / cols;
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}
