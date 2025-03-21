let cubeSize = 200;
let angleX = 0;
let angleY = 0;
let targetAngleX = 0;
let targetAngleY = 0;
let zoom = 0;
const zoomFactor = 50;

//MINE
// variables to keep track of whether are above and below the original cube face orientation
let above = false; 
let below = false;
// varaibles for x and y position of cam
let camX = 0;
let camY = 0;
let camZ = 600;
let camZoomTargetX = 0;
let camZoomTargetY = 0;
let camZoomTargetZ = 400;
let camZcurr = 600;


let cube; // Instance of Cube


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  
  // Initialize camera
  cam = createCamera();
  cam.setPosition(camX, camY, camZ); // Default position
  cam.lookAt(0, 0, 0); // Look at the origin
  
  // Initialize cube
  cube = new Cube(200);
}

function draw() {
  background(200);
  //MINE
  // fov = PI/3
  // cameraZ = (height/2.0) / tan(fov/2.0);
  
  // Hover effect
  if (mouseIsOverCube()) {
    // cameraZ = lerp(zoom, zoomFactor, 0.1);
//     camZ = lerp(zoom, zoomFactor, 0.01);

    if ((camZcurr > camZoomTargetZ) ) {
      camZcurr += (camZoomTargetZ - camZ) * 0.1;
    }
    cam.setPosition(0, 0, camZcurr);

  } else {
    // zoom = lerp(zoom, 0, 0.1);
    // cam.setPosition(0, 0, camZ);
    if (camZcurr <= camZ) {
      camZcurr -= (camZoomTargetZ - camZ) * 0.1;
    }
    cam.setPosition(0, 0, camZcurr);
  }

  // Translate and zoom
  translate(0, 0, zoom);

  // Rotate cube
  rotateX(angleX);
  rotateY(angleY);

  // Draw cube
  // fill(150, 0, 0);
  // box(cubeSize);
  
  // Draw the cube with different colors on each side
  fill(color("#e76f51"));
  beginShape();
  vertex(-cubeSize / 2, -cubeSize / 2, -cubeSize / 2); // Front face
  vertex(cubeSize / 2, -cubeSize / 2, -cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, -cubeSize / 2);
  vertex(-cubeSize / 2, cubeSize / 2, -cubeSize / 2);
  endShape(CLOSE);

  fill(color("#f4a261"));
  beginShape();
  vertex(-cubeSize / 2, -cubeSize / 2, cubeSize / 2); // Back face
  vertex(cubeSize / 2, -cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, cubeSize / 2);
  vertex(-cubeSize / 2, cubeSize / 2, cubeSize / 2);
  endShape(CLOSE);

  fill(color("#e9c46a"));
  beginShape();
  vertex(-cubeSize / 2, -cubeSize / 2, -cubeSize / 2); // Left face
  vertex(-cubeSize / 2, -cubeSize / 2, cubeSize / 2);
  vertex(-cubeSize / 2, cubeSize / 2, cubeSize / 2);
  vertex(-cubeSize / 2, cubeSize / 2, -cubeSize / 2);
  endShape(CLOSE);

  fill(color("#8ab17d"));
  beginShape();
  vertex(cubeSize / 2, -cubeSize / 2, -cubeSize / 2); // Right face
  vertex(cubeSize / 2, -cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, -cubeSize / 2);
  endShape(CLOSE);

  fill(color("#2a9d8f"));
  beginShape();
  vertex(-cubeSize / 2, -cubeSize / 2, -cubeSize / 2); // Top face
  vertex(-cubeSize / 2, -cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, -cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, -cubeSize / 2, -cubeSize / 2);
  endShape(CLOSE);

  fill(color("#264653"));
  beginShape();
  vertex(-cubeSize / 2, cubeSize / 2, -cubeSize / 2); // Bottom face
  vertex(-cubeSize / 2, cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, cubeSize / 2);
  vertex(cubeSize / 2, cubeSize / 2, -cubeSize / 2);
  endShape(CLOSE);


  // Animate rotation
  if (abs(angleX - targetAngleX) > 0.01) {
    angleX += (targetAngleX - angleX) * 0.1;
  }
  if (abs(angleY - targetAngleY) > 0.01) {
    angleY += (targetAngleY - angleY) * 0.1;
  }
  
//   perspective(0.35, 1.6, 100, 1000);
}

function mousePressed() {
  if (!mouseIsOverCube()) {
    if (mouseX > width / 2 + cubeSize / 2) {
      if (above) {
        // console.log()
        targetAngleY -= HALF_PI;
        targetAngleX += HALF_PI;
        above = false;
      } else if (below) {
        targetAngleY -= HALF_PI;
        targetAngleX -= HALF_PI;
        below = false;
      } else {
        // Clicked to the right
        targetAngleY -= HALF_PI;
      }
    } else if (mouseX < width / 2 - cubeSize / 2) {
      if (above) {
        // console.log()
        targetAngleY += HALF_PI;
        targetAngleX += HALF_PI;
        above = false;
      } else if (below) {
        targetAngleY += HALF_PI;
        targetAngleX -= HALF_PI;
        below = false;
      } else {
      // Clicked to the left
      targetAngleY += HALF_PI;
      }
    } else if (mouseY < height / 2 - cubeSize / 2) {
      // Clicked above
      targetAngleX -= HALF_PI;
      //MINE
      above = true;
    } else if (mouseY > height / 2 + cubeSize / 2) {
      // Clicked below
      targetAngleX += HALF_PI;
      //MINE
      below = true;
    }
  }
}

function mouseIsOverCube() {
  // Transform screen coordinates to world coordinates
  let worldX = mouseX - width / 2;
  let worldY = mouseY - height / 2;
  
  // Check if mouse is over the cube
  return (abs(worldX) < cubeSize / 2 && abs(worldY) < cubeSize / 2);
}
