let img;
let pixelSize = 12; // Size of each pixel block
let blocks = [];
let lightAngle = 0; // Angle for rotating light
let lightRadius = 300; // Distance of light from center
let lightHeight = 1050; // Height of light above the plane

function preload() {
  img = loadImage('./portrait3.png');
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
  createCanvas(1080, 1080, WEBGL);
  
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
  
  // Calculate rotating light position in 3D space
  let lightX = cos(lightAngle) * lightRadius;  // X position in orbit
  let lightY = sin(lightAngle) * lightRadius;  // Y position in orbit
  let lightZ = camZ - lightHeight;  // Z position relative to camera
  
  // Add ambient light
  ambientLight(2);
  
  // Create normalized direction vector from light position to center of plane (0,0,0)
  let dirX = -lightX;  // Vector from light to center (X)
  let dirY = -lightY;  // Vector from light to center (Y)
  let dirZ = -lightZ;  // Vector from light to center (Z)
  
  // Normalize the direction vector
  let magn = sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
  dirX /= magn;
  dirY /= magn;
  dirZ /= magn;
  
  // Apply directional lights
  directionalLight(255, 255, 255, -dirX, -dirY, -dirZ);
  directionalLight(255, 255, 255, -dirX, -dirY, -dirZ);
    directionalLight(255, 255, 255, -dirX, -dirY, -dirZ);

    directionalLight(255, 255, 255, -dirX, -dirY, -dirZ);

  
  ambientMaterial(100); // Very dark base color
  specularMaterial(100);
  shininess(255); // Higher shininess for more focused reflections
  
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