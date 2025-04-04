// Strange Attractor Visualization
// This sketch implements several strange attractors with interactive controls

let particles = [];
let numParticles = 100;
let attractor = 'clifford'; // Default attractor
let rotationX = 0;
let rotationY = 0;
let autoRotate = true;
let zoom = 15;

// Parameters for each attractor
let params = {
  lorenz: {
    sigma: 10,
    rho: 28,
    beta: 8/3,
    dt: 0.005,
    scale: 5
  },
  clifford: {
    a: -1.4,
    b: 1.6,
    c: 1.0,
    d: 0.7,
    scale: 150
  },
  aizawa: {
    a: 0.95,
    b: 0.7,
    c: 0.6,
    d: 3.5,
    e: 0.25,
    f: 0.1,
    dt: 0.01,
    scale: 15
  },
  thomas: {
    b: 0.208186,
    dt: 0.05,
    scale: 10
  },
  chen: {
    a: 5,
    b: -10,
    c: -0.38,
    dt: 0.005,
    scale: 10
  }
};

// Color settings
let colorParams = {
  hueStart: 180,
  hueRange: 60,
  saturation: 80,
  brightness: 90,
  opacity: 10,
  fadeSpeed: 15
};

let gui;
let showUI = true;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  
  // Initialize particles
  resetParticles();
  
  // Create UI
  createGUI();
  
  // Use a framerate that balances smoothness and performance
  frameRate(30);
}

function resetParticles() {
  particles = [];
  
  // Initialize particles based on attractor type
  for (let i = 0; i < numParticles; i++) {
    let p = {};
    
    if (attractor === 'lorenz') {
      // Random starting points for Lorenz
      p.x = random(-5, 5);
      p.y = random(-5, 5);
      p.z = random(0, 10);
    } else if (attractor === 'clifford') {
      // Starting points for Clifford attractor
      p.x = random(-1, 1);
      p.y = random(-1, 1);
      p.z = 0; // 2D attractor
    } else if (attractor === 'aizawa') {
      // Starting points for Aizawa attractor
      p.x = random(-1, 1);
      p.y = random(-1, 1);
      p.z = random(-1, 1);
    } else if (attractor === 'thomas') {
      // Starting points for Thomas attractor
      p.x = random(-2, 2);
      p.y = random(-2, 2);
      p.z = random(-2, 2);
    } else if (attractor === 'chen') {
      // Starting points for Chen attractor
      p.x = random(-10, 10);
      p.y = random(-10, 10);
      p.z = random(0, 20);
    }
    
    // Add properties for display
    p.hue = (colorParams.hueStart + random(colorParams.hueRange)) % 360;
    p.size = random(1, 3);
    p.alpha = random(20, 50);
    p.history = [];
    p.maxHistory = 20; // Trail length
    
    particles.push(p);
  }
}

function draw() {
  // Fade background for trail effect
  background(0, 0, 0, colorParams.fadeSpeed);
  
  if (autoRotate) {
    rotationX += 0.003;
    rotationY += 0.002;
  }
  
  // Apply rotation and zoom
  push();
  translate(0, 0, -100); // Pull back to see the entire attractor
  scale(zoom);
  rotateX(rotationX);
  rotateY(rotationY);
  
  // Update and draw all particles
  for (let i = 0; i < particles.length; i++) {
    updateParticle(particles[i]);
    drawParticle(particles[i]);
  }
  
  pop();
  
  // FPS counter
  fill(255);
  noStroke();
  textAlign(LEFT);
  textSize(14);
  text(`FPS: ${frameRate().toFixed(1)}`, -width/2 + 20, -height/2 + 20);
  
  // Instructions if UI is hidden
  if (!showUI) {
    text("Press 'H' to show controls", -width/2 + 20, -height/2 + 40);
  }
}

function updateParticle(p) {
  // Store current position in history
  if (p.history.length >= p.maxHistory) {
    p.history.shift(); // Remove oldest position
  }
  p.history.push({x: p.x, y: p.y, z: p.z});
  
  // Update position based on attractor equations
  if (attractor === 'lorenz') {
    // Lorenz attractor
    let dx = params.lorenz.sigma * (p.y - p.x);
    let dy = p.x * (params.lorenz.rho - p.z) - p.y;
    let dz = p.x * p.y - params.lorenz.beta * p.z;
    
    p.x += dx * params.lorenz.dt;
    p.y += dy * params.lorenz.dt;
    p.z += dz * params.lorenz.dt;
  } 
  else if (attractor === 'clifford') {
    // Clifford attractor (2D)
    let a = params.clifford.a;
    let b = params.clifford.b;
    let c = params.clifford.c;
    let d = params.clifford.d;
    
    let nx = sin(a * p.y) + c * cos(a * p.x);
    let ny = sin(b * p.x) + d * cos(b * p.y);
    
    p.x = nx;
    p.y = ny;
  }
  else if (attractor === 'aizawa') {
    // Aizawa attractor
    let a = params.aizawa.a;
    let b = params.aizawa.b;
    let c = params.aizawa.c;
    let d = params.aizawa.d;
    let e = params.aizawa.e;
    let f = params.aizawa.f;
    
    let dx = (p.z - b) * p.x - d * p.y;
    let dy = d * p.x + (p.z - b) * p.y;
    let dz = c + a * p.z - (p.z*p.z*p.z)/3 - (p.x*p.x + p.y*p.y) * (1 + e * p.z) + f * p.z * (p.x*p.x*p.x);
    
    p.x += dx * params.aizawa.dt;
    p.y += dy * params.aizawa.dt;
    p.z += dz * params.aizawa.dt;
  }
  else if (attractor === 'thomas') {
    // Thomas cyclically symmetric attractor
    let b = params.thomas.b;
    
    let dx = -b * p.x + sin(p.y);
    let dy = -b * p.y + sin(p.z);
    let dz = -b * p.z + sin(p.x);
    
    p.x += dx * params.thomas.dt;
    p.y += dy * params.thomas.dt;
    p.z += dz * params.thomas.dt;
  }
  else if (attractor === 'chen') {
    // Chen attractor
    let a = params.chen.a;
    let b = params.chen.b;
    let c = params.chen.c;
    
    let dx = a * (p.y - p.x);
    let dy = (c - a) * p.x - p.x * p.z + c * p.y;
    let dz = p.x * p.y - b * p.z;
    
    p.x += dx * params.chen.dt;
    p.y += dy * params.chen.dt;
    p.z += dz * params.chen.dt;
  }
}

function drawParticle(p) {
  // Draw particle trail
  beginShape();
  noFill();
  
  for (let i = 0; i < p.history.length; i++) {
    let pos = p.history[i];
    let alpha = map(i, 0, p.history.length-1, 0, p.alpha);
    
    stroke(p.hue, colorParams.saturation, colorParams.brightness, alpha);
    vertex(pos.x * getScale(), pos.y * getScale(), pos.z * getScale());
  }
  endShape();
  
  // Draw current position
  noStroke();
  fill(p.hue, colorParams.saturation, colorParams.brightness, p.alpha);
  push();
  translate(
    p.x * getScale(),
    p.y * getScale(),
    p.z * getScale()
  );
  sphere(p.size * 0.1); // Small sphere at current position
  pop();
}

function getScale() {
  // Get scale based on current attractor
  if (attractor === 'lorenz') return params.lorenz.scale;
  if (attractor === 'clifford') return params.clifford.scale;
  if (attractor === 'aizawa') return params.aizawa.scale;
  if (attractor === 'thomas') return params.thomas.scale;
  if (attractor === 'chen') return params.chen.scale;
  return 10; // Default scale
}

function createGUI() {
  // Remove existing GUI if it exists
  if (gui) gui.remove();
  
  // Create GUI container
  gui = createDiv();
  gui.position(20, 20);
  gui.style('background-color', 'rgba(0,0,0,0.7)');
  gui.style('padding', '10px');
  gui.style('border-radius', '10px');
  gui.style('color', 'white');
  gui.style('max-height', '80vh');
  gui.style('overflow-y', 'auto');
  gui.style('width', '250px');
  
  // Title
  let title = createP('Strange Attractor Controls');
  title.parent(gui);
  title.style('margin', '0 0 10px 0');
  title.style('font-weight', 'bold');
  
  // Attractor selection
  createP('Attractor Type:').parent(gui);
  let attractorSelect = createSelect();
  attractorSelect.parent(gui);
  attractorSelect.style('width', '100%');
  attractorSelect.style('margin-bottom', '10px');
  attractorSelect.option('Lorenz', 'lorenz');
  attractorSelect.option('Clifford', 'clifford');
  attractorSelect.option('Aizawa', 'aizawa');
  attractorSelect.option('Thomas', 'thomas');
  attractorSelect.option('Chen', 'chen');
  attractorSelect.selected(attractor);
  attractorSelect.changed(() => {
    attractor = attractorSelect.value();
    resetParticles();
  });
  
  // Auto-rotate toggle
  let rotateCheckbox = createCheckbox('Auto-rotate', autoRotate);
  rotateCheckbox.parent(gui);
  rotateCheckbox.style('margin', '10px 0');
  rotateCheckbox.changed(() => {
    autoRotate = rotateCheckbox.checked();
  });
  
  // Zoom slider
  createP('Zoom:').parent(gui);
  let zoomSlider = createSlider(2, 50, zoom, 0.5);
  zoomSlider.parent(gui);
  zoomSlider.style('width', '100%');
  zoomSlider.input(() => {
    zoom = zoomSlider.value();
  });
  
  // Particles slider
  createP('Particles:').parent(gui);
  let particlesSlider = createSlider(500, 10000, numParticles, 500);
  particlesSlider.parent(gui);
  particlesSlider.style('width', '100%');
  particlesSlider.input(() => {
    numParticles = particlesSlider.value();
    resetParticles();
  });
  
  // Color section
  createP('Color Settings:').parent(gui);
  createP('Hue Start:').parent(gui);
  let hueStartSlider = createSlider(0, 360, colorParams.hueStart, 5);
  hueStartSlider.parent(gui);
  hueStartSlider.style('width', '100%');
  hueStartSlider.input(() => {
    colorParams.hueStart = hueStartSlider.value();
  });
  
  createP('Hue Range:').parent(gui);
  let hueRangeSlider = createSlider(0, 360, colorParams.hueRange, 5);
  hueRangeSlider.parent(gui);
  hueRangeSlider.style('width', '100%');
  hueRangeSlider.input(() => {
    colorParams.hueRange = hueRangeSlider.value();
  });
  
  createP('Fade Speed:').parent(gui);
  let fadeSlider = createSlider(1, 50, colorParams.fadeSpeed, 1);
  fadeSlider.parent(gui);
  fadeSlider.style('width', '100%');
  fadeSlider.input(() => {
    colorParams.fadeSpeed = fadeSlider.value();
  });
  
  // Attractor-specific parameters
  createParameterControls();
  
  // Reset button
  let resetButton = createButton('Reset Particles');
  resetButton.parent(gui);
  resetButton.style('margin-top', '10px');
  resetButton.style('width', '100%');
  resetButton.mousePressed(() => {
    resetParticles();
  });
  
  // Save button
  let saveButton = createButton('Save Image (S)');
  saveButton.parent(gui);
  saveButton.style('margin-top', '10px');
  saveButton.style('width', '100%');
  saveButton.mousePressed(() => {
    saveCanvas('strange-attractor', 'png');
  });
  
  // Instructions
  let instructions = createP(
    'Mouse drag: Rotate manually<br>' +
    'Mouse wheel: Zoom in/out<br>' +
    'H key: Toggle controls'
  );
  instructions.parent(gui);
  instructions.style('font-size', '12px');
  instructions.style('margin-top', '10px');
}

function createParameterControls() {
  // Create parameter-specific sliders based on current attractor
  let paramDiv = createDiv();
  paramDiv.id('paramControls');
  paramDiv.parent(gui);
  paramDiv.style('margin-top', '10px');
  paramDiv.style('padding-top', '10px');
  paramDiv.style('border-top', '1px solid #555');
  
  let paramTitle = createP('Attractor Parameters:');
  paramTitle.parent(paramDiv);
  paramTitle.style('margin', '0 0 10px 0');
  
  if (attractor === 'lorenz') {
    createParamSlider(paramDiv, 'Sigma', 'lorenz', 'sigma', 0, 20, params.lorenz.sigma, 0.1);
    createParamSlider(paramDiv, 'Rho', 'lorenz', 'rho', 0, 50, params.lorenz.rho, 0.1);
    createParamSlider(paramDiv, 'Beta', 'lorenz', 'beta', 0, 10, params.lorenz.beta, 0.01);
  } 
  else if (attractor === 'clifford') {
    createParamSlider(paramDiv, 'a', 'clifford', 'a', -3, 3, params.clifford.a, 0.01);
    createParamSlider(paramDiv, 'b', 'clifford', 'b', -3, 3, params.clifford.b, 0.01);
    createParamSlider(paramDiv, 'c', 'clifford', 'c', -3, 3, params.clifford.c, 0.01);
    createParamSlider(paramDiv, 'd', 'clifford', 'd', -3, 3, params.clifford.d, 0.01);
  }
  else if (attractor === 'aizawa') {
    createParamSlider(paramDiv, 'a', 'aizawa', 'a', 0.1, 2, params.aizawa.a, 0.01);
    createParamSlider(paramDiv, 'b', 'aizawa', 'b', 0.1, 2, params.aizawa.b, 0.01);
    createParamSlider(paramDiv, 'c', 'aizawa', 'c', 0.1, 2, params.aizawa.c, 0.01);
    createParamSlider(paramDiv, 'd', 'aizawa', 'd', 1, 10, params.aizawa.d, 0.1);
    createParamSlider(paramDiv, 'e', 'aizawa', 'e', 0.1, 1, params.aizawa.e, 0.01);
    createParamSlider(paramDiv, 'f', 'aizawa', 'f', 0.05, 0.5, params.aizawa.f, 0.01);
  }
  else if (attractor === 'thomas') {
    createParamSlider(paramDiv, 'b', 'thomas', 'b', 0.1, 0.5, params.thomas.b, 0.001);
  }
  else if (attractor === 'chen') {
    createParamSlider(paramDiv, 'a', 'chen', 'a', 1, 10, params.chen.a, 0.1);
    createParamSlider(paramDiv, 'b', 'chen', 'b', -20, 0, params.chen.b, 0.1);
    createParamSlider(paramDiv, 'c', 'chen', 'c', -1, 1, params.chen.c, 0.01);
  }
}

function createParamSlider(parent, label, attractorType, paramName, min, max, value, step) {
  createP(label + ':').parent(parent);
  let slider = createSlider(min, max, value, step);
  slider.parent(parent);
  slider.style('width', '100%');
  slider.input(() => {
    params[attractorType][paramName] = slider.value();
  });
}

function mouseDragged() {
  if (!isOverUI()) {
    // Manual rotation
    autoRotate = false;
    rotationY += (mouseX - pmouseX) * 0.01;
    rotationX += (mouseY - pmouseY) * 0.01;
    
    // Update UI if exists
    let checkbox = select('input[type="checkbox"]');
    if (checkbox) checkbox.checked(false);
  }
}

function mouseWheel(event) {
  // Zoom with mouse wheel
  zoom = constrain(zoom + event.delta * -0.05, 2, 50);
  
  // Update UI
  let zoomSlider = selectAll('input[type="range"]')[1];
  if (zoomSlider) zoomSlider.value(zoom);
  
  return false; // Prevent default scrolling
}

function keyPressed() {
  // Toggle UI visibility with 'h' key
  if (key === 'h' || key === 'H') {
    showUI = !showUI;
    gui.style('display', showUI ? 'block' : 'none');
  }
  
  // Save canvas with 's' key
  if (key === 's' || key === 'S') {
    saveCanvas('strange-attractor', 'png');
  }
}

function isOverUI() {
  // Check if mouse is over UI
  if (showUI) {
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
}