let colors;
let gridSize = 60;
let noiseScale = 0.02;
let patternGraphics;
let rotX = 0;
let rotY = 0;
let waves = [];

function setup() {
  createCanvas(1080, 1080, WEBGL);
  
  // Create off-screen graphics buffer for the pattern
  patternGraphics = createGraphics(1080, 1080);
  
  // Color palette inspired by public transport seating
  colors = [
    color(15, 52, 96),    // dark blue
    color(215, 38, 61),   // red
    color(255, 183, 0),   // yellow
    color(42, 157, 143),  // teal
    color(38, 70, 83)     // navy
  ];
  
  // Initialize wave points
  for (let z = 0; z < 15; z++) {
    waves[z] = [];
    for (let x = 0; x < 15; x++) {
      waves[z][x] = 0;
    }
  }
  
  // Generate initial pattern
  generatePattern();
}

function draw() {
  background(240);
  
  // Set up lights
  ambientLight(60);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  
  // Update rotation based on mouse position
  rotX = map(mouseY, 0, height, -PI/3, PI/3);
  rotY = map(mouseX, 0, width, -PI/3, PI/3);
  
  // Set material properties
  specularMaterial(250);
  shininess(50);
  
  // Apply transforms
  rotateX(rotX);
  rotateY(rotY + frameCount * 0.01);
  scale(1.5);
  
  // Update wave heights
  for (let z = 0; z < waves.length; z++) {
    for (let x = 0; x < waves[z].length; x++) {
      let angle = frameCount * 0.05 + (x * z) * 0.1;
      waves[z][x] = map(sin(angle), -1, 1, -20, 20);
    }
  }
  
  // Draw 3D surface with pattern texture
  texture(patternGraphics);
  noStroke();
  
  // Create undulating surface
  for (let z = 0; z < waves.length - 1; z++) {
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < waves[z].length; x++) {
      let xPos = map(x, 0, waves[z].length - 1, -width/2, width/2);
      let zPos1 = map(z, 0, waves.length - 1, -height/2, height/2);
      let zPos2 = map(z + 1, 0, waves.length - 1, -height/2, height/2);
      
      let u = map(x, 0, waves[z].length - 1, 0, 1);
      let v1 = map(z, 0, waves.length - 1, 0, 1);
      let v2 = map(z + 1, 0, waves.length - 1, 0, 1);
      
      vertex(xPos, waves[z][x], zPos1, u * patternGraphics.width, v1 * patternGraphics.height);
      vertex(xPos, waves[z + 1][x], zPos2, u * patternGraphics.width, v2 * patternGraphics.height);
    }
    endShape();
  }
}

function generatePattern() {
  patternGraphics.background(240);
  
  // Create base layer with noise-based curves
  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
      let n = noise(x * noiseScale, y * noiseScale);
      if (n > 0.5) {
        drawCurvedShape(x, y, gridSize, random(colors));
      }
    }
  }
  
  // Add geometric overlay pattern
  for (let y = 0; y < height; y += gridSize * 2) {
    for (let x = 0; x < width; x += gridSize * 2) {
      drawGeometricPattern(x, y, gridSize * 2, random(colors));
    }
  }
  
  // Add connecting lines
  patternGraphics.stroke(colors[4]);
  patternGraphics.strokeWeight(3);
  for (let y = 0; y < height; y += gridSize * 3) {
    for (let x = 0; x < width; x += gridSize * 3) {
      if (random() > 0.5) {
        drawConnectingLines(x, y, gridSize * 3);
      }
    }
  }
}

function drawCurvedShape(x, y, size, col) {
  patternGraphics.push();
  patternGraphics.translate(x, y);
  patternGraphics.noStroke();
  patternGraphics.fill(col);
  
  patternGraphics.beginShape();
  for (let i = 0; i < TWO_PI; i += TWO_PI / 8) {
    let r = size * 0.4 * (1 + 0.3 * sin(i * 2));
    let px = r * cos(i);
    let py = r * sin(i);
    patternGraphics.curveVertex(px, py);
  }
  patternGraphics.endShape(CLOSE);
  patternGraphics.pop();
}

function drawGeometricPattern(x, y, size, col) {
  patternGraphics.push();
  patternGraphics.translate(x + size/2, y + size/2);
  patternGraphics.noFill();
  patternGraphics.strokeWeight(2);
  patternGraphics.stroke(col);
  
  let pattern = floor(random(4));
  
  switch(pattern) {
    case 0:
      // Diamond pattern
      for (let i = 0; i < 3; i++) {
        patternGraphics.rotate(PI/6);
        patternGraphics.rect(-size/4, -size/4, size/2, size/2);
      }
      break;
    case 1:
      // Concentric circles
      for (let i = 1; i < 4; i++) {
        patternGraphics.circle(0, 0, size * i/4);
      }
      break;
    case 2:
      // Cross pattern
      patternGraphics.line(-size/2, 0, size/2, 0);
      patternGraphics.line(0, -size/2, 0, size/2);
      patternGraphics.rotate(PI/4);
      patternGraphics.line(-size/3, 0, size/3, 0);
      patternGraphics.line(0, -size/3, 0, size/3);
      break;
    case 3:
      // Zigzag pattern
      patternGraphics.beginShape();
      for (let i = -size/2; i < size/2; i += size/8) {
        patternGraphics.vertex(i, sin(i * 0.1) * size/4);
      }
      patternGraphics.endShape();
      break;
  }
  patternGraphics.pop();
}

function drawConnectingLines(x, y, size) {
  patternGraphics.push();
  patternGraphics.translate(x, y);
  let pattern = floor(random(3));
  
  switch(pattern) {
    case 0:
      // Diagonal lines
      patternGraphics.line(0, 0, size, size);
      patternGraphics.line(size, 0, 0, size);
      break;
    case 1:
      // Grid lines
      for (let i = 0; i < size; i += size/3) {
        patternGraphics.line(i, 0, i, size);
        patternGraphics.line(0, i, size, i);
      }
      break;
    case 2:
      // Wave pattern
      patternGraphics.beginShape();
      patternGraphics.noFill();
      for (let i = 0; i < size; i += 5) {
        patternGraphics.vertex(i, sin(i * 0.05) * size/4 + size/2);
      }
      patternGraphics.endShape();
      break;
  }
  patternGraphics.pop();
}

function mousePressed() {
  generatePattern();
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('transport_pattern_3d', 'png');
  }
}