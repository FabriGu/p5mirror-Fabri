let camX = 0;
let camY = 0;
let camZ = 600;
let camZoomTargetZ = 400;
let camZcurr = 600;

let cube; // Instance of Cube

let stove;
let oven;
let bread;
let knife;

function preload() {
  stove = new Stove();
  oven = new Oven();
  bread = new Bread();
  knife = new Knife();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // Ambient light
  ambientLight(500);
  directionalLight(255, 255, 255, 1, -1, -1);

  // Initialize camera
  cam = createCamera();
  cam.setPosition(camX, camY, camZ); // Default position
  cam.lookAt(0, 0, 0); // Look at the origin

  // Initialize cube
  cube = new Cube(200);
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
    push();
    translate(0, 0, this.size / 2);
    rotateY(0);
    stove.display();
    pop();
    beginShape();
    
    vertex(-this.size / 2, -this.size / 2, -this.size / 2); // Front face
    vertex(this.size / 2, -this.size / 2, -this.size / 2);
    vertex(this.size / 2, this.size / 2, -this.size / 2);
    vertex(-this.size / 2, this.size / 2, -this.size / 2);
    endShape(CLOSE);

    fill(color("#f4a261"));
    
    push();
    fill(color("#f4a261"));
    translate(0, 0, -this.size / 2);
    rotateY(PI);
    oven.display();
    pop();

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
  

    // Draw the cube with different 3D objects on each face
   

    push();
    translate(-this.size / 2, 0, 0);
    rotateY(HALF_PI);
    bread.display();
    pop();

    push();
    translate(this.size / 2, 0, 0);
    rotateY(-HALF_PI);
    knife.display();
    pop();
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
  constructor() {
    this.size = 100;
  }

  display() {
    push();
    ambientMaterial(255, 0, 0);
    box(this.size, 10, this.size);
    for (let i = 0; i < 4; i++) {
      translate(-this.size / 2 + 20, 0, -this.size / 2 + 20);
      cylinder(10, 2);
    }
    pop();
  }
}

class Oven {
  constructor() {
    this.size = 100;
  }

  display() {
    push();
    ambientMaterial(150);
    box(this.size, 60, this.size);
    translate(0, -this.size / 4, this.size / 2 - 10);
    cylinder(20, 40);
    pop();
  }
}

class Bread {
  constructor() {
    this.size = 100;
  }

  display() {
    push();
    ambientMaterial(200, 150, 100);
    box(this.size, this.size / 2, this.size / 2);
    pop();
  }
}

class Knife {
  constructor() {
    this.size = 100;
  }

  display() {
    push();
    ambientMaterial(100);
    translate(0, -this.size / 2, 0);
    box(5, this.size, 10);
    translate(0, -this.size / 2, 0);
    box(2, 10, 2);
    pop();
  }
}
