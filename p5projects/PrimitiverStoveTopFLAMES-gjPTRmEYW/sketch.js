let cubeSize = 200; // Size of the cube
let burnerSize = cubeSize / 5; // Size of each burner
let burners = []; // Array to hold burner objects
let flameSize = burnerSize / 3; // Size of the flame

function setup() {
  createCanvas(600, 400, WEBGL);
  
  // Create burners
  for (let i = 0; i < 4; i++) {
    let xPos = (i % 2 === 0 ? -1 : 1) * cubeSize / 3;
    let yPos = (i < 2 ? -1 : 1) * cubeSize / 3;
    let burner = new Burner(xPos, yPos, burnerSize);
    burners.push(burner);
  }
}

function draw() {
  background(220);
  
  // Ambient light
  ambientLight(200);

  // Directional light
  directionalLight(255, 255, 255, 1, -1, -1);

  // Rotate scene for better perspective
  rotateX(PI / 6);

  // Draw stove top as a cube face
  translate(0, 0, -cubeSize / 2);
  fill(150);
  plane(cubeSize);

  // Display burners with always-on flames
  for (let burner of burners) {
    burner.display();
  }
}

// Class for a burner
class Burner {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  // Display the burner and always-on flame
  display() {
    push();
    translate(this.x, this.y, -cubeSize / 2 - 1); // Position below stove top
    fill(255, 0, 0); // Red for burner

    // Draw burner
    circle(0, 0, this.size);

    // Draw always-on flame
    this.drawFlame();

    pop();
  }

  // Draw flame above the burner
  drawFlame() {
    fill(255, 150, 0); // Orange for flame
    ellipse(random(-this.size / 4, this.size / 4), random(-this.size / 4, this.size / 4), flameSize, flameSize);
  }
}
