let angleX = 0;
let angleY = 0;
let cubeSize = 200;

function setup() {
  createCanvas(1000, 400, WEBGL);
  noStroke();
}

function draw() {
  background(220);

  // Ambient light
  ambientLight(200);

  // Directional light
  directionalLight(255, 255, 255, 1, -1, -1);

  // Rotate the entire scene slightly for better perspective
  rotateX(PI / 6);

  // Translate to the center and rotate according to angles
  // translate(width / 2, height / 2);
  rotateX(angleX);
  rotateY(angleY);

  // Draw the stove top (one face of the cube)
  // Burners are represented by circles
  push();
  translate(0, 0, cubeSize / 2); // Position at the front face of the cube
  fill(150); // Dark gray for stove top
  plane(cubeSize); // Stove top as a plane
  pop();

  // Draw burners on the stove top
  let burnerRadius = cubeSize / 8; // Radius of each burner
  let burnerSpacing = cubeSize / 4; // Spacing between burners

  push();
  translate(0, 0, cubeSize / 2 + 1); // Ensure burners are above the stove top plane
  fill(255, 0, 0); // Red color for burners
  circle(-burnerSpacing, -burnerSpacing, burnerRadius * 2); // Top-left burner
  circle(burnerSpacing, -burnerSpacing, burnerRadius * 2); // Top-right burner
  circle(-burnerSpacing, burnerSpacing, burnerRadius * 2); // Bottom-left burner
  circle(burnerSpacing, burnerSpacing, burnerRadius * 2); // Bottom-right burner
  pop();
}

// Rotate the scene based on mouse movement
function mouseMoved() {
  let angleSpeed = 0.01;
  angleY = map(mouseX, 0, width, -PI / 4, PI / 4);
  angleX = map(mouseY, 0, height, -PI / 4, PI / 4);
}

