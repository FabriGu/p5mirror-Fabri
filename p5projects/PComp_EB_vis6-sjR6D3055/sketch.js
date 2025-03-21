let grid = [];
const cols = 10;
const rows = 20;
const blockSize = 20;
const blockShapes = [
  [[1, 1, 1, 1]], // Line shape
  [[1, 1], [1, 1]], // Square shape
  [[1, 1, 1], [0, 1, 0]], // T shape
  [[1, 1, 0], [0, 1, 1]], // S shape
  [[0, 1, 1], [1, 1, 0]]  // Z shape
];
let blockColors = [];
let currentBlock;
let fallInterval = 100; // Block fall speed in milliseconds
let lastFallTime = 0;

function setup() {
  createCanvas(cols * blockSize, rows * blockSize);
  initializeGrid();

  // Initialize colors and store them in an array for later use
  blockColors = [
    color(135, 206, 250), // Light blue (clear)
    color(255, 215, 0),   // Gold (meditative)
    color(72, 61, 139)    // Dark blue (focus)
  ];
  
  createNewBlock();
}

function draw() {
  background(0);
  displayGrid();

  // Make the block fall at the specified interval
  if (millis() - lastFallTime > fallInterval) {
    moveBlockDown();
    lastFallTime = millis();
  }

  occasionallyRemoveBlocks();
}

// Initialize an empty grid
function initializeGrid() {
  grid = Array(rows).fill().map(() => Array(cols).fill(null));
}

// Display the grid, including static and current blocks
function displayGrid() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) {
        fill(grid[r][c]);
        rect(c * blockSize, r * blockSize, blockSize, blockSize);
      }
    }
  }
  displayCurrentBlock();
}

// Generate a new random block
function createNewBlock() {
  let shape = random(blockShapes);
  let colorIndex = floor(random(blockColors.length));
  let color = blockColors[colorIndex];
  
  // Randomize the x position within the grid
  let startX = floor(random(cols - shape[0].length + 1)); // Ensure block stays within bounds
  currentBlock = { shape, color, x: startX, y: 0 };
}

// Display the current block
function displayCurrentBlock() {
  fill(currentBlock.color);
  for (let r = 0; r < currentBlock.shape.length; r++) {
    for (let c = 0; c < currentBlock.shape[r].length; c++) {
      if (currentBlock.shape[r][c]) {
        rect((currentBlock.x + c) * blockSize, (currentBlock.y + r) * blockSize, blockSize, blockSize);
      }
    }
  }
}

// Move the current block down, and lock it in place if it reaches the bottom or another block
function moveBlockDown() {
  if (!isCollision(currentBlock, 0, 1)) {
    currentBlock.y++;
  } else {
    lockBlock();
    createNewBlock();
  }
}

// Check for collision with bottom or other blocks
function isCollision(block, offsetX, offsetY) {
  for (let r = 0; r < block.shape.length; r++) {
    for (let c = 0; c < block.shape[r].length; c++) {
      if (block.shape[r][c]) {
        let newX = block.x + c + offsetX;
        let newY = block.y + r + offsetY;
        if (newY >= rows || newX < 0 || newX >= cols || (newY >= 0 && grid[newY][newX])) {
          return true;
        }
      }
    }
  }
  return false;
}

// Lock the current block in place on the grid
function lockBlock() {
  for (let r = 0; r < currentBlock.shape.length; r++) {
    for (let c = 0; c < currentBlock.shape[r].length; c++) {
      if (currentBlock.shape[r][c]) {
        grid[currentBlock.y + r][currentBlock.x + c] = currentBlock.color;
      }
    }
  }
}

// Occasionally remove some blocks to add variation
function occasionallyRemoveBlocks() {
  if (frameCount % 600 === 0) { // Every 10 seconds
    let rowToClear = floor(random(rows));
    for (let c = 0; c < cols; c++) {
      grid[rowToClear][c] = null;
    }
    // Trigger blocks above to fall down if there’s empty space below
    applyGravity();
  }
}

// Apply gravity to make blocks fall down to fill gaps
function applyGravity() {
  for (let r = rows - 2; r >= 0; r--) { // Start from second-last row to top
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] && !grid[r + 1][c]) { // If there is a block with empty space below
        let row = r;
        // Move the block down until it hits another block or the bottom
        while (row < rows - 1 && !grid[row + 1][c]) {
          grid[row + 1][c] = grid[row][c];
          grid[row][c] = null;
          row++;
        }
      }
    }
  }
}
