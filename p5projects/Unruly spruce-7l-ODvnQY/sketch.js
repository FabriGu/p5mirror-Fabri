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

  // Draw the front panel with a simulated rectangular hole
  push();
  fill(102, 51, 0); // Darker brown color for the front panel
  translate(0, 0, depth +1); // Move this panel slightly forward to create depth
  
  // Draw the top part of the panel
  push();
  fill(102, 51, 0); // Darker brown color for the top part
  beginShape();
  vertex(-150, -250, -depth / 2);
  vertex(150, -250, -depth / 2);
  vertex(150, -200, -depth / 2);
  vertex(-150, -200, -depth / 2);
  endShape(CLOSE);
  pop();
  
  // Draw the bottom part of the panel
  push();
  fill(102, 51, 0); // Darker brown color for the bottom part
  beginShape();
  vertex(-150, 200, -depth / 2);
  vertex(150, 200, -depth / 2);
  vertex(150, 250, -depth / 2);
  vertex(-150, 250, -depth / 2);
  endShape(CLOSE);
  pop();
  
  // Draw the left part of the panel
  push();
  fill(102, 51, 0); // Darker brown color for the left part
  beginShape();
  vertex(-150, -200, -depth / 2);
  vertex(-100, -200, -depth / 2);
  vertex(-100, 200, -depth / 2);
  vertex(-150, 200, -depth / 2);
  endShape(CLOSE);
  pop();
  
  // Draw the right part of the panel
  push();
  fill(102, 51, 0); // Darker brown color for the right part
  beginShape();
  vertex(100, -200, -depth / 2);
  vertex(150, -200, -depth / 2);
  vertex(150, 200, -depth / 2);
  vertex(100, 200, -depth / 2);
  endShape(CLOSE);
  pop();
  
  pop();
}
