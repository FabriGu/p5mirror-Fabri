// parts of code adapted from Mimi's ICM class examples ->  https://editor.p5js.org/icm4.0/sketches/ZsjXSIVi0

// link on github pages
// https://fabrigu.github.io/Ims-2025-fg/

// video 
let cam;

// size of the pixelation 
let cellSz = 40;

// Current position of the cell being drawn (starts at 0, 0 top left)
let curX = 0;
let curY = 0;

// Parameters object for URL and storage
let paramsJson = {};

// Previously captured cells
let capturedCells = [];

function setup() {
  let canvas = createCanvas(640, 480);


   // Use the ID of the main element
    // used claude to figure this part out
   canvas.parent('canvas-container');
  
  cam = createCapture(VIDEO);
  cam.hide();

  // if have previously loaded cells get them from localstorage
  loadCapturedCells();
  
  // Get URL parameters (if any)
  let params = getUrlParams();
  
  if (params) {
    // Convert URL parameters to JSON and use them
    paramsJson = urlParamsToJson(params);
    
    // Set current position from URL parameters
    curX = parseInt(paramsJson.x) || 0;
    curY = parseInt(paramsJson.y) || 0;
  }
}

// Convert URL parameters to a JSON object
// taken from this website https://www.tutorialspoint.com/how-to-convert-url-parameters-to-json-in-javascript 
function urlParamsToJson(url) {
  const queryString = url.split('?')[1];
  if (!queryString) return {};
  
  return queryString.split('&').reduce((acc, param) => {
    const [key, value] = param.split('=');
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

// Get URL parameters from current window location
// help from Claude.ai
function getUrlParams() {
  let query = window.location.search;
  return query.length > 0 ? query : null;
}

// Load previously captured cells from localStorage
// help from Claude.ai
function loadCapturedCells() {
  const stored = localStorage.getItem('capturedCells');
  capturedCells = stored ? JSON.parse(stored) : [];
}

// Save a new cell to localStorage
// help from Claude.ai
function saveCellToStorage(x, y, r, g, b) {
  capturedCells.push({ x, y, r, g, b });
  localStorage.setItem('capturedCells', JSON.stringify(capturedCells));
}

function draw() {
  background(220);
  // first draw any cells we already got previously
  drawCapturedCells();
  
  // when camer ready
  // process cells 
  if (cam.loadedmetadata && frameCount > 30) { // Wait for camera to initialize
    cam.loadPixels();
    
    if (cam.pixels.length > 0) {
      processCurrentCell();
      
      noLoop();
      
      setTimeout(refreshPage, 100);
    }
  }
}

// Draw all previously captured cells
function drawCapturedCells() {
  for (let cell of capturedCells) {
    fill(cell.r, cell.g, cell.b);
    rect(cell.x, cell.y, cellSz, cellSz);
  }
}

// Process the current cell from the video


function processCurrentCell() {
  // Check if we're still within canvas bounds
  if (curX < width && curY < height) {
    // Calculate pixel index
    let i = (curY * width + curX) * 4;
    
    // Get RGB values from current position
    let r = cam.pixels[i];
    let g = cam.pixels[i + 1];
    let b = cam.pixels[i + 2];
    
    // Fill with the rgb values of the pixel
    fill(r, g, b);
    
    // Draw the current cell
    rect(curX, curY, cellSz, cellSz);
    
    // Save this cell to localStorage
    saveCellToStorage(curX, curY, r, g, b);
    
    // Calculate next position
    calculateNextPosition();
  }
}

// Calculate the next x,y position and update paramsJson
function calculateNextPosition() {
  // Move to next cell position
  curX += cellSz;
  
  // If reached end of row, move to next row
  if (curX >= width) {
    curX = 0;
    curY += cellSz;
  }
  
  // Reset if entire canvas is filled
  if (curY >= height) {
    curX = 0;
    curY = 0;

    // localStorage.removeItem('capturedCells');
    // capturedCells = [];
  }
  
  // Update parameters for next refresh
  paramsJson.x = curX;
  paramsJson.y = curY;
}

// Open a new page with updated parameters
// got from W3 schools documentation -> https://www.w3schools.com/jsref/met_win_open.asp
function refreshPage() {
  const baseUrl = window.location.pathname;
  const queryParams = `?x=${paramsJson.x}&y=${paramsJson.y}`;
  window.location.href = baseUrl + queryParams;
}