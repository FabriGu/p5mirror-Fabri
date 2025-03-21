let img;
let pixelSize = 12; // Size of each pixel block
let blocks = [];
let lightAngle = 0; // Angle for rotating light
let lightRadius = 800; // Distance of light from center
let lightHeight = 1000; // Height of light above the plane

function preload() {
  // Replace with your image path
  img = loadImage('./img.png');
}

class Block {
  constructor(x, y, brightness) {
    this.x = x;
    this.y = y;
    // Map brightness to height (0-255 to 0-50)
    this.height = map(brightness, 0, 255, 5, 50); // Minimum height of 5 to ensure visibility
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
      
      // Create blocks for all pixels (no threshold)
      blocks.push(new Block(x - img.width/2, y - img.height/2, brightness));
    }
  }
}

function draw() {
  background(0);
  
  // Calculate dynamic camera distance based on image dimensions
  let fov = PI/4; // 30 degrees field of view
  // Use the larger of width or height to ensure entire image is visible
  let maxDimension = max(img.width, img.height);
  // Calculate required distance using trigonometry
  // Adding a 1.2 multiplier for some padding around the edges
  let camZ = (maxDimension/2) / tan(fov/2) * 1.2;
  camera(0, 0, camZ, 0, 0, 0, 0, 1, 0);
  
  // Calculate rotating light position
  let lightX = cos(lightAngle) * lightRadius;
  let lightY = sin(lightAngle) * lightRadius;
  
  // Minimal ambient light to keep things very dark by default
  ambientLight(2);
  
  // Create direction vector for light that's always parallel to the ground
  // Instead of pointing to (0,0,0), point to (lightX, lightY, 0)
  // This makes light rays more parallel like sunlight
  let dirX = 0;  // No horizontal angle since we want rays parallel to ground
  let dirY = 0;
  let dirZ = -1; // Always pointing straight down
  
  // Optional: Add slight angle towards center while maintaining mostly parallel rays
  let centerInfluence = 0.2; // Adjust this value to control how much light points toward center
  dirX = -lightX * centerInfluence;
  dirY = -lightY * centerInfluence;
  
  // Normalize the direction vector
  let magn = sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
  dirX /= magn;
  dirY /= magn;
  dirZ /= magn;
  
  // More focused directional light
  directionalLight(255, 255, 255, -dirX, -dirY, -dirZ);
  
  // Dark material with high specular reflection
  ambientMaterial(10); // Very dark base color
  specularMaterial(100);
  shininess(200); // Higher shininess for more focused reflections
  
  // Draw all blocks
  push();
  for (let block of blocks) {
    push();
    translate(block.x, block.y, block.height/2);
    box(pixelSize-1, pixelSize-1, block.height);
    pop();
  }
  pop();
  
  // Update light position for next frame
  lightAngle += 0.1; // Slower rotation
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