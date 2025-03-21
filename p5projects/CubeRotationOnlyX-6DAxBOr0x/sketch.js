

let cubeSize = 200;
let angle = 0;
let targetAngle = 0;

function setup() {
  createCanvas(600, 400, WEBGL);
  noStroke();
}

function draw() {
  background(200);

  // Rotate cube
  rotateY(angle);

  // Draw cube
  fill(150, 0, 0);
  // box(cubeSize);
  
  // Draw the cube with different colors on each side
  fill(color("#e76f51"));
  beginShape();
  vertex(-cubeSize / 2, -cubeSize / 2, -cubeSize / 2); // Front face
  vertex(cubeSize / 2, -cubeSize / 2, -cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, -cubeSize / 2);
  vertex(-cubeSize / 2, cubeSize / 2, -cubeSize / 2);
  endShape(CLOSE);

  fill(color("#f4a261"));
  beginShape();
  vertex(-cubeSize / 2, -cubeSize / 2, cubeSize / 2); // Back face
  vertex(cubeSize / 2, -cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, cubeSize / 2);
  vertex(-cubeSize / 2, cubeSize / 2, cubeSize / 2);
  endShape(CLOSE);

  fill(color("#e9c46a"));
  beginShape();
  vertex(-cubeSize / 2, -cubeSize / 2, -cubeSize / 2); // Left face
  vertex(-cubeSize / 2, -cubeSize / 2, cubeSize / 2);
  vertex(-cubeSize / 2, cubeSize / 2, cubeSize / 2);
  vertex(-cubeSize / 2, cubeSize / 2, -cubeSize / 2);
  endShape(CLOSE);

  fill(color("#8ab17d"));
  beginShape();
  vertex(cubeSize / 2, -cubeSize / 2, -cubeSize / 2); // Right face
  vertex(cubeSize / 2, -cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, -cubeSize / 2);
  endShape(CLOSE);

  fill(color("#2a9d8f"));
  beginShape();
  vertex(-cubeSize / 2, -cubeSize / 2, -cubeSize / 2); // Top face
  vertex(-cubeSize / 2, -cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, -cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, -cubeSize / 2, -cubeSize / 2);
  endShape(CLOSE);

  fill(color("#264653"));
  beginShape();
  vertex(-cubeSize / 2, cubeSize / 2, -cubeSize / 2); // Bottom face
  vertex(-cubeSize / 2, cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, -cubeSize / 2);
  endShape(CLOSE);


  // Animate rotation
  if (abs(angle - targetAngle) > 0.01) {
    angle += (targetAngle - angle) * 0.1;
  }
}

function mousePressed() {
  if (mouseX > width / 2) {
    // Clicked to the right
    targetAngle += HALF_PI;
  } else {
    // Clicked to the left
    targetAngle -= HALF_PI;
  }
}
