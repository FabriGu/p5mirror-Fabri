let angleX = 0;
let doorAngle = 0;
let doorOpeningSpeed = 0.1;
let handleSize = 20;

function setup() {
  createCanvas(600, 400, WEBGL);
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

  // Draw oven box
  push();
  translate(0, 50, 0);
  fill(150); // Dark gray
  box(200, 150, 100);
  pop();

  // Draw oven door
  push();
  translate(0, 75, 50); // Position at the top of the oven box
  rotateX(-PI / 2 + doorAngle); // Rotate around the hinge at the bottom
  fill(200); // Light gray
  plane(200, 100);

  // Draw handle
  translate(0, -50, 0); // Position handle near the bottom of the door
  fill(100); // Dark gray
  translate(80, 0, 0); // Position handle on the right side of the door
  box(handleSize, 20, 5); // Handle shape
  pop();

  // Update door angle (open/close based on mouse hover)
  if (mouseIsOverDoor()) {
    doorAngle += doorOpeningSpeed;
  } else {
    doorAngle -= doorOpeningSpeed;
  }
  doorAngle = constrain(doorAngle, 0, PI / 2);
}

// Function to detect mouse hover over the oven door
function mouseIsOverDoor() {
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


