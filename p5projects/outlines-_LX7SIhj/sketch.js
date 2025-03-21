let angle = 0;
let depth = 20; // Universal depth variable

function setup() {
  createCanvas(800, 600, WEBGL);
}

function draw() {
  background(200);
  
  // Rotate the entire object
  rotateY(angle);
  angle += 0.01;

  // Draw the cabinet door with a simulated hole and depth
  drawCabinetDoor();
}

function drawCabinetDoor() {
  // Draw the back panel
  push();
  fill(153, 101, 21); // Brown color for wood
  translate(0, 0, 0); // Back panel
  box(300, 500, depth);
  pop();

  // Draw the invisible planks
  push();
  noFill(); // Make the planks invisible

  // Draw the top plank
  push();
  translate(0, -250 + depth / 2, 0); // Move to position
  rotateX(HALF_PI); // Rotate to make it horizontal
  box(300, depth, 50); // Width, depth, height
  pop();
  
  // Draw the bottom plank
  push();
  translate(0, 250 - depth / 2, 0); // Move to position
  rotateX(HALF_PI); // Rotate to make it horizontal
  box(300, depth, 50); // Width, depth, height
  pop();
  
  // Draw the left plank
  push();
  translate(-150 + depth / 2, 0, 0); // Move to position
  rotateY(HALF_PI); // Rotate to make it vertical
  box(depth, 500, 50); // Width, height, depth
  pop();
  
  // Draw the right plank
  push();
  translate(150 - depth / 2, 0, 0); // Move to position
  rotateY(HALF_PI); // Rotate to make it vertical
  box(depth, 500, 50); // Width, height, depth
  pop();
  
  pop();

  // Draw the border around the outer rectangle
  stroke(0); // Black border color
  strokeWeight(2); // Border thickness
  noFill(); // No fill for the border shapes
  push();
  beginShape();
  vertex(-150, -250, depth / 2);
  vertex(150, -250, depth / 2);
  vertex(150, 250, depth / 2);
  vertex(-150, 250, depth / 2);
  endShape(CLOSE);
  pop();

  // Draw the border around the inner rectangle (hole)
  push();
  beginShape();
  vertex(-100, -200, depth / 2);
  vertex(100, -200, depth / 2);
  vertex(100, 200, depth / 2);
  vertex(-100, 200, depth / 2);
  endShape(CLOSE);
  pop();
}
