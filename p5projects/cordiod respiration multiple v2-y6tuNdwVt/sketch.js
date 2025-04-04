// Main sketch variables
let mandalas = [];
let showGlobalUI = true;
let activeMandalaSetting = null;

class Mandala {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.c = random(0, 2);
    this.divisions = 200;
    this.speed = 0.01;
    this.hueMin = 0;
    this.hueMax = 30;
    this.saturation = 80;
    this.brightness = 90;
    this.opacity = 70;
    this.isHovered = false;
    this.showSettings = false;
    this.settingsUI = null;
  }
  
  update() {
    // Update c value based on speed
    this.c += this.speed;
    
    // Reset if needed to prevent performance issues
    if (this.c > this.divisions * 10) {
      this.c = this.c % this.divisions;
    }
    
    // Check if mouse is hovering over this mandala
    let d = dist(mouseX, mouseY, this.x, this.y);
    this.isHovered = d < this.radius;
    
    // Show settings if this is the active mandala being hovered
    if (this.isHovered && activeMandalaSetting === null) {
      activeMandalaSetting = this;
      this.showSettings = true;
      this.createSettingsUI();
    } else if (!this.isHovered && activeMandalaSetting === this) {
      activeMandalaSetting = null;
      this.showSettings = false;
      this.removeSettingsUI();
    }
  }
  
  draw() {
    push(); // Save current drawing state
    
    translate(this.x, this.y); // Center at mandala position
    
    // Calculate points around the circle
    let points = [];
    for (let i = 0; i < this.divisions; i++) {
      let angle = map(i, 0, this.divisions, 0, TWO_PI);
      let x = this.radius * cos(angle);
      let y = this.radius * sin(angle);
      points.push({x, y});
    }
    
    // Draw lines between points based on our formula y = (x*c) % divisions
    for (let i = 0; i < this.divisions; i++) {
      // Calculate the target point using the formula
      let j = floor((i * this.c) % this.divisions);
      
      // Use HSB color mode for smooth color transitions
      colorMode(HSB, 100);
      
      // Map the hue to specified range
      let hueRange = this.hueMax - this.hueMin;
      let colorOffset = (frameCount * 0.5) % 100;
      let hue = this.hueMin + ((i / this.divisions * hueRange + colorOffset) % hueRange);
      
      stroke(hue, this.saturation, this.brightness, this.opacity);
      
      // Draw the line
      line(points[i].x, points[i].y, points[j].x, points[j].y);
    }
    
    // Display the current c value
    colorMode(RGB);
    
    // Highlight border if hovered
    if (this.isHovered) {
      noFill();
      stroke(255, 100);
      ellipse(0, 0, this.radius * 2);
    }
    
    // Show mandala info if hovered or settings are open
    if (this.isHovered || this.showSettings) {
      fill(0, 200);
      noStroke();
      rect(-50, -this.radius - 40, 100, 30, 5);
      
      fill(255);
      textAlign(CENTER);
      textSize(12);
      text(`c = ${this.c.toFixed(2)} | speed = ${this.speed.toFixed(3)}`, 0, -this.radius - 20);
    }
    
    pop(); // Restore previous drawing state
  }
  
  createSettingsUI() {
    // Remove any existing UI
    this.removeSettingsUI();
    
    // Create container
    this.settingsUI = createDiv();
    this.settingsUI.position(this.x + this.radius + 20, this.y - 150);
    this.settingsUI.style('background-color', 'rgba(0,0,0,0.8)');
    this.settingsUI.style('padding', '10px');
    this.settingsUI.style('border-radius', '8px');
    this.settingsUI.style('color', 'white');
    this.settingsUI.style('width', '180px');
    
    // Title
    let title = createP('Mandala Settings');
    title.parent(this.settingsUI);
    title.style('margin', '0 0 10px 0');
    title.style('font-weight', 'bold');
    
    // Hue Min slider
    createP('Hue Min:').parent(this.settingsUI);
    let hueMinSlider = createSlider(0, 100, this.hueMin);
    hueMinSlider.parent(this.settingsUI);
    hueMinSlider.style('width', '160px');
    hueMinSlider.input(() => { this.hueMin = hueMinSlider.value(); });
    
    // Hue Max slider
    createP('Hue Max:').parent(this.settingsUI);
    let hueMaxSlider = createSlider(0, 100, this.hueMax);
    hueMaxSlider.parent(this.settingsUI);
    hueMaxSlider.style('width', '160px');
    hueMaxSlider.input(() => { this.hueMax = hueMaxSlider.value(); });
    
    // Saturation slider
    createP('Saturation:').parent(this.settingsUI);
    let satSlider = createSlider(0, 100, this.saturation);
    satSlider.parent(this.settingsUI);
    satSlider.style('width', '160px');
    satSlider.input(() => { this.saturation = satSlider.value(); });
    
    // Brightness slider
    createP('Brightness:').parent(this.settingsUI);
    let brightSlider = createSlider(0, 100, this.brightness);
    brightSlider.parent(this.settingsUI);
    brightSlider.style('width', '160px');
    brightSlider.input(() => { this.brightness = brightSlider.value(); });
    
    // Opacity slider
    createP('Opacity:').parent(this.settingsUI);
    let opacitySlider = createSlider(10, 100, this.opacity);
    opacitySlider.parent(this.settingsUI);
    opacitySlider.style('width', '160px');
    opacitySlider.input(() => { this.opacity = opacitySlider.value(); });
    
    // Speed slider
    createP('Evolution Speed:').parent(this.settingsUI);
    let speedSlider = createSlider(0.001, 0.05, this.speed, 0.001);
    speedSlider.parent(this.settingsUI);
    speedSlider.style('width', '160px');
    speedSlider.input(() => { this.speed = speedSlider.value(); });
    
    // Divisions slider
    createP('Divisions:').parent(this.settingsUI);
    let divSlider = createSlider(50, 400, this.divisions, 10);
    divSlider.parent(this.settingsUI);
    divSlider.style('width', '160px');
    divSlider.input(() => { this.divisions = divSlider.value(); });
    
    // Delete button
    let deleteButton = createButton('Delete This Mandala');
    deleteButton.parent(this.settingsUI);
    deleteButton.style('margin-top', '10px');
    deleteButton.style('width', '100%');
    deleteButton.style('background-color', '#ff4444');
    deleteButton.style('color', 'white');
    deleteButton.style('border', 'none');
    deleteButton.style('padding', '5px');
    deleteButton.style('border-radius', '4px');
    deleteButton.mousePressed(() => { 
      this.removeSettingsUI();
      mandalas = mandalas.filter(m => m !== this);
      activeMandalaSetting = null;
    });
  }
  
  removeSettingsUI() {
    if (this.settingsUI) {
      this.settingsUI.remove();
      this.settingsUI = null;
    }
  }
  
  applyWheelChange(delta) {
    this.speed = constrain(this.speed + delta * 0.0005, 0.001, 0.05);
  }
}

// UI state
let isCreatingMandala = false;
let startX, startY;
let currentRadius = 0;
let globalUI;

function setup() {
  createCanvas(800, 800);
  strokeWeight(0.5);
  
  // Create initial mandala in the center
  mandalas.push(new Mandala(width/2, height/2, 300));
  
  // Create global UI
  createGlobalUI();
}

function createGlobalUI() {
  // Remove existing UI if present
  if (globalUI) globalUI.remove();
  
  // Container for controls
  globalUI = createDiv();
  globalUI.position(20, 20);
  globalUI.style('background-color', 'rgba(0,0,0,0.7)');
  globalUI.style('padding', '10px');
  globalUI.style('border-radius', '10px');
  globalUI.style('color', 'white');
  
  // Title
  let title = createP('Global Controls');
  title.parent(globalUI);
  title.style('margin', '0 0 10px 0');
  
  // Clear button
  let clearButton = createButton('Clear All Mandalas');
  clearButton.parent(globalUI);
  clearButton.style('margin-top', '10px');
  clearButton.style('width', '100%');
  clearButton.mousePressed(() => { 
    mandalas.forEach(m => m.removeSettingsUI());
    mandalas = [];
    activeMandalaSetting = null;
  });
  
  // Save button
  let saveButton = createButton('Save Canvas (S)');
  saveButton.parent(globalUI);
  saveButton.style('margin-top', '10px');
  saveButton.style('width', '100%');
  saveButton.mousePressed(() => { saveCanvas('mandalas', 'png'); });
  
  // Instructions
  let instructions = createP(
    'Click and drag: Create new mandalas<br>' +
    'Hover: Show mandala controls<br>' +
    'H key: Toggle this menu<br>' +
    'Mouse wheel: Change speed of hovered mandala'
  );
  instructions.parent(globalUI);
  instructions.style('font-size', '12px');
  instructions.style('margin-top', '10px');
}

function draw() {
  background(10, 10, 30, 25); // Slightly transparent background for trailing effect
  
  // Update and draw all existing mandalas
  for (let mandala of mandalas) {
    mandala.update();
    mandala.draw();
  }
  
  // Draw preview of new mandala being created
  if (isCreatingMandala) {
    noFill();
    stroke(255, 150);
    ellipse(startX, startY, currentRadius * 2);
    
    // Show radius value
    fill(255);
    noStroke();
    text(`Radius: ${floor(currentRadius)}`, startX + currentRadius + 10, startY);
  }
  
  // Show/hide global UI
  if (globalUI) {
    globalUI.style('display', showGlobalUI ? 'block' : 'none');
  }
}

function mousePressed() {
  // Check if we're over the UI
  if (isOverUI()) return;
  
  // Start creating a new mandala
  isCreatingMandala = true;
  startX = mouseX;
  startY = mouseY;
  currentRadius = 0;
}

function mouseDragged() {
  if (isCreatingMandala) {
    // Calculate radius based on distance from start point
    let dx = mouseX - startX;
    let dy = mouseY - startY;
    currentRadius = sqrt(dx*dx + dy*dy);
  }
}

function mouseReleased() {
  if (isCreatingMandala && currentRadius > 20) { // Minimum size threshold
    // Add the new mandala
    mandalas.push(new Mandala(startX, startY, currentRadius));
  }
  isCreatingMandala = false;
}

function mouseWheel(event) {
  // Apply wheel changes to the hovered mandala
  for (let mandala of mandalas) {
    if (mandala.isHovered) {
      mandala.applyWheelChange(event.delta);
      return false; // Prevent default scrolling
    }
  }
}

function keyPressed() {
  // Toggle UI visibility with 'h' key
  if (key === 'h' || key === 'H') {
    showGlobalUI = !showGlobalUI;
  }
  
  // Save canvas with 's' key
  if (key === 's' || key === 'S') {
    saveCanvas('mandalas', 'png');
  }
}

function isOverUI() {
  // Check if mouse is over global UI
  if (showGlobalUI && mouseX < 200 && mouseY < 250) {
    return true;
  }
  
  // Check if mouse is over any mandala's settings UI
  for (let mandala of mandalas) {
    if (mandala.settingsUI) {
      // Simple bounding box check
      let bounds = mandala.settingsUI.elt.getBoundingClientRect();
      if (mouseX > bounds.left && mouseX < bounds.right && 
          mouseY > bounds.top && mouseY < bounds.bottom) {
        return true;
      }
    }
  }
  
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}