let bodySegmentation;
let video;
let segmentation;

// Define which body parts to show
const enabledParts = {
  0: false,  // LEFT_FACE
  1: false,  // RIGHT_FACE
  2: true,   // LEFT_UPPER_ARM_FRONT
  3: true,   // LEFT_UPPER_ARM_BACK
  4: true,   // RIGHT_UPPER_ARM_FRONT
  5: true,   // RIGHT_UPPER_ARM_BACK
  6: true,   // LEFT_LOWER_ARM_FRONT
  7: true,   // LEFT_LOWER_ARM_BACK
  8: true,   // RIGHT_LOWER_ARM_FRONT
  9: true,   // RIGHT_LOWER_ARM_BACK
  10: false, // LEFT_HAND
  11: false, // RIGHT_HAND
  12: true,  // TORSO_FRONT
  13: true,  // TORSO_BACK
  14: true,  // LEFT_UPPER_LEG_FRONT
  15: true,  // LEFT_UPPER_LEG_BACK
  16: true,  // RIGHT_UPPER_LEG_FRONT
  17: true,  // RIGHT_UPPER_LEG_BACK
  18: true,  // LEFT_LOWER_LEG_FRONT
  19: true,  // LEFT_LOWER_LEG_BACK
  20: true,  // RIGHT_LOWER_LEG_FRONT
  21: true,  // RIGHT_LOWER_LEG_BACK
  22: false, // LEFT_FOOT
  23: false  // RIGHT_FOOT
};

let options = {
  maskType: "parts"
};

function preload() {
  bodySegmentation = ml5.bodySegmentation("BodyPix", options);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  bodySegmentation.detectStart(video, gotResults);
}

function draw() {
  background(255);
  image(video, 0, 0);
  
  if (segmentation) {
    // Get the segmentation data
    let parts = segmentation.parts;
    let maskImage = segmentation.mask;
    
    // Create a copy of the mask to modify
    let modifiedMask = maskImage.get();
    modifiedMask.loadPixels();
    
    // Modify the mask based on enabled parts
    for (let i = 0; i < parts.length; i++) {
      let partNum = parts[i];
      if (!enabledParts[partNum]) {
        // If part is disabled, make it transparent
        let pixelIndex = i * 4;
        modifiedMask.pixels[pixelIndex + 3] = 0;
      }
    }
    
    modifiedMask.updatePixels();
    image(modifiedMask, 0, 0);
  }
}

function gotResults(result) {
  segmentation = result;
}

// Toggle parts with number keys 0-9
function keyPressed() {
  if (key >= '0' && key <= '9') {
    let num = parseInt(key);
    enabledParts[num] = !enabledParts[num];
    console.log(`Part ${num} is now ${enabledParts[num] ? 'enabled' : 'disabled'}`);
  }
}