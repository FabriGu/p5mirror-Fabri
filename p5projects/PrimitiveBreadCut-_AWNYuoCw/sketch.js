let loafWidth = 150; // Width of the loaf of bread
let loafHeight = 100; // Height of the loaf of bread
let loafDepth = 100; // Depth of the loaf of bread

let knifeBladeWidth = 20; // Width of the knife blade
let knifeBladeHeight = 200; // Height of the knife blade
let knifeHandleWidth = 40; // Width of the knife handle
let knifeHandleHeight = 60; // Height of the knife handle
let knifeDepth = 50; // Depth of the knife blade into the loaf

let knifeYOffset = 20; // Offset for positioning the knife above the loaf

let knifeSpeed = 0.05; // Speed of the knife blade moving into the loaf
let knifeDirection = 1; // Direction of the knife blade movement

let knifePositionZ = 0; // Initial position of the knife blade along z-axis
let knifePositionY = 0; // Initial position of the knife blade along y-axis
let knifeMaxDepth = 50; // Maximum depth the knife blade goes into the loaf

function setup() {
  createCanvas(600, 400, WEBGL);
}

function draw() {
  background(220);
  
  // Ambient light
  ambientLight(200);

  // Directional light
  directionalLight(255, 255, 255, 1, -1, -1);

  // Rotate scene for better perspective
  rotateX(PI / 6);

  // Draw loaf of bread
  push();
  translate(0, 0, -loafDepth / 2);
  fill(244, 164, 96); // Light brown color for bread
  box(loafWidth, loafHeight, loafDepth);
  pop();

  // Calculate knife blade position
  let knifeZ = map(sin(frameCount * knifeSpeed), -1, 1, 0, knifeMaxDepth);
  knifePositionZ = knifeZ;

  // Draw knife blade
  push();
  translate(0, knifeYOffset, -loafDepth / 2 - knifePositionZ);
  fill(192, 192, 192); // Silver color for knife
  box(knifeBladeWidth, knifeBladeHeight, knifeDepth);
  pop();

  // Draw knife handle
  push();
  translate(0, knifeYOffset + knifeBladeHeight / 2 + knifeHandleHeight / 2, -loafDepth / 2 - knifePositionZ - knifeDepth / 2);
  fill(192, 192, 192); // Silver color for knife handle
  box(knifeHandleWidth, knifeHandleHeight, knifeHandleWidth);
  pop();
}
