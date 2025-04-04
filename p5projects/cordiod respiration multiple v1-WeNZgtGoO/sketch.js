// Array to store multiple mandalas
let mandalas = [];

// Color range controls
let hueMin = 0;
let hueMax = 30;
let saturation = 80;
let brightness = 90;

// UI state
let isCreatingMandala = false;
let startX, startY;
let currentRadius = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeWeight(0.5);
  
  // Create initial mandala in the center
  mandalas.push({
    x: width/2,
    y: height/2,
    radius: 300,
    c: 0,
    divisions: 200
  });
  
  // Create color sliders
  createControlPanel();
}

function createControlPanel() {
  // Container for controls
  let panel = createDiv();
  panel.position(20, 20);
  panel.style('background-color', 'rgba(0,0,0,0.7)');
  panel.style('padding', '10px');
  panel.style('border-radius', '10px');
  panel.style('color', 'white');
  
  // Title
  let title = createP('Mandala Controls');
  title.parent(panel);
  title.style('margin', '0 0 10px 0');
  
  // Hue Min slider
  createP('Hue Min:').parent(panel);
  let hueMinSlider = createSlider(0, 100, hueMin);
  hueMinSlider.parent(panel);
  hueMinSlider.input(() => { hueMin = hueMinSlider.value(); });
  
  // Hue Max slider
  createP('Hue Max:').parent(panel);
  let hueMaxSlider = createSlider(0, 100, hueMax);
  hueMaxSlider.parent(panel);
  hueMaxSlider.input(() => { hueMax = hueMaxSlider.value(); });
  
  // Saturation slider
  createP('Saturation:').parent(panel);
  let satSlider = createSlider(0, 100, saturation);
  satSlider.parent(panel);
  satSlider.input(() => { saturation = satSlider.value(); });
  
  // Brightness slider
  createP('Brightness:').parent(panel);
  let brightSlider = createSlider(0, 100, brightness);
  brightSlider.parent(panel);
  brightSlider.input(() => { brightness = brightSlider.value(); });
  
  // Speed slider
  createP('Evolution Speed:').parent(panel);
  let speedSlider = createSlider(0.001, 0.05, 0.01, 0.001);
  speedSlider.parent(panel);
  
  // Clear button
  let clearButton = createButton('Clear All');
  clearButton.parent(panel);
  clearButton.style('margin-top', '10px');
  clearButton.style('width', '100%');
  clearButton.mousePressed(() => { mandalas = []; });
  
  // Instructions
  let instructions = createP('Click and drag to create new mandalas.<br>Mouse wheel over a mandala to change its speed.');
  instructions.parent(panel);
  instructions.style('font-size', '12px');
  instructions.style('margin-top', '10px');
}

function draw() {
  background(10, 10, 30, 25); // Slightly transparent background for trailing effect
  
  // Draw all existing mandalas
  for (let mandala of mandalas) {
    drawMandala(mandala);
    
    // Increase coefficient for each mandala
    mandala.c += 0.01;
    
    // Reset if needed
    if (mandala.c > mandala.divisions * 10) {
      mandala.c = mandala.c % mandala.divisions;
    }
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
}

function drawMandala(mandala) {
  push(); // Save current drawing state
  
  translate(mandala.x, mandala.y); // Center at mandala position
  
  // Calculate points around the circle
  let points = [];
  for (let i = 0; i < mandala.divisions; i++) {
    let angle = map(i, 0, mandala.divisions, 0, TWO_PI);
    let x = mandala.radius * cos(angle);
    let y = mandala.radius * sin(angle);
    points.push({x, y});
  }
  
  // Draw lines between points based on our formula y = (x*c) % divisions
  for (let i = 0; i < mandala.divisions; i++) {
    // Calculate the target point using the formula
    let j = floor((i * mandala.c) % mandala.divisions);
    
    // Use HSB color mode for smooth color transitions
    colorMode(HSB, 100);
    
    // Map the hue to our specified range
    let hueRange = hueMax - hueMin;
    let colorOffset = (frameCount * 0.5) % 100;
    let hue = hueMin + ((i / mandala.divisions * hueRange + colorOffset) % hueRange);
    
    stroke(hue, saturation, brightness, 70);
    
    // Draw the line
    line(points[i].x, points[i].y, points[j].x, points[j].y);
  }
  
  // Display the current c value
  colorMode(RGB);
  fill(255);
  noStroke();
  textAlign(LEFT);
  textSize(12);
  text(`c = ${mandala.c.toFixed(2)}`, -mandala.radius + 10, -mandala.radius + 20);
  
  pop(); // Restore previous drawing state
}

function mousePressed() {
  // Start creating a new mandala
  if (!isOverControlPanel()) {
    isCreatingMandala = true;
    startX = mouseX;
    startY = mouseY;
    currentRadius = 0;
  }
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
    mandalas.push({
      x: startX,
      y: startY,
      radius: currentRadius,
      c: random(0, 2), // Start with a random c value
      divisions: 200
    });
  }
  isCreatingMandala = false;
}

function mouseWheel(event) {
  // Find if we're over any mandala
  for (let mandala of mandalas) {
    let d = dist(mouseX, mouseY, mandala.x, mandala.y);
    if (d < mandala.radius) {
      // Change speed based on mouse wheel
      mandala.c += event.delta * 0.05;
      return false; // Prevent default scrolling
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    // Save the canvas as an image when 's' is pressed
    saveCanvas('mandalas', 'png');
  }
}

function isOverControlPanel() {
  // Simple check to avoid creating mandalas when clicking on the control panel
  return mouseX < 200 && mouseY < 300;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}