let cubeHovered = false;
let cylinderHovered = false;
let canvas;
let canvasParent;
let scaleFactor;

let baseObjectSize = 110;
let objectGap;

let cubeX = 0;
let cubeY = -80;

let cylinderX = 0;
let cylinderY = 250;

let font;
let cubeGraphics = [];
let cylinderTopGraphics, cylinderBottomGraphics, cylinderCurvedGraphics;

function preload() {
    // font = loadFont('./fonts/Daydream.ttf');
}

function setup() {
    // Create a WebGL canvas
    // canvasParent = document.getElementById("p5CanvasCont");
  
//     let divWidth = canvasParent.offsetWidth;
//     let divHeight = canvasParent.offsetHeight;
    let scaleX = 400;
    let scaleY = 800;
    canvas = createCanvas(scaleX, scaleY, WEBGL);
    // canvas.parent("#p5CanvasCont");

    calculateScaleFactor(scaleX, scaleY);
    
    // Create graphics for the cube and cylinder
    createCubeGraphics();
    createCylinderGraphics();
}

function draw() {
    background(224, 214, 255);
    noStroke();
  
    // Set the lights
    pointLight(150, 0, 80, mouseX - 200, mouseY - 200, 200);
    ambientLight(157, 167, 252);

    // Rotate both objects slightly in the x and y directions
    let rotationX = frameCount * 0.01;
    let rotationY = frameCount * 0.01;
  
    // Get mouse position relative to the WebGL canvas
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
  
    // Dynamic gap based on scaleFactor and object size
    objectGap = baseObjectSize * scaleFactor + 100 * scaleFactor;
    
    // Set fonts
    // textFont(font);

    // First object: Cube
    push();
    // Position the cube at the top of the div, adjusting with scaleFactor and Y-axis for vertical alignment
    translate(0, -height / 3 + baseObjectSize * scaleFactor / 2, 0); // Move the cube to the top
    rotateY(-rotationY); // Rotate the cube along Y-axis
    rotateX(rotationX); // Rotate the cube along X-axis

    // Detect if the mouse is hovering over the cube
    if (isMouseOverObject(mx, my, 0, -height / 3 + baseObjectSize * scaleFactor / 2, baseObjectSize * scaleFactor)) {
      cubeHovered = true;
      fill(255, 0, 0); // Change color to red when hovered
    } else {
      cubeHovered = false;
      fill(255); // Default color white
    }

    
   

    drawCubeFaces();
    // Draw the cube faces with different graphics textures
    
    pop();
  
    // Second object: Cylinder
    push();
    // Position the cylinder below the cube, along the Y-axis, maintaining the gap
    translate(0, -height / 3 + baseObjectSize * scaleFactor / 2 + objectGap, 0); // Move the cylinder down from the cube
    rotateY(rotationY); // Rotate the cylinder along Y-axis
    rotateX(-rotationX); // Rotate the cylinder along X-axis
  
    // Detect if the mouse is hovering over the cylinder
    if (isMouseOverObject(mx, my, 0, -height / 3 + baseObjectSize * scaleFactor / 2 + objectGap, baseObjectSize * scaleFactor)) {
      cylinderHovered = true;
      fill(0, 0, 255); // Change color to blue when hovered
    } else {
      cylinderHovered = false;
      fill(255); // Default color white
    }

    // Draw the cylinder with graphics textures
    let radius = baseObjectSize / 2.2 * scaleFactor;
    let cylinderHeight = baseObjectSize  * scaleFactor /1.2; // Renamed local variable

    // Curved surface
    push();
    rotateX(HALF_PI); // Rotate to match the curved surface
    texture(cylinderCurvedGraphics);
    cylinder(radius, cylinderHeight); // Draw the cylinder with the curved texture
    pop();

    pop();
}
  
// Function to detect if the mouse is over a 3D object
function isMouseOverObject(mx, my, objX, objY, scaledSize) {
    // Adjust the hover detection size and position based on scaleFactor
    let distance = dist(mx, my, objX, objY);
    return distance < scaledSize;  // Use scaled size for detection
}
  
// Handle mouse press on objects
function mousePressed() {
    if (cubeHovered) {
      console.log('Cube clicked!');
      // Add your action here when the cube is clicked
    }
  
    if (cylinderHovered) {
      console.log('Cylinder clicked!');
      // Add your action here when the cylinder is clicked
    }
}
  
// Resize the canvas when the window is resized or div size changes
function windowResized() {
    // Get the new div dimensions
    let divWidth = canvasParent.offsetWidth;
    let divHeight = canvasParent.offsetHeight;
  
    // Resize the canvas to match the new dimensions
    resizeCanvas(divWidth, divHeight);
  
    // Recalculate scaling factor and object gap
    calculateScaleFactor(divWidth, divHeight);

    // Recreate graphics to match the new size
    createCubeGraphics();
    createCylinderGraphics();
}
  
// Function to calculate the scaling factor based on the div size
function calculateScaleFactor(divWidth, divHeight) {
    // Calculate scale factor based on the smaller dimension to maintain aspect ratio
    scaleFactor = min(divWidth, divHeight) / 300;  // 600 is an arbitrary base size
}

// Function to create graphics for the cube
function createCubeGraphics() {
    cubeGraphics = [];
    let faces = ['MAKES', 'FABRI', 'MAKES', 'FABRI', 'MAKES', 'FABRI'];
  
    for (let i = 0; i < 6; i++) {
      let graphics = createGraphics(baseObjectSize * scaleFactor, baseObjectSize * scaleFactor);
      graphics.textSize(15 * scaleFactor);
      graphics.textAlign(CENTER, CENTER);
      // graphics.textFont(font);
      graphics.background(244,233,222);
      graphics.text(faces[i], graphics.width / 2, graphics.height / 2);
      graphics.noStroke();  // Remove border around text
      
      cubeGraphics.push(graphics);
    }
}

// Function to create graphics for the cylinder
function createCylinderGraphics() {
    let radius = baseObjectSize / 2 * scaleFactor;
    let cylinderHeight = baseObjectSize * 1.5 * scaleFactor; // Renamed local variable
  
    // // Top surface graphics
    // cylinderTopGraphics = createGraphics(radius * 2, radius * 2);
    // cylinderTopGraphics.textSize(20 * scaleFactor);
    // cylinderTopGraphics.textAlign(CENTER, CENTER);
    // cylinderTopGraphics.fill(0);
    // cylinderTopGraphics.text('Top Surface', cylinderTopGraphics.width / 2, cylinderTopGraphics.height / 2);
  
    // // Bottom surface graphics
    // cylinderBottomGraphics = createGraphics(radius * 2, radius * 2);
    // cylinderBottomGraphics.textSize(20 * scaleFactor);
    // cylinderBottomGraphics.textAlign(CENTER, CENTER);
    // cylinderTopGraphics.fill(0);
    // cylinderBottomGraphics.text('Bottom Surface', cylinderBottomGraphics.width / 2, cylinderBottomGraphics.height / 2);
  
    // Curved surface graphics
    cylinderCurvedGraphics = createGraphics(radius * 2, cylinderHeight);
    cylinderCurvedGraphics.textSize(10 * scaleFactor);
    // cylinderCurvedGraphics.textFont(font);
    cylinderCurvedGraphics.textAlign(CENTER, CENTER);
    cylinderCurvedGraphics.background(244,233,222);
    cylinderCurvedGraphics.fill(0);
    // Draw text around the curved surface
    let c = 1;
    for (let i = 0; i < 360; i += 40) {
      cylinderCurvedGraphics.push();
      cylinderCurvedGraphics.translate(radius, cylinderHeight / 2); // Move to center
      cylinderCurvedGraphics.rotate(radians(90)); // Rotate for each text placement
      if (c % 2 == 0) {
        cylinderCurvedGraphics.rotate(radians(180)); // Rotate for each text placement
        i -= 20;
      }
      c++;
      cylinderCurvedGraphics.text('ABOUT', 0, -cylinderHeight / 4 +(i)); // Draw text
      cylinderCurvedGraphics.pop();
    }
    // cylinderCurvedGraphics.push();
    // cylinderCurvedGraphics.translate(radius, cylinderHeight / 5); // Move to center
    // // cylinderCurvedGraphics.rotate(radians(90)); // Rotate for each text placement
    // cylinderCurvedGraphics.text('Curved Surface', 0, -cylinderHeight / 4 ); // Draw text
    // cylinderCurvedGraphics.pop();

    // cylinderCurvedGraphics.push();
    // cylinderCurvedGraphics.translate(radius, cylinderHeight +49); // Move to center
    // // cylinderCurvedGraphics.rotate(radians(90)); // Rotate for each text placement
    // cylinderCurvedGraphics.rotate(radians(0), [1,1,0]);
    // cylinderCurvedGraphics.textSize(20 * scaleFactor);
    // cylinderCurvedGraphics.text('Curved Surface', 0, -cylinderHeight / 4 ); // Draw text
    // cylinderCurvedGraphics.pop();

    cylinderCurvedGraphics.noStroke(); // Remove border around text
}

// Function to draw the cube faces with different graphics textures
function drawCubeFaces() {
   // Draw the cube with graphics textures
   push();
   // Front face
   translate(0, 0, baseObjectSize * scaleFactor / 2); // Move to the front face
   texture(cubeGraphics[0]);
   plane(baseObjectSize * scaleFactor); // Draw the front face
   pop();

   push();
   // Back face
   translate(0, 0, -baseObjectSize * scaleFactor / 2); // Move to the back face
   texture(cubeGraphics[1]);
   plane(baseObjectSize * scaleFactor); // Draw the back face
   pop();

   push();
   // Left face
   translate(-baseObjectSize * scaleFactor / 2, 0, 0); // Move to the left face
   rotateY(HALF_PI); // Rotate to match the left face
   texture(cubeGraphics[2]);
   plane(baseObjectSize * scaleFactor); // Draw the left face
   pop();

   push();
   // Right face
   translate(baseObjectSize * scaleFactor / 2, 0, 0); // Move to the right face
   rotateY(HALF_PI); // Rotate to match the right face
   texture(cubeGraphics[3]);
   plane(baseObjectSize * scaleFactor); // Draw the right face
   pop();

   push();
   // Top face
   translate(0, -baseObjectSize * scaleFactor / 2, 0); // Move to the top face
   rotateX(HALF_PI); // Rotate to match the top face
   texture(cubeGraphics[4]);
   plane(baseObjectSize * scaleFactor); // Draw the top face
   pop();

   push();
   // Bottom face
   translate(0, baseObjectSize * scaleFactor / 2, 0); // Move to the bottom face
   rotateX(HALF_PI); // Rotate to match the bottom face
   texture(cubeGraphics[5]);
   plane(baseObjectSize * scaleFactor); // Draw the bottom face
   pop();
}
