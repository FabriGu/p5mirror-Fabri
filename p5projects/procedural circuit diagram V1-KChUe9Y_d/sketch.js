// Function to save a high-resolution version of the canvas
function saveHighResolution() {
  // Create a high-resolution off-screen canvas
  let highResCnv = createGraphics(width * highResScale, height * highResScale);
  
  // Set up the high-res canvas
  highResCnv.background(240);
  highResMode = true;
  
  // Scale everything up for high resolution
  highResCnv.scale(highResScale);
  
  // Redraw the entire circuit on the high-res canvas
  // Draw grid and components
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * cellSize;
      let y = j * cellSize;
      
      // Draw walls if they exist
      highResCnv.stroke(selectedColor);
      highResCnv.strokeWeight(2);
      
      // Draw curved walls on high-res canvas
      if (grid[i][j].walls[0]) { // Top
        drawCurvedWallOnCanvas(highResCnv, x, y, x + cellSize, y, 0, grid[i][j].controlPoints.top);
      }
      if (grid[i][j].walls[1]) { // Right
        drawCurvedWallOnCanvas(highResCnv, x + cellSize, y, x + cellSize, y + cellSize, 1, grid[i][j].controlPoints.right);
      }
      if (grid[i][j].walls[2]) { // Bottom
        drawCurvedWallOnCanvas(highResCnv, x, y + cellSize, x + cellSize, y + cellSize, 2, grid[i][j].controlPoints.bottom);
      }
//       if (grid[i][j].walls[3]) { // Left
        // drawCurvedWallOnCanvas(// Procedural Circuit Diagram Generator
// This sketch creates a randomly generated circuit diagram that resembles a maze
// with properly connected electronic components
    }
  }
}
    

let grid = [];
let cellSize = 50;
let cols, rows;
let components = [];
let highResMode = false;
let highResScale = 4; // Scale factor for high-resolution export
let selectedColor; // Current color for circuit lines
let colorPalettes = [
  // Color palettes (R,G,B)
  [0, 0, 0],               // Black (Default)
  [41, 98, 255],           // Electric Blue
  [255, 89, 94],           // Coral Red
  [76, 175, 80],           // Circuit Green
  [156, 39, 176],          // Deep Purple
  [255, 152, 0],           // Amber
  [3, 169, 244],           // Light Blue
  [233, 30, 99],           // Pink
];
let currentPalette = 0;    // Start with black
let curveFactor = 0.3;     // How curvy the lines are (0 = straight, 1 = very curvy)

// Circuit components definitions
const COMPONENTS = {
  RESISTOR: 0,
  CAPACITOR: 1,
  // INDUCTOR removed
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
        orientation: Math.random() > 0.5 ? 0 : 1,
        // Control points for Bezier curves (if artistic mode)
        controlPoints: {
          top: { x: 0, y: 0 },
          right: { x: 0, y: 0 },
          bottom: { x: 0, y: 0 },
          left: { x: 0, y: 0 }
        }
      };
    }
  }
  
  // Set initial color
  selectedColor = colorPalettes[currentPalette];
  
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
      stroke(selectedColor);
      strokeWeight(2);
      
      // Draw curved walls instead of straight lines
      if (grid[i][j].walls[0]) { // Top
        drawCurvedWall(x, y, x + cellSize, y, 0, grid[i][j].controlPoints.top);
      }
      if (grid[i][j].walls[1]) { // Right
        drawCurvedWall(x + cellSize, y, x + cellSize, y + cellSize, 1, grid[i][j].controlPoints.right);
      }
      if (grid[i][j].walls[2]) { // Bottom
        drawCurvedWall(x, y + cellSize, x + cellSize, y + cellSize, 2, grid[i][j].controlPoints.bottom);
      }
      if (grid[i][j].walls[3]) { // Left
        drawCurvedWall(x, y, x, y + cellSize, 3, grid[i][j].controlPoints.left);
      }
      
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
  text("Press SPACE to generate a new circuit", 20, height - 60);
  text("Press 'S' to save as high-resolution image", 20, height - 40);
  text("Press 'C' to cycle through color palettes", 20, height - 20);
}

// Function to draw curved walls
function drawCurvedWall(x1, y1, x2, y2, direction, controlPoint) {
  // If control point is not set (0,0), calculate it
  if (controlPoint.x === 0 && controlPoint.y === 0) {
    // Different calculations based on wall direction
    if (direction === 0 || direction === 2) { // Top or bottom
      controlPoint.x = (x1 + x2) / 2;
      // Add some randomness to curve
      if (direction === 0) { // Top
        controlPoint.y = y1 - random(cellSize * curveFactor);
      } else { // Bottom
        controlPoint.y = y1 + random(cellSize * curveFactor);
      }
    } else { // Left or right
      controlPoint.y = (y1 + y2) / 2;
      // Add some randomness to curve
      if (direction === 3) { // Left
        controlPoint.x = x1 - random(cellSize * curveFactor);
      } else { // Right
        controlPoint.x = x1 + random(cellSize * curveFactor);
      }
    }
  }
  
  // Draw a quadratic curve
  noFill();
  beginShape();
  vertex(x1, y1);
  quadraticVertex(controlPoint.x, controlPoint.y, x2, y2);
  endShape();
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
          orientation: Math.random() > 0.5 ? 0 : 1,
          // Reset control points
          controlPoints: {
            top: { x: 0, y: 0 },
            right: { x: 0, y: 0 },
            bottom: { x: 0, y: 0 },
            left: { x: 0, y: 0 }
          }
        };
      }
    }
    
    // Regenerate maze
    generateMaze(0, 0);
    
    // Replace components
    placeComponents();
  }
  else if (key === 's' || key === 'S') {
    // Save high-resolution image
    saveHighResolution();
  }
  else if (key === 'c' || key === 'C') {
    // Cycle through color palettes
    currentPalette = (currentPalette + 1) % colorPalettes.length;
    selectedColor = colorPalettes[currentPalette];
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
      
      // Random component (except battery, ground, and inductor which we removed)
      const componentOptions = [
        COMPONENTS.RESISTOR, 
        COMPONENTS.CAPACITOR,
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
  
  stroke(selectedColor);
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
      // Simple wire/connection - make it slightly curved for artistic effect
      noFill();
      beginShape();
      vertex(-halfSize, 0);
      quadraticVertex(0, random(-size/6, size/6), halfSize, 0);
      endShape();
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

// Function to save a high-resolution version of the canvas
function saveHighResolution() {
  // Create a high-resolution off-screen canvas
  let highResCnv = createGraphics(width * highResScale, height * highResScale);
  
  // Set up the high-res canvas
  highResCnv.background(240);
  highResMode = true;
  
  // Scale everything up for high resolution
  highResCnv.scale(highResScale);
  
  // Redraw the entire circuit on the high-res canvas
  // Draw grid and components
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * cellSize;
      let y = j * cellSize;
      
      // Draw walls if they exist
      highResCnv.stroke(0);
      highResCnv.strokeWeight(2);
      
      if (grid[i][j].walls[0]) highResCnv.line(x, y, x + cellSize, y); // Top
      if (grid[i][j].walls[1]) highResCnv.line(x + cellSize, y, x + cellSize, y + cellSize); // Right
      if (grid[i][j].walls[2]) highResCnv.line(x, y + cellSize, x + cellSize, y + cellSize); // Bottom
      if (grid[i][j].walls[3]) highResCnv.line(x, y, x, y + cellSize); // Left
      
      // Draw component if it exists
      if (grid[i][j].component !== null) {
        drawComponentOnCanvas(
          highResCnv,
          x + cellSize / 2, 
          y + cellSize / 2, 
          grid[i][j].component, 
          grid[i][j].orientation,
          cellSize * 0.8 // Size of component
        );
      }
    }
  }
  
  // Save the high-res image
  highResCnv.save('circuit-diagram-' + Date.now() + '.png');
  
  // Clean up
  highResMode = false;
  highResCnv.remove();
}

// Modified version of drawComponent that can draw on a specified canvas
function drawComponentOnCanvas(canvas, x, y, type, orientation, size) {
  canvas.push();
  canvas.translate(x, y);
  if (orientation === 1) {
    canvas.rotate(HALF_PI); // Rotate for vertical orientation
  }
  
  canvas.stroke(0);
  canvas.strokeWeight(1.5);
  
  const halfSize = size / 2;
  
  switch (type) {
    case COMPONENTS.RESISTOR:
      // Resistor zigzag symbol
      canvas.line(-halfSize, 0, -halfSize/2, 0);
      canvas.beginShape();
      canvas.vertex(-halfSize/2, 0);
      canvas.vertex(-halfSize/3, -size/6);
      canvas.vertex(-halfSize/6, size/6);
      canvas.vertex(0, -size/6);
      canvas.vertex(halfSize/6, size/6);
      canvas.vertex(halfSize/3, -size/6);
      canvas.vertex(halfSize/2, 0);
      canvas.endShape();
      canvas.line(halfSize/2, 0, halfSize, 0);
      break;
      
    case COMPONENTS.CAPACITOR:
      // Capacitor symbol
      canvas.line(-halfSize, 0, -size/8, 0);
      canvas.line(halfSize, 0, size/8, 0);
      canvas.line(-size/8, -size/4, -size/8, size/4);
      canvas.line(size/8, -size/4, size/8, size/4);
      break;
      
    case COMPONENTS.INDUCTOR:
      // Inductor/coil symbol
      canvas.line(-halfSize, 0, -size/3, 0);
      canvas.arc(-size/6, 0, size/6, size/3, -HALF_PI, PI+HALF_PI);
      canvas.arc(0, 0, size/6, size/3, -HALF_PI, PI+HALF_PI);
      canvas.arc(size/6, 0, size/6, size/3, -HALF_PI, PI+HALF_PI);
      canvas.line(size/3, 0, halfSize, 0);
      break;
      
    case COMPONENTS.DIODE:
      // Diode symbol
      canvas.line(-halfSize, 0, -size/6, 0);
      canvas.line(halfSize, 0, size/6, 0);
      canvas.beginShape();
      canvas.vertex(-size/6, -size/6);
      canvas.vertex(size/6, 0);
      canvas.vertex(-size/6, size/6);
      canvas.vertex(-size/6, -size/6);
      canvas.endShape(CLOSE);
      canvas.line(size/6, -size/6, size/6, size/6);
      break;
      
    case COMPONENTS.SWITCH:
      // Switch symbol
      canvas.line(-halfSize, 0, -size/6, 0);
      canvas.line(size/6, 0, halfSize, 0);
      canvas.line(-size/6, 0, size/6, -size/5);
      canvas.fill(255);
      canvas.ellipse(-size/6, 0, size/10);
      canvas.ellipse(size/6, 0, size/10);
      break;
      
    case COMPONENTS.BATTERY:
      // Battery symbol
      canvas.line(-halfSize, 0, -size/6, 0);
      canvas.line(size/6, 0, halfSize, 0);
      canvas.line(-size/6, -size/5, -size/6, size/5);
      canvas.line(-size/12, -size/3, -size/12, size/3);
      canvas.line(size/6, -size/6, size/6, size/6);
      break;
      
    case COMPONENTS.GROUND:
      // Ground symbol
      canvas.line(-size/16, 0, size/16, 0);
      canvas.line(0, 0, 0, size/6);
      canvas.line(-size/5, size/6, size/5, size/6);
      canvas.line(-size/6, size/4, size/6, size/4);
      canvas.line(-size/8, size/3, size/8, size/3);
      break;
      
    case COMPONENTS.LED:
      // LED symbol (diode with arrows)
      canvas.line(-halfSize, 0, -size/6, 0);
      canvas.line(halfSize, 0, size/6, 0);
      canvas.beginShape();
      canvas.vertex(-size/6, -size/6);
      canvas.vertex(size/6, 0);
      canvas.vertex(-size/6, size/6);
      canvas.vertex(-size/6, -size/6);
      canvas.endShape(CLOSE);
      canvas.line(size/6, -size/6, size/6, size/6);
      
      // Light rays
      canvas.line(size/5, -size/5, size/3, -size/3);
      canvas.line(size/3, -size/5, size/3, -size/3);
      canvas.line(size/5, -size/3, size/3, -size/3);
      
      canvas.line(size/5, size/5, size/3, size/3);
      canvas.line(size/3, size/5, size/3, size/3);
      canvas.line(size/5, size/3, size/3, size/3);
      break;
      
    case COMPONENTS.TRANSISTOR:
      // Transistor symbol (NPN)
      canvas.line(-halfSize, 0, -size/6, 0);
      canvas.line(-size/6, -size/3, -size/6, size/3);
      canvas.line(-size/6, -size/6, size/6, -size/3);
      canvas.line(-size/6, size/6, size/6, size/3);
      canvas.line(size/6, -size/3, size/6, -halfSize);
      canvas.line(size/6, size/3, size/6, halfSize);
      
      // Base
      canvas.line(-size/6, 0, size/12, 0);
      break;
      
    case COMPONENTS.WIRE:
      // Simple wire/connection
      canvas.line(-halfSize, 0, halfSize, 0);
      break;
  }
  
  canvas.pop();
}