// Copyright (c) 2020 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
BodyPix
=== */

let bodypix;
let video;
let segmentation;


// Words to display on the mask
const words = ["Hello", "World", "OpenAI", "Mask", "Example"];
// Margin to ensure words are not drawn too close to the edges or to each other
const margin = 20;

const options = {
  maskType: "parts",
  outputStride: 8, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.3, // 0 - 1, defaults to 0.5
  "palette": {
    "leftFace": {
      "id": 0,
      "color": [110, 64, 170, 0]
    },
    "rightFace": {
      "id": 1,
      "color": [106, 72, 183, 0]
    },
    "rightUpperLegFront": {
      "id": 2,
      "color": [100, 81, 196, 0]
    },
    "rightLowerLegBack": {
      "id": 3,
      "color": [92, 91, 206, 0]
    },
    "rightUpperLegBack": {
      "id": 4,
      "color": [84, 101, 214, 0]
    },
    "leftLowerLegFront": {
      "id": 5,
      "color": [75, 113, 221, 0]
    },
    "leftUpperLegFront": {
      "id": 6,
      "color": [66, 125, 224, 0]
    },
    "leftUpperLegBack": {
      "id": 7,
      "color": [56, 138, 226, 0]
    },
    "leftLowerLegBack": {
      "id": 8,
      "color": [48, 150, 224, 0]
    },
    "rightFeet": {
      "id": 9,
      "color": [40, 163, 220, 0]
    },
    "rightLowerLegFront": {
      "id": 10,
      "color": [33, 176, 214, 0]
    },
    "leftFeet": {
      "id": 11,
      "color": [29, 188, 205, 0]
    },
    "torsoFront": {
      "id": 12,
      "color": [26, 199, 194, 0]
    },
    "torsoBack": {
      "id": 13,
      "color": [26, 210, 182, 0]
    },
    "rightUpperArmFront": {
      "id": 14,
      "color": [28, 219, 169, 0]
    },
    "rightUpperArmBack": {
      "id": 15,
      "color": [33, 227, 155, 0]
    },
    "rightLowerArmBack": {
      "id": 16,
      "color": [41, 234, 141, 0]
    },
    "leftLowerArmFront": {
      "id": 17,
      "color": [51, 240, 128, 0]
    },
    "leftUpperArmFront": {
      "id": 18,
      "color": [64, 243, 116, 0]
    },
    "leftUpperArmBack": {
      "id": 19,
      "color": [79, 246, 105, 0]
    },
    "leftLowerArmBack": {
      "id": 20,
      "color": [96, 247, 97, 0]
    },
    "rightHand": {
      "id": 21,
      "color": [115, 246, 91, 0]
    },
    "rightLowerArmFront": {
      "id": 22,
      "color": [134, 245, 88, 0]
    },
    "leftHand": {
      "id": 23,
      "color": [155, 243, 88, 0]
    }
  },
};


function preload() {
  bodypix = ml5.bodyPix(options);
}

function setup() {
  createCanvas(320, 240);
  //------
  // Create a transparent overlay with the same dimensions as the canvas
  overlay = createGraphics(width, height);
  //------
  // load up your video
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  
  //-----
  maskGraphics = createGraphics(width, height);
}

function videoReady() {
  bodypix.segment(video, gotResults);
}

function draw() {
  background(0);
  if (segmentation && segmentation.personMask) {
    // Copy the person mask to manipulate it
    let mask = segmentation.personMask.get();
    // Draw words directly on the mask
    fill(255); // Set text color to white
    textSize(0); // Start with a zero font size
    textAlign(LEFT, TOP); // Set text alignment
    for (let word of words) {
      // Randomize font size
      let fontSize = random(12, 36); // Adjust range as needed
      textSize(fontSize); // Set font size
      // Calculate width of the word
      let wordWidth = textWidth(word);
      // Randomize position within the mask
      let x = int(random(margin, width - wordWidth - margin));
      let y = int(random(margin, height - fontSize - margin));
      // Draw the word onto the mask
      text(word, x, y);
    }
    // Update the person mask with the modified pixels
    segmentation.personMask = createImage(mask.width, mask.height);
    segmentation.personMask.loadPixels();
    for (let i = 0; i < mask.pixels.length; i += 4) {
      if (mask.pixels[i] === 255) {
        segmentation.personMask.pixels[i] = 255;
        segmentation.personMask.pixels[i + 1] = 255;
        segmentation.personMask.pixels[i + 2] = 255;
        segmentation.personMask.pixels[i + 3] = 255;
      }
    }
    segmentation.personMask.updatePixels();
    // Display the masked person
    image(segmentation.personMask, 0, 0, width, height);
  }
  // if (segmentation && segmentation.personMask) {
  //   // Draw the person mask
  //   image(segmentation.personMask, 0, 0, width, height);
  //   // Set initial position for drawing words
  //   let x = margin;
  //   let y = margin;
  //   // Draw words directly on the mask
  //   fill(255); // Set text color to white
  //   textSize(0); // Start with a zero font size
  //   textAlign(LEFT, TOP); // Set text alignment
  //   for (let word of words) {
  //     // Randomize font size
  //     let fontSize = random(12, 36); // Adjust range as needed
  //     textSize(fontSize); // Set font size
  //     // Calculate width of the word
  //     let wordWidth = textWidth(word);
  //     // Check if there is enough space on the current line
  //     if (x + wordWidth + margin > width) {
  //       // Move to the next line
  //       x = margin;
  //       y += fontSize + margin; // Move down by font size + margin
  //     }
  //     // Draw the word
  //     text(word, x, y);
  //     // Update x position for the next word
  //     x += wordWidth + margin;
  //   }
  // }
  // if (segmentation) {
  //   image(segmentation.personMask, 0, 0, width, height);
  // }
}

function gotResults(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  segmentation = result;
  bodypix.segment(video, gotResults);
  // console.log(segmentation)
}
