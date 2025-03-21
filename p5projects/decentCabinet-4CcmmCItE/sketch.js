let angle = 0;

function setup() {
  createCanvas(800, 600, WEBGL);
}

function draw() {
  background(200);
  
  // Rotate the door
  rotateY(angle);
  angle += 0.01;

  // Draw the cabinet door
  drawCabinetDoor();
  
  // Add embellishments
  drawBorder();
  // drawDecorativePattern();
  drawCurves();
}

function drawCabinetDoor() {
  push();
  
  // Main cabinet door
  fill(153, 101, 21); // Brown color for wood
  translate(0, 0, 0);
  box(300, 500, 20);

  // Rectangle with a hole (for depth effect)
  translate(0, 0, 110);
  fill(102, 51, 0); // Darker brown color for the border
  beginShape();
  vertex(-150, -250);
  vertex(150, -250);
  vertex(150, 250);
  vertex(-150, 250);
  beginContour();
  vertex(-100, -200);
  vertex(100, -200);
  vertex(100, 200);
  vertex(-100, 200);
  endContour();
  endShape(CLOSE);
  
  pop();
}

function drawBorder() {
  push();
  noFill();
  stroke(102, 51, 0); // Darker brown color for the border
  strokeWeight(10);
  
  // Draw the border around the door
  translate(0, 0, 12);
  beginShape();
  vertex(-150, -250);
  vertex(150, -250);
  vertex(150, 250);
  vertex(-150, 250);
  endShape(CLOSE);
  
  pop();
}

function drawDecorativePattern() {
  push();
  stroke(102, 51, 0);
  strokeWeight(5);
  noFill();
  
  // Draw some decorative lines/patterns
  translate(0, 0, 13);
  
  // Example pattern: diagonal cross
  line(-120, -220, 120, 220);
  line(-120, 220, 120, -220);
  
  pop();
}

function drawCurves() {
  push();
  stroke(102, 51, 0);
  strokeWeight(5);
  noFill();
  
  translate(0, 0, 14);

  // Draw some decorative curves
  beginShape();
  for (let i = -150; i <= 150; i += 10) {
    vertex(i, 100 * sin(i * 0.05));
  }
  endShape();

  beginShape();
  for (let i = -150; i <= 150; i += 10) {
    vertex(i, -100 + 50 * cos(i * 0.05));
  }
  endShape();

  beginShape();
  for (let i = -150; i <= 150; i += 10) {
    vertex(i, -100 + 50 * sin(i * 0.1));
  }
  endShape();

  pop();
}
