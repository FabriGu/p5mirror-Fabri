// L-System Fractal Visualization
// This sketch implements an interactive L-system generator with multiple presets

let axiom = "F";             // Starting string
let sentence = axiom;        // Current string after iterations
let rules = [];              // Replacement rules
let len = 100;               // Initial length of segments
let angle = 25;              // Rotation angle in degrees
let iterations = 2;          // Number of iterations/recursion depth
let startingPos;             // Starting position for drawing
let drawingOffset = { x: 0, y: 0 }; // For panning the drawing
let scale = 1.0;             // For zooming
let isDragging = false;      // For panning control
let dragStart = { x: 0, y: 0 };
let autoZoom = true;         // Automatically fit drawing to screen
let drawingWidth = 0;        // Width of the current drawing
let drawingHeight = 0;       // Height of the current drawing
let drawingBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 }; // For auto-zoom calculation

// Color and stroke settings
let strokeColor = '#FFFFFF';
let bgColor = '#121212';
let strokeWeight = 1.5;
let leafColor = '#4CAF50';
let showLeaves = true;
let leafSize = 8;

// System presets
const presets = {
  'dragon-curve': {
    axiom: "FX",
    rules: [
      { a: "X", b: "X+YF+" },
      { a: "Y", b: "-FX-Y" }
    ],
    angle: 90,
    iterations: 8,
    description: "The Dragon Curve fractal"
  },
  'plant-a': {
    axiom: "F",
    rules: [
      { a: "F", b: "FF+[+F-F-F]-[-F+F+F]" }
    ],
    angle: 25,
    iterations: 3,
    description: "A plant-like structure with branching"
  },
  'plant-b': {
    axiom: "X",
    rules: [
      { a: "X", b: "F+[[X]-X]-F[-FX]+X" },
      { a: "F", b: "FF" }
    ],
    angle: 22.5,
    iterations: 4,
    description: "Detailed plant structure (Barnsley Fern-like)"
  },
  'sierpinski': {
    axiom: "F-G-G",
    rules: [
      { a: "F", b: "F-G+F+G-F" },
      { a: "G", b: "GG" }
    ],
    angle: 120,
    iterations: 4,
    description: "Sierpinski triangle"
  },
  'koch-curve': {
    axiom: "F",
    rules: [
      { a: "F", b: "F+F-F-F+F" }
    ],
    angle: 90,
    iterations: 3,
    description: "Koch curve (a snowflake-like fractal)"
  },
  'hilbert': {
    axiom: "X",
    rules: [
      { a: "X", b: "-YF+XFX+FY-" },
      { a: "Y", b: "+XF-YFY-FX+" }
    ],
    angle: 90,
    iterations: 4,
    description: "Hilbert space-filling curve"
  },
  'gosper': {
    axiom: "F",
    rules: [
      { a: "F", b: "F+G++G-F--FF-G+" },
      { a: "G", b: "-F+GG++G+F--F-G" }
    ],
    angle: 60,
    iterations: 3,
    description: "Gosper curve (flowsnake)"
  },
  'crystal': {
    axiom: "F+F+F+F",
    rules: [
      { a: "F", b: "FF+F++F+F" }
    ],
    angle: 90,
    iterations: 3,
    description: "A crystal-like pattern"
  },
  'custom': {
    axiom: "F",
    rules: [
      { a: "F", b: "F[+F]F[-F]F" }
    ],
    angle: 25,
    iterations: 3,
    description: "Custom rule (editable)"
  }
};

let currentPreset = 'plant-a';
let gui, showUI = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  startingPos = createVector(width / 2, height * 0.8);
  
  // Set default parameters
  loadPreset(currentPreset);
  
  // Create the UI
  createGUI();
}

function draw() {
  background(bgColor);
  
  // Apply transformations
  push();
  translate(width/2 + drawingOffset.x, height/2 + drawingOffset.y);
  // scale(scale);
  translate(-width/2, -height/2);
  
  // Calculate turtle position and draw the L-system
  drawLSystem();
  
  pop();
  
  // Draw UI information
  if (showUI) {
    fill(255);
    noStroke();
    textAlign(LEFT);
    textSize(14);
    text(`Iterations: ${iterations} | Angle: ${angle}° | Rules: ${rules.length}`, 20, height - 20);
    text(`Total segments: ${countSegments(sentence)}`, 20, height - 40);
  }
}

function drawLSystem() {
  // Reset drawing bounds for auto-zoom
  drawingBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  
  push(); // Save the current transformation state
  
  // Start at the defined position
  translate(startingPos.x, startingPos.y);
  
  // Update bounds with the starting position
  updateBounds(startingPos.x, startingPos.y);
  
  // Stack for saving positions and angles
  let stack = [];
  
  // Set drawing style
  stroke(strokeColor);
  // strokeWeight(this.strokeWeight);
  
  // Current drawing parameters
  let currentLength = len;
  let segmentsDrawn = 0;
  
  // Process each character in the sentence
  for (let i = 0; i < sentence.length; i++) {
    let c = sentence.charAt(i);
    
    switch (c) {
      case 'F': // Move forward and draw a line
      case 'G': // Same as F, used in some L-systems to have different meanings
        line(0, 0, 0, -currentLength);
        updateBounds(0, 0);
        updateBounds(0, -currentLength);
        translate(0, -currentLength);
        segmentsDrawn++;
        break;
        
      case 'f': // Move forward without drawing
        translate(0, -currentLength);
        updateBounds(0, -currentLength);
        break;
        
      case '+': // Rotate left
        rotate(angle);
        break;
        
      case '-': // Rotate right
        rotate(-angle);
        break;
        
      case '[': // Save current state
        push();
        stack.push({ x: 0, y: 0, angle: 0 });
        break;
        
      case ']': // Restore saved state and optionally draw a leaf
        if (showLeaves) {
          // Draw a leaf at the end of branches
          noStroke();
          fill(leafColor);
          ellipse(0, 0, leafSize, leafSize * 1.5);
          stroke(strokeColor);
          // strokeWeight(this.strokeWeight);
        }
        pop();
        stack.pop();
        break;
    }
  }
  
  pop(); // Restore the original transformation state
  
  // Update drawing dimensions
  drawingWidth = drawingBounds.maxX - drawingBounds.minX;
  drawingHeight = drawingBounds.maxY - drawingBounds.minY;
  
  // Auto-zoom if enabled
  if (autoZoom && drawingWidth > 0 && drawingHeight > 0) {
    // Calculate scale to fit the canvas with some margin
    let margin = 50;
    let scaleX = (width - margin*2) / drawingWidth;
    let scaleY = (height - margin*2) / drawingHeight;
    scale = min(scaleX, scaleY, 3); // Limit zoom to 3x
    
    // Center the drawing
    let centerX = (drawingBounds.minX + drawingBounds.maxX) / 2;
    let centerY = (drawingBounds.minY + drawingBounds.maxY) / 2;
    drawingOffset.x = width/2 - centerX;
    drawingOffset.y = height/2 - centerY;
    
    // Disable auto-zoom after first calculation to allow manual adjustment
    autoZoom = false;
  }
}

function updateBounds(x, y) {
  // Get the current transformation matrix
  let matrix = drawingContext.getTransform();
  
  // Apply the transformation to the point
  let screenX = matrix.a * x + matrix.c * y + matrix.e;
  let screenY = matrix.b * x + matrix.d * y + matrix.f;
  
  // Update bounds
  drawingBounds.minX = min(drawingBounds.minX, screenX);
  drawingBounds.minY = min(drawingBounds.minY, screenY);
  drawingBounds.maxX = max(drawingBounds.maxX, screenX);
  drawingBounds.maxY = max(drawingBounds.maxY, screenY);
}

function countSegments(s) {
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    if (s.charAt(i) === 'F' || s.charAt(i) === 'G') {
      count++;
    }
  }
  return count;
}

function generateLSystem() {
  // Reset to the axiom
  sentence = axiom;
  
  // Apply rules for the specified number of iterations
  for (let n = 0; n < iterations; n++) {
    let nextSentence = '';
    
    // Process each character
    for (let i = 0; i < sentence.length; i++) {
      let current = sentence.charAt(i);
      let found = false;
      
      // Check if there's a rule for this character
      for (let j = 0; j < rules.length; j++) {
        if (current === rules[j].a) {
          nextSentence += rules[j].b;
          found = true;
          break;
        }
      }
      
      // If no rule found, keep the character as is
      if (!found) {
        nextSentence += current;
      }
    }
    
    sentence = nextSentence;
  }
  
  // Enable auto-zoom for the new drawing
  autoZoom = true;
}

function loadPreset(presetName) {
  if (presets[presetName]) {
    const preset = presets[presetName];
    axiom = preset.axiom;
    rules = [...preset.rules]; // Create a copy of the rules
    angle = preset.angle;
    iterations = preset.iterations;
    currentPreset = presetName;
    
    // Generate the L-system with these settings
    generateLSystem();
    
    // Update UI if it exists
    updateUIControls();
  }
}

function createGUI() {
  // Remove existing GUI if it exists
  if (gui) gui.remove();
  
  // Create GUI container
  gui = createDiv();
  gui.position(20, 20);
  gui.style('background-color', 'rgba(0,0,0,0.7)');
  gui.style('padding', '15px');
  gui.style('border-radius', '10px');
  gui.style('color', 'white');
  gui.style('max-height', '80vh');
  gui.style('overflow-y', 'auto');
  gui.style('width', '280px');
  
  // Title
  let title = createP('L-System Fractal Generator');
  title.parent(gui);
  title.style('margin', '0 0 10px 0');
  title.style('font-weight', 'bold');
  title.style('font-size', '18px');
  
  // Preset selection
  createP('Preset:').parent(gui);
  let presetSelect = createSelect();
  presetSelect.parent(gui);
  presetSelect.style('width', '100%');
  presetSelect.style('margin-bottom', '15px');
  presetSelect.style('padding', '5px');
  
  // Add all presets to the dropdown
  for (let key in presets) {
    presetSelect.option(key + ' - ' + presets[key].description, key);
  }
  
  presetSelect.selected(currentPreset);
  presetSelect.changed(() => {
    loadPreset(presetSelect.value());
  });
  
  // Iterations slider
  createP('Iterations:').parent(gui);
  let iterSlider = createSlider(1, 8, iterations, 1);
  iterSlider.parent(gui);
  iterSlider.style('width', '100%');
  iterSlider.input(() => {
    iterations = iterSlider.value();
    generateLSystem();
  });
  
  // Angle slider
  createP('Angle (degrees):').parent(gui);
  let angleSlider = createSlider(1, 180, angle, 1);
  angleSlider.parent(gui);
  angleSlider.style('width', '100%');
  angleSlider.input(() => {
    angle = angleSlider.value();
    generateLSystem();
  });
  
  // Length slider
  createP('Segment Length:').parent(gui);
  let lenSlider = createSlider(1, 100, len, 1);
  lenSlider.parent(gui);
  lenSlider.style('width', '100%');
  lenSlider.input(() => {
    len = lenSlider.value();
  });
  
  // Leaf settings
  let leafDiv = createDiv();
  leafDiv.parent(gui);
  leafDiv.style('margin', '10px 0');
  
  let leafCheckbox = createCheckbox('Show Leaves', showLeaves);
  leafCheckbox.parent(leafDiv);
  leafCheckbox.changed(() => {
    showLeaves = leafCheckbox.checked();
  });
  
  createP('Leaf Size:').parent(gui);
  let leafSizeSlider = createSlider(1, 20, leafSize, 1);
  leafSizeSlider.parent(gui);
  leafSizeSlider.style('width', '100%');
  leafSizeSlider.input(() => {
    leafSize = leafSizeSlider.value();
  });
  
  // Color settings
  createP('Colors:').parent(gui);
  
  let lineColorPicker = createColorPicker(strokeColor);
  lineColorPicker.parent(gui);
  lineColorPicker.style('margin-right', '10px');
  lineColorPicker.input(() => {
    strokeColor = lineColorPicker.value();
  });
  createSpan('Line').parent(gui);
  
  let bgColorPicker = createColorPicker(bgColor);
  bgColorPicker.parent(gui);
  bgColorPicker.style('margin', '0 10px 0 10px');
  bgColorPicker.input(() => {
    bgColor = bgColorPicker.value();
  });
  createSpan('Background').parent(gui);
  
  let leafColorPicker = createColorPicker(leafColor);
  leafColorPicker.parent(gui);
  leafColorPicker.style('margin', '10px 10px 0 0');
  leafColorPicker.input(() => {
    leafColor = leafColorPicker.value();
  });
  createSpan('Leaf').parent(gui);
  
  // Stroke weight
  createP('Line Thickness:').parent(gui);
  let strokeSlider = createSlider(0.5, 5, strokeWeight, 0.5);
  strokeSlider.parent(gui);
  strokeSlider.style('width', '100%');
  strokeSlider.input(() => {
    strokeWeight = strokeSlider.value();
  });
  
  // Rule editing section
  let ruleDiv = createDiv();
  ruleDiv.parent(gui);
  ruleDiv.style('margin-top', '15px');
  ruleDiv.style('padding-top', '10px');
  ruleDiv.style('border-top', '1px solid #555');
  
  createP('Axiom:').parent(ruleDiv);
  let axiomInput = createInput(axiom);
  axiomInput.parent(ruleDiv);
  axiomInput.style('width', '100%');
  axiomInput.input(() => {
    axiom = axiomInput.value();
  });
  
  // Create rule inputs
  createP('Rules:').parent(ruleDiv);
  let rulesContainer = createDiv();
  rulesContainer.id('rules-container');
  rulesContainer.parent(ruleDiv);
  
  // Function to update rule inputs
  function updateRuleInputs() {
    // Clear existing rules
    rulesContainer.html('');
    
    // Create inputs for each rule
    for (let i = 0; i < rules.length; i++) {
      let ruleGroup = createDiv();
      ruleGroup.parent(rulesContainer);
      ruleGroup.style('display', 'flex');
      ruleGroup.style('margin-bottom', '5px');
      
      let aInput = createInput(rules[i].a);
      aInput.parent(ruleGroup);
      aInput.style('width', '15%');
      aInput.input(() => {
        rules[i].a = aInput.value();
      });
      
      createSpan(' → ').parent(ruleGroup);
      createSpan(' → ').style('margin', '0 5px');
      
      let bInput = createInput(rules[i].b);
      bInput.parent(ruleGroup);
      bInput.style('width', '70%');
      bInput.input(() => {
        rules[i].b = bInput.value();
      });
      
      // Delete rule button
      let deleteButton = createButton('×');
      deleteButton.parent(ruleGroup);
      deleteButton.style('margin-left', '5px');
      deleteButton.mousePressed(() => {
        rules.splice(i, 1);
        updateRuleInputs();
      });
    }
  }
  
  // Add rule button
  let addButton = createButton('Add Rule');
  addButton.parent(ruleDiv);
  addButton.style('margin-top', '10px');
  addButton.style('width', '100%');
  addButton.mousePressed(() => {
    rules.push({ a: 'X', b: 'FX' });
    updateRuleInputs();
  });
  
  // Apply changes button
  let applyButton = createButton('Apply Changes');
  applyButton.parent(ruleDiv);
  applyButton.style('margin-top', '10px');
  applyButton.style('width', '100%');
  applyButton.style('background-color', '#4CAF50');
  applyButton.style('color', 'white');
  applyButton.style('border', 'none');
  applyButton.style('padding', '8px');
  applyButton.mousePressed(() => {
    generateLSystem();
  });
  
  // Reset view button
  let resetViewButton = createButton('Reset View');
  resetViewButton.parent(gui);
  resetViewButton.style('margin-top', '15px');
  resetViewButton.style('width', '100%');
  resetViewButton.mousePressed(() => {
    drawingOffset = { x: 0, y: 0 };
    scale = 1.0;
    autoZoom = true;
  });
  
  // Save button
  let saveButton = createButton('Save Image (S)');
  saveButton.parent(gui);
  saveButton.style('margin-top', '10px');
  saveButton.style('width', '100%');
  saveButton.mousePressed(() => {
    saveCanvas('l-system-fractal', 'png');
  });
  
  // Instructions
  let instructions = createP(
    'Controls:<br>' +
    'Drag: Pan the view<br>' +
    'Mouse wheel: Zoom in/out<br>' +
    'H key: Toggle controls<br>' +
    'S key: Save image'
  );
  instructions.parent(gui);
  instructions.style('font-size', '12px');
  instructions.style('margin-top', '10px');
  
  // Update rule inputs to reflect current rules
  updateRuleInputs();
}

function updateUIControls() {
  if (!gui) return;
  
  // Update preset dropdown
  let presetSelect = gui.elt.querySelector('select');
  if (presetSelect) presetSelect.value = currentPreset;
  
  // Update iteration slider
  let iterSlider = gui.elt.querySelectorAll('input[type="range"]')[0];
  if (iterSlider) iterSlider.value = iterations;
  
  // Update angle slider
  let angleSlider = gui.elt.querySelectorAll('input[type="range"]')[1];
  if (angleSlider) angleSlider.value = angle;
  
  // Update axiom input
  let axiomInput = gui.elt.querySelectorAll('input[type="text"]')[0];
  if (axiomInput) axiomInput.value = axiom;
  
  // Update rule inputs
  let rulesContainer = select('#rules-container');
  if (rulesContainer) {
    rulesContainer.html('');
    
    for (let i = 0; i < rules.length; i++) {
      let ruleGroup = createDiv();
      ruleGroup.parent(rulesContainer);
      ruleGroup.style('display', 'flex');
      ruleGroup.style('margin-bottom', '5px');
      
      let aInput = createInput(rules[i].a);
      aInput.parent(ruleGroup);
      aInput.style('width', '15%');
      aInput.input(() => {
        rules[i].a = aInput.value();
      });
      
      createSpan(' → ').parent(ruleGroup);
      createSpan(' → ').style('margin', '0 5px');
      
      let bInput = createInput(rules[i].b);
      bInput.parent(ruleGroup);
      bInput.style('width', '70%');
      bInput.input(() => {
        rules[i].b = bInput.value();
      });
      
      let deleteButton = createButton('×');
      deleteButton.parent(ruleGroup);
      deleteButton.style('margin-left', '5px');
      deleteButton.mousePressed(() => {
        rules.splice(i, 1);
        updateUIControls(); // Recursive update
      });
    }
  }
}

function mousePressed() {
  if (!isOverUI() && !isDragging) {
    isDragging = true;
    dragStart.x = mouseX;
    dragStart.y = mouseY;
  }
}

function mouseDragged() {
  if (isDragging) {
    drawingOffset.x += (mouseX - dragStart.x);
    drawingOffset.y += (mouseY - dragStart.y);
    dragStart.x = mouseX;
    dragStart.y = mouseY;
  }
}

function mouseReleased() {
  isDragging = false;
}

function mouseWheel(event) {
  if (!isOverUI()) {
    // Change scale based on mouse wheel direction
    let scaleFactor = event.delta > 0 ? 0.9 : 1.1;
    
    // Get mouse position before scaling
    let mouseXRelToCenter = mouseX - width/2;
    let mouseYRelToCenter = mouseY - height/2;
    
    // Adjust scale
    scale *= scaleFactor;
    
    // Constrain scale to reasonable limits
    scale = constrain(scale, 0.1, 10);
    
    // Adjust pan to zoom toward mouse position
    drawingOffset.x = mouseXRelToCenter + (drawingOffset.x - mouseXRelToCenter) * scaleFactor;
    drawingOffset.y = mouseYRelToCenter + (drawingOffset.y - mouseYRelToCenter) * scaleFactor;
    
    return false; // Prevent default scrolling
  }
}

function keyPressed() {
  // Toggle UI visibility with 'h' key
  if (key === 'h' || key === 'H') {
    showUI = !showUI;
    gui.style('display', showUI ? 'block' : 'none');
  }
  
  // Save canvas with 's' key
  if (key === 's' || key === 'S') {
    saveCanvas('l-system-fractal', 'png');
  }
}

function isOverUI() {
  // Check if mouse is over UI elements
  if (showUI && gui) {
    let bounds = gui.elt.getBoundingClientRect();
    return (
      mouseX > bounds.left && 
      mouseX < bounds.right && 
      mouseY > bounds.top && 
      mouseY < bounds.bottom
    );
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  startingPos = createVector(width / 2, height * 0.8);
  autoZoom = true; // Re-calculate zoom on resize
}