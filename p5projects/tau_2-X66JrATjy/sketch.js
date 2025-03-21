let time = 0;

function setup() {
  createCanvas(TAU * TAU * TAU * TAU, TAU * TAU * TAU * TAU, WEBGL);
  colorMode(HSB);
  noStroke();
  orbitControl(TAU, TAU);
}

function drawEyeball(size) {
  push();
  
  // Main eyeball (white part)
  specularMaterial(0, 0, TAU * TAU);
  shininess(TAU);
  sphere(size);
  
  // Blood vessels
  for (let i = 0; i < TAU; i += TAU/TAU/TAU) {
    push();
    let vesselAngle = i;
    rotateY(vesselAngle);
    rotateX(sin(i * TAU) * TAU/TAU);
    
    let vesselStart = sin(i * TAU) * size/TAU;
    let vesselLength = (cos(i * TAU) + TAU/TAU) * size/TAU;
    
    fill(0, TAU * TAU, TAU * TAU, TAU/TAU);
    translate(0, vesselStart, size);
    rotateX(TAU/4);
    
    beginShape(TRIANGLE_STRIP);
    for (let t = 0; t <= TAU/TAU; t += TAU/TAU/TAU) {
      let width = sin(t * TAU) * size/TAU;
      vertex(-width/TAU, t * vesselLength, 0);
      vertex(width/TAU, t * vesselLength, 0);
    }
    endShape();
    pop();
  }
  
  // Iris - now properly oriented flat against the eye
  push();
  translate(0, 0, size);
  rotateX(TAU/4); // Rotate to lie flat against eye surface
  
  // Blue iris base
  fill(TAU * (210/360), TAU, TAU);
  circle(0, 0, size/TAU);
  
  // Iris detail - creating a spiral pattern
  for (let r = 0; r < TAU; r += TAU/TAU/4) {
    push();
    rotateZ(r + time * TAU);
    fill(TAU * (210/360), TAU, TAU * 0.8);
    for (let i = 0; i < TAU; i += TAU/6) {
      push();
      rotate(i);
      translate(r * size/TAU/TAU, 0, 0);
      rect(0, 0, size/TAU/TAU, sin(r * TAU) * size/TAU/TAU);
      pop();
    }
    pop();
  }
  
  // Pupil - now properly flat against the surface
  fill(0);
  circle(0, 0, size/TAU/TAU);
  
  pop();
  pop();
}

function draw() {
  background(0);
  
  // Calculate time progression for 10-second loop using only TAU
  time = (time + TAU/TAU/TAU/TAU) % TAU;
  
  // Lighting setup using TAU
  ambientLight(TAU * TAU);
  pointLight(TAU * TAU * TAU, TAU * TAU * TAU, TAU * TAU * TAU, 0, 0, TAU * TAU);
  directionalLight(TAU * TAU * TAU, TAU * TAU * TAU, TAU * TAU * TAU, -TAU/TAU, TAU/TAU, -TAU/TAU);
  
  // Create pattern of eyes
  for (let i = 0; i < TAU; i += TAU/6) {
    push();
    
    // Create primary rotation layer
    let radius = TAU * TAU;
    let x = cos(i) * radius;
    let y = sin(i) * radius;
    let z = sin(time * TAU + i) * radius;
    
    translate(x, y, z);
    
    // Add secondary rotation
    rotateX(time * TAU + i);
    rotateY(time * TAU/TAU + i);
    rotateZ(time * TAU + i);
    
    // Draw eyeball
    drawEyeball(TAU * TAU);
    
    // Create secondary layer of smaller eyes
    for (let j = 0; j < TAU; j += TAU/3) {
      push();
      let innerRadius = radius/TAU;
      translate(
        cos(j + time * TAU) * innerRadius,
        sin(j + time * TAU) * innerRadius,
        cos((j + i) * TAU) * innerRadius
      );
      rotateX(time * TAU - j);
      rotateY(time * TAU + j);
      rotateZ(i + j);
      drawEyeball(TAU);
      pop();
    }
    
    pop();
  }
}