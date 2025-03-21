let squigglyLines = [];
let cam;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Create a p5.Camera object.
  cam = createCamera();

  // Place the camera at the top-center.
  cam.setPosition(0, -400, 800);
  

  // Point the camera at the origin.
  
  cam.pan(0.1)
  cam.lookAt(0, 0, 0);
  
  // Create multiple squiggly lines with different initial zOffsets
  for (let i = 0; i < 50; i++) {
    squigglyLines.push(new SquigglyLine(200 - i * 100));
  }
}

function draw() {
  background(200);
  
  // Draw and rotate the sphere
  push();
  fill(100, 150, 255);
  noStroke();
  rotateY(frameCount * 0.01);
  rotateX(frameCount * 0.01);
  sphere(150);
  pop();

  // Update and draw each squiggly line
  for (let line of squigglyLines) {
    line.update();
    line.display();
  }
  
  
}

class SquigglyLine {
  constructor(zOffset) {
    this.zOffset = zOffset;
    this.speed = random(0.5, 1.5);  // Random speed for each line
  }

  update() {
    // Update the z position to move through and behind the sphere
    this.zOffset -= this.speed;
    if (this.zOffset < -400) {
      this.zOffset = 200;  // Reset when it moves out of view
    }
  }

  display() {
    push();
    noFill();
    stroke(0);
    strokeWeight(2);

    // Translate to where the squiggly line should be
    translate(0, 0, this.zOffset);

    beginShape();
    for (let x = -200; x <= 200; x += 10) {
      let y = sin(x * 0.1 + frameCount * 0.05) * 20;  // Generate squiggly motion
      vertex(x, y, 0);
    }
    endShape();

    pop();
  }
}
