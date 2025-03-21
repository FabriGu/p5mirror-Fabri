let colors;
let gridSize = 60;
let rotX = -Math.PI/6;
let rotY = Math.PI/6;

function setup() {
  createCanvas(1080, 1080, WEBGL);
  
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
  
  // Set up lights for better 3D effect
  ambientLight(60);
  pointLight(255, 255, 255, 0, -300, 200);
  directionalLight(255, 255, 255, -1, 1, -1);
  
  // Set material properties
  specularMaterial(250);
  shininess(50);
  
  // Center the pattern
  translate(-width/2, -height/2);
  
  // Apply camera rotation
  translate(width/2, height/2);
  rotateX(rotX);
  rotateY(rotY);
  translate(-width/2, -height/2);
  
  // Draw base plane
  push();
  translate(0, 0, -10);
  fill(220);
  noStroke();
  plane(width, height);
  pop();
  
  // Draw 3D patterns
  for (let y = gridSize; y < height - gridSize; y += gridSize * 2) {
    for (let x = gridSize; x < width - gridSize; x += gridSize * 2) {
      draw3DPattern(x, y, random(colors));
    }
  }
  
  // Draw connecting elements
  stroke(colors[4]);
  strokeWeight(2);
  noFill();
  for (let y = 0; y < height; y += gridSize * 3) {
    for (let x = 0; x < width; x += gridSize * 3) {
      if (random() > 0.5) {
        draw3DConnector(x, y);
      }
    }
  }
}

function draw3DPattern(x, y, col) {
  push();
  translate(x, y);
  
  let pattern = floor(random(4));
  fill(col);
  noStroke();
  
  switch(pattern) {
    case 0:
      // Raised diamond pattern
      push();
      translate(gridSize/2, gridSize/2);
      for (let i = 0; i < 3; i++) {
        rotateZ(PI/6);
        translate(0, 0, 5);
        box(gridSize/2, gridSize/2, 10);
      }
      pop();
      break;
      
    case 1:
      // Concentric cylinders
      push();
      translate(gridSize/2, gridSize/2);
      for (let i = 3; i > 0; i--) {
        translate(0, 0, 5);
        cylinder(gridSize * i/6, 10, 24, 1);
      }
      pop();
      break;
      
    case 2:
      // Raised cross pattern
      push();
      translate(gridSize/2, gridSize/2);
      // Horizontal bar
      translate(0, 0, 5);
      box(gridSize, gridSize/4, 10);
      // Vertical bar
      rotateZ(PI/2);
      box(gridSize, gridSize/4, 10);
      pop();
      break;
      
    case 3:
      // 3D wave pattern
      push();
      translate(gridSize/2, gridSize/2);
      for (let i = -gridSize/2; i < gridSize/2; i += 10) {
        translate(0, 0, 5);
        let h = 10 * sin(i * 0.1);
        translate(i, h);
        box(8, 8, 15 + h);
        translate(-i, -h);
      }
      pop();
      break;
  }
  pop();
}

function draw3DConnector(x, y) {
  push();
  translate(x, y);
  let type = floor(random(3));
  
  switch(type) {
    case 0:
      // Raised diagonal lines
      push();
      translate(0, 0, 5);
      rotateZ(PI/4);
      box(gridSize * 3, 5, 5);
      pop();
      break;
      
    case 1:
      // Grid of small cubes
      for (let i = 0; i < gridSize * 3; i += gridSize/2) {
        for (let j = 0; j < gridSize * 3; j += gridSize/2) {
          push();
          translate(i, j, 3);
          box(5);
          pop();
        }
      }
      break;
      
    case 2:
      // Raised sine wave
      beginShape(TRIANGLE_STRIP);
      for (let i = 0; i < gridSize * 3; i += 5) {
        let h = 10 * sin(i * 0.05);
        vertex(i, h, 5);
        vertex(i, h + 5, 5);
      }
      endShape();
      break;
  }
  pop();
}

function mousePressed() {
  redraw();
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('transport_pattern_3d', 'png');
  }
}