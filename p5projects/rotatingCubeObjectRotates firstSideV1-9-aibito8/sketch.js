let camX = 0;
let camY = 0;
let camZ = 600;
let camZoomTargetZ = 400;
let camZcurr = 600;

let cube; // Instance of Cube
let cubeSize = 200;

let stove;
let oven;
let fridge;
let cabinet;
let microwave;
let dishwasher;
// rolling pin / knife cutting 

// let 

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // Initialize camera
  cam = createCamera();
  cam.setPosition(camX, camY, camZ); // Default position
  cam.lookAt(0, 0, 0); // Look at the origin
  
  // Initialize cube
  cube = new Cube(cubeSize);
  
  
  stove = new Stove(cubeSize)
  // oven = new Oven(cubeSize)
  // fridge = new Fridge(cubeSize)
  // cabinet = new Cabinet(cubeSize)
  // microwave = new Microwave(cubeSize)
  // dishwasher = new Dishwasher(cubeSize)
}

function draw() {
  background(200);

  // Hover effect with camera zoom
  if (cube.isMouseOver()) {
    if (camZcurr > camZoomTargetZ) {
      camZcurr = lerp(camZcurr, camZoomTargetZ, 0.1);
    }
    cam.setPosition(0, 0, camZcurr);
  } else {
    if (camZcurr < camZ) {
      camZcurr = lerp(camZcurr, camZ, 0.1);
    }
    cam.setPosition(0, 0, camZcurr);
  }

  // Rotate and draw the cube
  cube.rotate();
  cube.draw();
}

function mousePressed() {
  if (!cube.isMouseOver()) {
    cube.handleClick();
  }
}

class Cube {
  constructor(size) {
    this.size = size;
    this.angleX = 0;
    this.angleY = 0;
    this.targetAngleX = 0;
    this.targetAngleY = 0;
    this.above = false;
    this.below = false;
    
  }

  draw() {
    // Rotate cube
    rotateX(this.angleX);
    rotateY(this.angleY);

    // Draw the cube with different colors on each side
    fill(color("#e76f51"));
    stove.create()
    beginShape();
    vertex(-this.size / 2, -this.size / 2, -this.size / 2); // Front face
    vertex(this.size / 2, -this.size / 2, -this.size / 2);
    vertex(this.size / 2, this.size / 2, -this.size / 2);
    vertex(-this.size / 2, this.size / 2, -this.size / 2);
    endShape(CLOSE);

    fill(color("#f4a261"));
    beginShape();
    vertex(-this.size / 2, -this.size / 2, this.size / 2); // Back face
    vertex(this.size / 2, -this.size / 2, this.size / 2);
    vertex(this.size / 2, this.size / 2, this.size / 2);
    vertex(-this.size / 2, this.size / 2, this.size / 2);
    endShape(CLOSE);

    fill(color("#e9c46a"));
    beginShape();
    vertex(-this.size / 2, -this.size / 2, -this.size / 2); // Left face
    vertex(-this.size / 2, -this.size / 2, this.size / 2);
    vertex(-this.size / 2, this.size / 2, this.size / 2);
    vertex(-this.size / 2, this.size / 2, -this.size / 2);
    endShape(CLOSE);

    fill(color("#8ab17d"));
    beginShape();
    vertex(this.size / 2, -this.size / 2, -this.size / 2); // Right face
    vertex(this.size / 2, -this.size / 2, this.size / 2);
    vertex(this.size / 2, this.size / 2, this.size / 2);
    vertex(this.size / 2, this.size / 2, -this.size / 2);
    endShape(CLOSE);

    fill(color("#2a9d8f"));
    beginShape();
    vertex(-this.size / 2, -this.size / 2, -this.size / 2); // Top face
    vertex(-this.size / 2, -this.size / 2, this.size / 2);
    vertex(this.size / 2, -this.size / 2, this.size / 2);
    vertex(this.size / 2, -this.size / 2, -this.size / 2);
    endShape(CLOSE);

    fill(color("#264653"));
    beginShape();
    vertex(-this.size / 2, this.size / 2, -this.size / 2); // Bottom face
    vertex(-this.size / 2, this.size / 2, this.size / 2);
    vertex(this.size / 2, this.size / 2, this.size / 2);
    vertex(this.size / 2, this.size / 2, -this.size / 2);
    endShape(CLOSE);
  }

  rotate() {
    if (abs(this.angleX - this.targetAngleX) > 0.01) {
      this.angleX += (this.targetAngleX - this.angleX) * 0.1;
    }
    if (abs(this.angleY - this.targetAngleY) > 0.01) {
      this.angleY += (this.targetAngleY - this.angleY) * 0.1;
    }
  }

  isMouseOver() {
  // Calculate the boundaries of the cube on the screen
  let halfWidth = width / 2;
  let halfHeight = height / 2;
  let halfSize = this.size / 2;

  // Calculate the boundaries of the cube's face on the screen
  let minX = halfWidth - halfSize;
  let maxX = halfWidth + halfSize;
  let minY = halfHeight - halfSize;
  let maxY = halfHeight + halfSize;

  // Check if the mouse coordinates are within the cube's face boundaries
  return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;
}

  handleClick() {
    if (mouseX > width / 2 + this.size / 2) {
      if (this.above) {
        this.targetAngleY -= HALF_PI;
        this.targetAngleX += HALF_PI;
        this.above = false;
      } else if (this.below) {
        this.targetAngleY -= HALF_PI;
        this.targetAngleX -= HALF_PI;
        this.below = false;
      } else {
        this.targetAngleY -= HALF_PI;
      }
    } else if (mouseX < width / 2 - this.size / 2) {
      if (this.above) {
        this.targetAngleY += HALF_PI;
        this.targetAngleX += HALF_PI;
        this.above = false;
      } else if (this.below) {
        this.targetAngleY += HALF_PI;
        this.targetAngleX -= HALF_PI;
        this.below = false;
      } else {
        this.targetAngleY += HALF_PI;
      }
    } else if (mouseY < height / 2 - this.size / 2) {
      this.targetAngleX -= HALF_PI;
      this.above = true;
    } else if (mouseY > height / 2 + this.size / 2) {
      this.targetAngleX += HALF_PI;
      this.below = true;
    }
  }
  
}

class Stove {
  constructor(cubeSize) {
    this.cubeSize = cubeSize
    this.angleX = 0;
    this.doorAngle = 0;
    this.doorOpeningSpeed = 0.1;
    this.handleSize = 150;
  }
  
  create() {


    // Draw oven door
    push();
    // rectMode(CORNER)
    translate(0, this.cubeSize/2-this.cubeSize/2, this.cubeSize/2+5); // Position at the top of the oven box
    
    rotateX(-PI / 2 + this.doorAngle); // Rotate around the hinge at the bottom
    fill(200,100,240); // Light gray
    box(200, 200,3);

    // Draw handle
    translate(0, -50, 0); // Position handle near the bottom of the door
    fill(100); // Dark gray
//     rectMode(RADIUS)
    translate(this.cubeSize/2-this.cubeSize/2, 0, 10); // Position handle on the right side of the door
    box(this.handleSize, 20, 5); // Handle shape
    pop();

    // Update door angle (open/close based on mouse hover)
    if (this.mouseIsOverDoor()) {
      this.doorAngle -= this.doorOpeningSpeed;
    } else {
      this.doorAngle += this.doorOpeningSpeed;
    }
    this.doorAngle = constrain(this.doorAngle, 0, PI / 2);
  }

  
// Function to detect mouse hover over the oven door
  mouseIsOverDoor() {
    let halfWidth = width / 2;
    let halfHeight = height / 2;

    // Calculate boundaries of the door on the screen
    let minX = halfWidth - 100;
    let maxX = halfWidth + 100;
    let minY = halfHeight - 50;
    let maxY = halfHeight + 50;

    // Check if mouse coordinates are within the door boundaries
    return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;
  }
}
 
//   oven = new Oven()
//   fridge
//   cabinet
//   microwave
//   dishwasher


function rotateBoxAroundEdge(w, h, d, rotationAngle) {
  // Translate to the edge you want to rotate around
  translate(-w / 2, h / 2, d / 2);
  
  // Rotate the box
  rotateX(rotationAngle); // You can use rotateY or rotateZ depending on the desired rotation axis
  
  // Translate back to the original position
  translate(w / 2, -h / 2, -d / 2);
}