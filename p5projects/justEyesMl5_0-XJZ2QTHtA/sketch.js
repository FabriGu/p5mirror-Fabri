let faceMesh;
let capture;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
// Positions for the eye images
let leftEyePos = { x: 100, y: 100 };
let rightEyePos = { x: 400, y: 100 };
// Size of the eye region to capture
const EYE_WIDTH = 100;
const EYE_HEIGHT = 60;

// Dithering thresholds
const THRESHOLD_DARK_GREY = 200;
const THRESHOLD_LIGHT_GREY = 300;
const THRESHOLD_VLIGHT_GREY = 400;

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();
  faceMesh.detectStart(capture, gotFaces);
}

function draw() {
  background(0);
  
  if (capture.loadedmetadata) {
    let img = capture.get(); // Get the full frame first
    
    if (faces.length > 0) {
      let face = faces[0];
      
      // Get the center points for each eye
      let leftEyeCenter = getEyeCenter(face.leftEye.keypoints);
      let rightEyeCenter = getEyeCenter(face.rightEye.keypoints);
      
      // Create images for each eye
      let leftEye = createImage(EYE_WIDTH, EYE_HEIGHT);
      let rightEye = createImage(EYE_WIDTH, EYE_HEIGHT);
      
      // Copy eye regions from the main frame
      leftEye.copy(
        img,
        Math.floor(leftEyeCenter.x - EYE_WIDTH/2),
        Math.floor(leftEyeCenter.y - EYE_HEIGHT/2),
        EYE_WIDTH,
        EYE_HEIGHT,
        0,
        0,
        EYE_WIDTH,
        EYE_HEIGHT
      );
      
      rightEye.copy(
        img,
        Math.floor(rightEyeCenter.x - EYE_WIDTH/2),
        Math.floor(rightEyeCenter.y - EYE_HEIGHT/2),
        EYE_WIDTH,
        EYE_HEIGHT,
        0,
        0,
        EYE_WIDTH,
        EYE_HEIGHT
      );
      
      // Apply dithering to both eye images
      applyDithering(leftEye);
      applyDithering(rightEye);
      
      // Display the processed images
      image(leftEye, leftEyePos.x, leftEyePos.y);
      image(rightEye, rightEyePos.x, rightEyePos.y);
    }
  }
}

function applyDithering(img) {
  img.loadPixels();
  
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let loc = (x + y * img.width) * 4;
      let r = img.pixels[loc];
      let g = img.pixels[loc + 1];
      let b = img.pixels[loc + 2];
      let rgb = Math.floor(r + g + b);
      
      let pixelValue = 255;
      
      // Dark grey threshold
      if (rgb < THRESHOLD_DARK_GREY) {
        pixelValue = 0;
      }
      // Light grey pattern
      else if (rgb < THRESHOLD_LIGHT_GREY &&
               ((x % 4 === 0 && y % 4 === 0) || (x % 4 === 2 && y % 4 === 2))) {
        pixelValue = 0;
      }
      // Very light grey pattern
      else if (rgb < THRESHOLD_VLIGHT_GREY &&
               ((x % 5 === 0 && y % 5 === 0) || (x % 5 === 3 && y % 5 === 3))) {
        pixelValue = 0;
      }
      
      img.pixels[loc] = pixelValue;
      img.pixels[loc + 1] = pixelValue;
      img.pixels[loc + 2] = pixelValue;
    }
  }
  
  img.updatePixels();
}

function getEyeCenter(keypoints) {
  let sumX = 0;
  let sumY = 0;
  
  for (let point of keypoints) {
    sumX += point.x;
    sumY += point.y;
  }
  
  return {
    x: sumX / keypoints.length,
    y: sumY / keypoints.length
  };
}

function gotFaces(results) {
  faces = results;
}

function mouseDragged() {
  // Check if mouse is over left eye
  if (mouseX > leftEyePos.x && mouseX < leftEyePos.x + EYE_WIDTH &&
      mouseY > leftEyePos.y && mouseY < leftEyePos.y + EYE_HEIGHT) {
    leftEyePos.x = mouseX - EYE_WIDTH/2;
    leftEyePos.y = mouseY - EYE_HEIGHT/2;
  }
  // Check if mouse is over right eye
  else if (mouseX > rightEyePos.x && mouseX < rightEyePos.x + EYE_WIDTH &&
           mouseY > rightEyePos.y && mouseY < rightEyePos.y + EYE_HEIGHT) {
    rightEyePos.x = mouseX - EYE_WIDTH/2;
    rightEyePos.y = mouseY - EYE_HEIGHT/2;
  }
}