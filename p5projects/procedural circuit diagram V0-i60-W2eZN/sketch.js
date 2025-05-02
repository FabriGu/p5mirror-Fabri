// Procedural Circuit Diagram Generator
// This sketch creates a randomly generated circuit diagram that resembles a maze
// with properly connected electronic components

let grid = [];
let cellSize = 30;
let cols, rows;
let components = [];

// Circuit components definitions
const COMPONENTS = {
  RESISTOR: 0,
  CAPACITOR: 1,
  INDUCTOR: 2,
  DIODE: 3,
  SWITCH: 4,
  BATTERY: 5,
  GROUND: 6,
  LED: 7,
  TRANSISTOR: 8,
  WIRE: 9
};

function setup() {
  createCanvas(800, 600);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  
  // Initialize grid
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = {
        visited: false,
        // Top, right, bottom, left walls
        walls: [true, true, true, true],
        // Component type (if any)
        component: null,
        // Orientation (0: horizontal, 1: vertical)
        orientation: Math.random() > 0.5 ? 0 : 1
      };
    }
  }
  
  // Generate maze using DFS algorithm
  generateMaze(0, 0);
  
  // Place components
  placeComponents();
  
  // Set random component for testing
  frameRate(30);
}

function draw() {
  background(240);
  
  // Draw grid and components
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * cellSize;
      let y = j * cellSize;
      
      // Draw walls if they exist
      stroke(0);
      strokeWeight(2);
      
      if (grid[i][j].walls[0]) line(x, y, x + cellSize, y); // Top
      if (grid[i][j].walls[1]) line(x + cellSize, y, x + cellSize, y + cellSize); // Right
      if (grid[i][j].walls[2]) line(x, y + cellSize, x + cellSize, y + cellSize); // Bottom
      if (grid[i][j].walls[3]) line(x, y, x, y + cellSize); // Left
      
      // Draw component if it exists
      if (grid[i][j].component !== null) {
        drawComponent(
          x + cellSize / 2, 
          y + cellSize / 2, 
          grid[i][j].component, 
          grid[i][j].orientation,
          cellSize * 0.8 // Size of component
        );
      }
    }
  }
  
  // Display instructions
  fill(0);
  noStroke();
  textSize(14);
  text("Press SPACE to generate a new circuit", 20, height - 20);
}

function keyPressed() {
  if (keyCode === 32) { // SPACE
    // Reset grid
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j] = {
          visited: false,
          walls: [true, true, true, true],
          component: null,
          orientation: Math.random() > 0.5 ? 0 : 1
        };
      }
    }
    
    // Regenerate maze
    generateMaze(0, 0);
    
    // Replace components
    placeComponents();
  }
}

// DFS maze generation algorithm
function generateMaze(x, y) {
  grid[x][y].visited = true;
  
  // Define directions: top, right, bottom, left
  const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ];
  
  // Shuffle directions for randomness
  shuffleArray(directions);
  
  for (let i = 0; i < directions.length; i++) {
    let nextX = x + directions[i][0];
    let nextY = y + directions[i][1];
    
    if (nextX >= 0 && nextX < cols && nextY >= 0 && nextY < rows && !grid[nextX][nextY].visited) {
      // Remove walls between current cell and next cell
      if (directions[i][0] === 0 && directions[i][1] === -1) { // Top
        grid[x][y].walls[0] = false;
        grid[nextX][nextY].walls[2] = false;
      } else if (directions[i][0] === 1 && directions[i][1] === 0) { // Right
        grid[x][y].walls[1] = false;
        grid[nextX][nextY].walls[3] = false;
      } else if (directions[i][0] === 0 && directions[i][1] === 1) { // Bottom
        grid[x][y].walls[2] = false;
        grid[nextX][nextY].walls[0] = false;
      } else if (directions[i][0] === -1 && directions[i][1] === 0) { // Left
        grid[x][y].walls[3] = false;
        grid[nextX][nextY].walls[1] = false;
      }
      
      // Continue recursively
      generateMaze(nextX, nextY);
    }
  }
}

// Place components throughout the circuit intelligently
function placeComponents() {
  // Start with a battery
  let batteryX = floor(random(cols));
  let batteryY = floor(random(rows));
  grid[batteryX][batteryY].component = COMPONENTS.BATTERY;
  
  // Add ground somewhere
  let groundX, groundY;
  do {
    groundX = floor(random(cols));
    groundY = floor(random(rows));
  } while (groundX === batteryX && groundY === batteryY);
  
  grid[groundX][groundY].component = COMPONENTS.GROUND;
  
  // Place other components in empty spots
  const componentCount = floor(cols * rows * 0.3); // Fill about 30% with components
  
  for (let i = 0; i < componentCount; i++) {
    let x, y;
    do {
      x = floor(random(cols));
      y = floor(random(rows));
    } while (grid[x][y].component !== null);
    
    // Check if this cell has at least one open wall (for connectivity)
    if (!grid[x][y].walls[0] || !grid[x][y].walls[1] || 
        !grid[x][y].walls[2] || !grid[x][y].walls[3]) {
      
      // Determine orientation based on which walls are open
      if (!grid[x][y].walls[0] && !grid[x][y].walls[2]) {
        grid[x][y].orientation = 1; // Vertical
      } else if (!grid[x][y].walls[1] && !grid[x][y].walls[3]) {
        grid[x][y].orientation = 0; // Horizontal
      }
      
      // Random component (except battery and ground which are already placed)
      const componentOptions = [
        COMPONENTS.RESISTOR, 
        COMPONENTS.CAPACITOR, 
        COMPONENTS.INDUCTOR,
        COMPONENTS.DIODE,
        COMPONENTS.SWITCH,
        COMPONENTS.LED,
        COMPONENTS.TRANSISTOR,
        COMPONENTS.WIRE
      ];
      grid[x][y].component = random(componentOptions);
    }
  }
}

// Draw electronic component at specified position with given orientation
function drawComponent(x, y, type, orientation, size) {
  push();
  translate(x, y);
  if (orientation === 1) {
    rotate(HALF_PI); // Rotate for vertical orientation
  }
  
  stroke(0);
  strokeWeight(1.5);
  
  const halfSize = size / 2;
  
  switch (type) {
    case COMPONENTS.RESISTOR:
      // Resistor zigzag symbol
      line(-halfSize, 0, -halfSize/2, 0);
      beginShape();
      vertex(-halfSize/2, 0);
      vertex(-halfSize/3, -size/6);
      vertex(-halfSize/6, size/6);
      vertex(0, -size/6);
      vertex(halfSize/6, size/6);
      vertex(halfSize/3, -size/6);
      vertex(halfSize/2, 0);
      endShape();
      line(halfSize/2, 0, halfSize, 0);
      break;
      
    case COMPONENTS.CAPACITOR:
      // Capacitor symbol
      line(-halfSize, 0, -size/8, 0);
      line(halfSize, 0, size/8, 0);
      line(-size/8, -size/4, -size/8, size/4);
      line(size/8, -size/4, size/8, size/4);
      break;
      
    case COMPONENTS.INDUCTOR:
      // Inductor/coil symbol
      line(-halfSize, 0, -size/3, 0);
      arc(-size/6, 0, size/6, size/3, -HALF_PI, PI+HALF_PI);
      arc(0, 0, size/6, size/3, -HALF_PI, PI+HALF_PI);
      arc(size/6, 0, size/6, size/3, -HALF_PI, PI+HALF_PI);
      line(size/3, 0, halfSize, 0);
      break;
      
    case COMPONENTS.DIODE:
      // Diode symbol
      line(-halfSize, 0, -size/6, 0);
      line(halfSize, 0, size/6, 0);
      beginShape();
      vertex(-size/6, -size/6);
      vertex(size/6, 0);
      vertex(-size/6, size/6);
      vertex(-size/6, -size/6);
      endShape(CLOSE);
      line(size/6, -size/6, size/6, size/6);
      break;
      
    case COMPONENTS.SWITCH:
      // Switch symbol
      line(-halfSize, 0, -size/6, 0);
      line(size/6, 0, halfSize, 0);
      line(-size/6, 0, size/6, -size/5);
      fill(255);
      ellipse(-size/6, 0, size/10);
      ellipse(size/6, 0, size/10);
      break;
      
    case COMPONENTS.BATTERY:
      // Battery symbol
      line(-halfSize, 0, -size/6, 0);
      line(size/6, 0, halfSize, 0);
      line(-size/6, -size/5, -size/6, size/5);
      line(-size/12, -size/3, -size/12, size/3);
      line(size/6, -size/6, size/6, size/6);
      break;
      
    case COMPONENTS.GROUND:
      // Ground symbol
      line(-size/16, 0, size/16, 0);
      line(0, 0, 0, size/6);
      line(-size/5, size/6, size/5, size/6);
      line(-size/6, size/4, size/6, size/4);
      line(-size/8, size/3, size/8, size/3);
      break;
      
    case COMPONENTS.LED:
      // LED symbol (diode with arrows)
      line(-halfSize, 0, -size/6, 0);
      line(halfSize, 0, size/6, 0);
      beginShape();
      vertex(-size/6, -size/6);
      vertex(size/6, 0);
      vertex(-size/6, size/6);
      vertex(-size/6, -size/6);
      endShape(CLOSE);
      line(size/6, -size/6, size/6, size/6);
      
      // Light rays
      line(size/5, -size/5, size/3, -size/3);
      line(size/3, -size/5, size/3, -size/3);
      line(size/5, -size/3, size/3, -size/3);
      
      line(size/5, size/5, size/3, size/3);
      line(size/3, size/5, size/3, size/3);
      line(size/5, size/3, size/3, size/3);
      break;
      
    case COMPONENTS.TRANSISTOR:
      // Transistor symbol (NPN)
      line(-halfSize, 0, -size/6, 0);
      line(-size/6, -size/3, -size/6, size/3);
      line(-size/6, -size/6, size/6, -size/3);
      line(-size/6, size/6, size/6, size/3);
      line(size/6, -size/3, size/6, -halfSize);
      line(size/6, size/3, size/6, halfSize);
      
      // Base
      line(-size/6, 0, size/12, 0);
      break;
      
    case COMPONENTS.WIRE:
      // Simple wire/connection
      line(-halfSize, 0, halfSize, 0);
      break;
  }
  
  pop();
}

// Utility function to shuffle array in place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}