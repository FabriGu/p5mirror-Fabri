let squigglyPlane = [];
let cam;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // Create a p5.Camera object.
  cam = createCamera();

  // Place the camera at the top-center.
  cam.setPosition(200, -400, 600);
  

  // Point the camera at the origin.
  
  cam.pan(0.1)
  cam.lookAt(0, 0, 0);
  
  // Create initial squiggly lines to form the plane
  for (let i = 0; i < 40; i++) {
    squigglyPlane.push(new SquigglyLine(200 - i * 50));
  }
}

function draw() {
  background(200);
  
  
  // Add a dynamic point light
  pointLight(255, 255, 255, 200 * sin(frameCount * 0.01), -100, 200);

  // let c = color(255, 0, 0);
  // directionalLight(c, 1, 1, 1);
  
  ambientLight(100)


  // Draw and rotate the sphere
  push();
  fill(100, 150, 255);
  noStroke();
  rotateY(frameCount * 0.01);
  rotateX(frameCount * 0.01);
  sphere(150);
  pop();

  // Update each line in the plane
  for (let line of squigglyPlane) {
    line.update();
  }

  // Draw the squiggly plane by connecting lines
  drawSquigglyPlane();
}

function drawSquigglyPlane() {
  // noFill();
//   stroke(0);
//   strokeWeight(2);
  
  ambientMaterial(255, 255, 255);
  noStroke()
  fill("purple")

  for (let i = 0; i < squigglyPlane.length - 1; i++) {
    let currentLine = squigglyPlane[i];
    let nextLine = squigglyPlane[i + 1];

    beginShape(TRIANGLE_STRIP);
    for (let x = -400; x <= 400; x += 10) {
      let currentY = sin(x * 0.1 + frameCount * 0.05 + currentLine.zOffset * 0.1) * 20;
      let nextY = sin(x * 0.1 + frameCount * 0.05 + nextLine.zOffset * 0.1) * 20;

      // Define the vertices of the strip between current and next line
      vertex(x, currentY, currentLine.zOffset);
      vertex(x, nextY, nextLine.zOffset);
    }
    endShape();
  }
}

class SquigglyLine {
  constructor(zOffset) {
    this.zOffset = zOffset;
    this.speed = 0.5;  // Speed for moving the plane
  }

  update() {
    // Update the z position to move through and behind the sphere
    this.zOffset -= this.speed;
    if (this.zOffset < -400) {
      this.zOffset = 200;  // Reset when it moves out of view
    }
  }
}
