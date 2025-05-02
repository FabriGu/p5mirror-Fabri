// Enhanced Sandpiles Simulation
// Based on Daniel Shiffman's code (http://codingtra.in)
// Modified for fullscreen and simplified export

// Configuration object for easy customization
const config = {
  // Simulation parameters
  initialSand: 1000000000,
  topplePerFrame: 50,
  
  // Pattern size control
  patternSize: 1.0, // Scale factor for pattern size (1.0 = normal)
  pixelSize: 1,     // Size of each "pixel" cell (1 = normal, higher = bigger pixels)
  
  // Colors [r, g, b]
  defaultColor: [255, 0, 255], // background/overflow color
  colors: [
    [255, 255, 0],  // 0 grains
    [0, 185, 63],   // 1 grain
    [0, 104, 255],  // 2 grains
    [122, 0, 229]   // 3 grains
  ],
  
  // Simulation state
  isPaused: false,
  showUI: true
};

// Simulation variables
let sandpiles;
let nextpiles;
let exportButton;
let pauseButton;
let resetButton;
let uiToggleButton;

function setup() {
  // Create fullscreen canvas
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  
  // Initialize simulation
  initializeSimulation();
  
  // Create UI elements
  createUI();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reinitialize simulation when window is resized
  initializeSimulation();
}

function initializeSimulation() {
  // Calculate effective grid size based on pixel size
  const effectiveWidth = Math.floor(width / config.pixelSize);
  const effectiveHeight = Math.floor(height / config.pixelSize);
  
  // Initialize sandpiles arrays with adjusted dimensions
  sandpiles = new Array(effectiveWidth).fill().map(i => new Array(effectiveHeight).fill(0));
  nextpiles = new Array(effectiveWidth).fill().map(i => new Array(effectiveHeight).fill(0));
  
  // Set initial pile at center
  const centerX = Math.floor(effectiveWidth / 2);
  const centerY = Math.floor(effectiveHeight / 2);
  sandpiles[centerX][centerY] = config.initialSand;
  
  // Set background color
  background(config.defaultColor[0], config.defaultColor[1], config.defaultColor[2]);
}

function createUI() {
  // Create container div for UI elements
  const uiContainer = createDiv();
  uiContainer.id('ui-container');
  uiContainer.style('position', 'absolute');
  uiContainer.style('top', '10px');
  uiContainer.style('left', '10px');
  uiContainer.style('background-color', 'rgba(0, 0, 0, 0.7)');
  uiContainer.style('padding', '10px');
  uiContainer.style('border-radius', '5px');
  uiContainer.style('z-index', '100');
  
  // Create sandbox controls
  createP('Sandpile Controls').parent(uiContainer).style('color', 'white').style('margin', '5px 0');
  
  // Initial sand slider
  createSpan('Initial Sand: ').parent(uiContainer).style('color', 'white');
  const sandSlider = createSlider(1000, 10000000000, config.initialSand, 1000000);
  sandSlider.parent(uiContainer);
  sandSlider.input(() => {
    config.initialSand = sandSlider.value();
  });
  
  // Pattern size slider
  createP('').parent(uiContainer);
  createSpan('Pattern Size: ').parent(uiContainer).style('color', 'white');
  const sizeSlider = createSlider(0.1, 3.0, config.patternSize, 0.1);
  sizeSlider.parent(uiContainer);
  sizeSlider.input(() => {
    config.patternSize = sizeSlider.value();
  });
  
  // Pixel size slider
  createP('').parent(uiContainer);
  createSpan('Pixel Size: ').parent(uiContainer).style('color', 'white');
  const pixelSizeSlider = createSlider(1, 20, config.pixelSize, 1);
  pixelSizeSlider.parent(uiContainer);
  pixelSizeSlider.input(() => {
    // Store the old pixel size
    const oldPixelSize = config.pixelSize;
    config.pixelSize = pixelSizeSlider.value();
    
    // Only reinitialize if pixel size actually changed
    if (oldPixelSize !== config.pixelSize) {
      initializeSimulation();
    }
  });
  
  // Topple per frame slider
  createP('').parent(uiContainer);
  createSpan('Topples Per Frame: ').parent(uiContainer).style('color', 'white');
  const toppleSlider = createSlider(1, 200, config.topplePerFrame, 1);
  toppleSlider.parent(uiContainer);
  toppleSlider.input(() => {
    config.topplePerFrame = toppleSlider.value();
  });
  
  // Color pickers
  createP('Colors').parent(uiContainer).style('color', 'white').style('margin', '10px 0 5px 0');
  
  // Default color picker
  createSpan('Background: ').parent(uiContainer).style('color', 'white');
  const defaultColorPicker = createColorPicker(color(config.defaultColor));
  defaultColorPicker.parent(uiContainer);
  defaultColorPicker.input(() => {
    const c = defaultColorPicker.color().levels;
    config.defaultColor = [c[0], c[1], c[2]];
  });
  
  // Color pickers for each state
  createP('').parent(uiContainer);
  for (let i = 0; i < config.colors.length; i++) {
    createSpan(`State ${i}: `).parent(uiContainer).style('color', 'white');
    const picker = createColorPicker(color(config.colors[i]));
    picker.parent(uiContainer);
    picker.input(() => {
      const c = picker.color().levels;
      config.colors[i] = [c[0], c[1], c[2]];
    });
    createP('').parent(uiContainer);
  }
  
  // Create buttons
  pauseButton = createButton('Pause');
  pauseButton.parent(uiContainer);
  pauseButton.mousePressed(() => {
    config.isPaused = !config.isPaused;
    pauseButton.html(config.isPaused ? 'Resume' : 'Pause');
  });
  
  resetButton = createButton('Reset');
  resetButton.parent(uiContainer);
  resetButton.mousePressed(() => {
    initializeSimulation();
  });
  
  // Export button
  createP('').parent(uiContainer);
  exportButton = createButton('Save Image');
  exportButton.parent(uiContainer);
  exportButton.mousePressed(() => {
    saveCanvas('sandpile_' + Date.now(), 'png');
  });
  
  // UI toggle button (outside the container)
  uiToggleButton = createButton('Toggle UI');
  uiToggleButton.position(10, height - 40);
  uiToggleButton.mousePressed(() => {
    config.showUI = !config.showUI;
    uiContainer.style('display', config.showUI ? 'block' : 'none');
  });
  
  // Add help text
  const helpText = createP("Adjusting 'Pattern Size' changes the mandala size. Larger values create bigger patterns.<br>'Pixel Size' controls the resolution/blockiness of the image.");
  helpText.parent(uiContainer);
  helpText.style('color', 'white');
  helpText.style('font-size', '12px');
  helpText.style('margin-top', '10px');
}

function topple() {
  // Calculate effective dimensions
  const effectiveWidth = sandpiles.length;
  const effectiveHeight = sandpiles[0].length;
  
  // Copy current state to next state
  for (let x = 0; x < effectiveWidth; x++) {
    for (let y = 0; y < effectiveHeight; y++) {
      nextpiles[x][y] = sandpiles[x][y];
    }
  }
  
  // Perform toppling with pattern size control
  for (let x = 0; x < effectiveWidth; x++) {
    for (let y = 0; y < effectiveHeight; y++) {
      let num = sandpiles[x][y];
      if (num >= 4) {
        nextpiles[x][y] -= 4;
        
        // Calculate spread distance based on pattern size setting
        const spreadDistance = Math.max(1, Math.round(config.patternSize));
        
        // Apply the toppling with configured spread distance
        // Make sure we're not accessing outside the array bounds
        if (x + spreadDistance < effectiveWidth) 
          nextpiles[x + spreadDistance][y]++;
        if (x - spreadDistance >= 0) 
          nextpiles[x - spreadDistance][y]++;
        if (y + spreadDistance < effectiveHeight) 
          nextpiles[x][y + spreadDistance]++;
        if (y - spreadDistance >= 0) 
          nextpiles[x][y - spreadDistance]++;
      }
    }
  }
  
  // Swap arrays
  [sandpiles, nextpiles] = [nextpiles, sandpiles];
}

function renderSimple() {
  // Direct drawing approach with pixel size control
  background(config.defaultColor[0], config.defaultColor[1], config.defaultColor[2]);
  
  noStroke();
  
  // Calculate effective dimensions based on pixel size
  const effectiveWidth = sandpiles.length;
  const effectiveHeight = sandpiles[0].length;
  
  // Draw each cell as a rectangle with the configured pixel size
  for (let x = 0; x < effectiveWidth; x++) {
    for (let y = 0; y < effectiveHeight; y++) {
      const num = sandpiles[x][y];
      if (num >= 0 && num < 4) {
        const col = config.colors[num];
        fill(col[0], col[1], col[2]);
        rect(x * config.pixelSize, y * config.pixelSize, config.pixelSize, config.pixelSize);
      }
    }
  }
}

function draw() {
  // Only update if not paused
  if (!config.isPaused) {
    // Render current state using the simpler approach
    renderSimple();
    
    // Perform toppling multiple times per frame for faster simulation
    for (let i = 0; i < config.topplePerFrame; i++) {
      topple();
    }
  }
}