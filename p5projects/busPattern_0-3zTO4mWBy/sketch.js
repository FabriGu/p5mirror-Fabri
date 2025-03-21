let colors;
let gridSize = 60;
let noiseScale = 0.02;

function setup() {
  createCanvas(1080, 1080);
  // Color palette inspired by public transport seating
  colors = [
    color(15, 52, 96),    // dark blue
    color(215, 38, 61),   // red
    color(255, 183, 0),   // yellow
    color(42, 157, 143),  // teal
    color(38, 70, 83)     // navy
  ];
  
  noLoop();
}

function draw() {
  background(240);
  
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
  stroke(colors[4]);
  strokeWeight(3);
  for (let y = 0; y < height; y += gridSize * 3) {
    for (let x = 0; x < width; x += gridSize * 3) {
      if (random() > 0.5) {
        drawConnectingLines(x, y, gridSize * 3);
      }
    }
  }
}

function drawCurvedShape(x, y, size, col) {
  push();
  translate(x, y);
  noStroke();
  fill(col);
  
  beginShape();
  for (let i = 0; i < TWO_PI; i += TWO_PI / 8) {
    let r = size * 0.4 * (1 + 0.3 * sin(i * 2));
    let px = r * cos(i);
    let py = r * sin(i);
    curveVertex(px, py);
  }
  endShape(CLOSE);
  pop();
}

function drawGeometricPattern(x, y, size, col) {
  push();
  translate(x + size/2, y + size/2);
  noFill();
  strokeWeight(2);
  stroke(col);
  
  let pattern = floor(random(4));
  
  switch(pattern) {
    case 0:
      // Diamond pattern
      for (let i = 0; i < 3; i++) {
        rotate(PI/6);
        rect(-size/4, -size/4, size/2, size/2);
      }
      break;
    case 1:
      // Concentric circles
      for (let i = 1; i < 4; i++) {
        circle(0, 0, size * i/4);
      }
      break;
    case 2:
      // Cross pattern
      line(-size/2, 0, size/2, 0);
      line(0, -size/2, 0, size/2);
      rotate(PI/4);
      line(-size/3, 0, size/3, 0);
      line(0, -size/3, 0, size/3);
      break;
    case 3:
      // Zigzag pattern
      beginShape();
      for (let i = -size/2; i < size/2; i += size/8) {
        vertex(i, sin(i * 0.1) * size/4);
      }
      endShape();
      break;
  }
  pop();
}

function drawConnectingLines(x, y, size) {
  push();
  translate(x, y);
  let pattern = floor(random(3));
  
  switch(pattern) {
    case 0:
      // Diagonal lines
      line(0, 0, size, size);
      line(size, 0, 0, size);
      break;
    case 1:
      // Grid lines
      for (let i = 0; i < size; i += size/3) {
        line(i, 0, i, size);
        line(0, i, size, i);
      }
      break;
    case 2:
      // Wave pattern
      beginShape();
      noFill();
      for (let i = 0; i < size; i += 5) {
        vertex(i, sin(i * 0.05) * size/4 + size/2);
      }
      endShape();
      break;
  }
  pop();
}

// Add these functions to make the pattern interactive
function mousePressed() {
  redraw();
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('transport_pattern', 'png');
  }
}