let img;
let pixelSize = 10; // Size of each pixel block
let blocks = [];
// let angle = Math.PI / 4; // Rotation angle of the plane
// let angle = Math.PI/10;
let angle= 0;
function preload() {
  // Replace with your image path
  img = loadImage('./img.png');
}

class Block {
  constructor(x, y, brightness) {
    this.x = x;
    this.y = y;
    // Map brightness to height (0-255 to 0-50)
    this.height = map(brightness, 0, 255, 0, 50);
  }
}

function setup() {
  pixelDensity(1)
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Process the image once it's loaded
  img.loadPixels();
  
  // Sample the image at regular intervals to create blocks
  for (let x = 0; x < img.width; x += pixelSize) {
    for (let y = 0; y < img.height; y += pixelSize) {
      // Get the brightness of this pixel region
      let brightness = 0;
      for (let i = 0; i < pixelSize; i++) {
        for (let j = 0; j < pixelSize; j++) {
          if (x + i < img.width && y + j < img.height) {
            let index = 4 * ((y + j) * img.width + (x + i));
            // Average RGB values to get brightness
            brightness += (img.pixels[index] + img.pixels[index + 1] + img.pixels[index + 2]) / 3;
          }
        }
      }
      brightness /= (pixelSize * pixelSize);
      
      // Create a block if the brightness is above threshold
      if (brightness > 20) { // Adjust threshold as needed
        blocks.push(new Block(x - img.width/2, y - img.height/2, brightness));
      }
    }
  }
}

function draw() {
  background(0);
  orbitControl()
  
  // Set up the camera
  let camX = width/2;
  let camY = height/2;
  let camZ = width/2;
  // let camZ = (height/2) / tan(PI/6)/2;
  camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
  
  // Calculate light position based on mouse
  let lightX = map(mouseX, 0, width, -500, 500);
  let lightY = map(mouseY, 0, height, -500, 500);
  
  // Add ambient and point light
  ambientLight(20);
  pointLight(255, 255, 255, lightX, lightY, 200);
  
  // Set material properties
  specularMaterial(50);
  shininess(10);
  
  // Rotate the entire scene
  rotateY(PI);
  
  // Draw the base plane
  fill(0);
  translate(0, 0, -105);
  plane(img.width, img.height);
  // translate(0, 0, 105);
  
  // Draw all blocks
  for (let block of blocks) {
    push();
    translate(block.x, block.y, block.height/2);
    box(pixelSize-1, pixelSize-1, block.height);
    pop();
  }
}

// Optional: Add interactivity to adjust the angle
function keyPressed() {
  if (keyCode === UP_ARROW) {
    angle += 0.1;
  } else if (keyCode === DOWN_ARROW) {
    angle -= 0.1;
  }
}