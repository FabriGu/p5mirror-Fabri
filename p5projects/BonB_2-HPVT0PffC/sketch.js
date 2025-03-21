let img;
let pixelSize = 10; // Size of each pixel block
let blocks = [];
let lightAngle = 0; // Angle for rotating light
let lightRadius = 800; // Distance of light from center
let lightHeight = 600; // Height of light above the plane

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
  createCanvas(800, 600, WEBGL);
  
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
  
  // Set up the camera to look straight at the plane
  let camZ = (height/2) / tan(PI/6);
  camera(0, 0, camZ, 0, 0, 0, 0, 1, 0);
  
  // Calculate rotating light position
  let lightX = cos(lightAngle) * lightRadius;
  let lightY = sin(lightAngle) * lightRadius;
  
  // Add minimal ambient light
  ambientLight(5);
  
  // Add directional light from the rotating position
  // Calculate direction vector from light position to center (0,0,0)
  let dirX = -lightX;
  let dirY = -lightY;
  let dirZ = -lightHeight;
  // Normalize the direction vector
  let magn = sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
  dirX /= magn;
  dirY /= magn;
  dirZ /= magn;
  
  // Apply directional light
  directionalLight(255, 255, 255, dirX, dirY, dirZ);
  
  // Set material properties
  specularMaterial(50);
  shininess(10);
  
  // Draw the base plane
  fill(0);
  translate(0, 0, -25);
  plane(img.width, img.height);
  translate(0, 0, 25);
  
  // Draw all blocks
  for (let block of blocks) {
    push();
    translate(block.x, block.y, block.height/2);
    box(pixelSize-1, pixelSize-1, block.height);
    pop();
  }
  
  // Update light position for next frame
  lightAngle += 0.02; // Adjust speed of rotation
}

// Optional: Add controls for light parameters
function keyPressed() {
  if (keyCode === UP_ARROW) {
    lightHeight += 50;
  } else if (keyCode === DOWN_ARROW) {
    lightHeight -= 50;
  } else if (keyCode === LEFT_ARROW) {
    lightRadius -= 50;
  } else if (keyCode === RIGHT_ARROW) {
    lightRadius += 50;
  }
}