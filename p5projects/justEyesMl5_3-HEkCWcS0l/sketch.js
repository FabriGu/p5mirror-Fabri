let faceMesh;
let capture;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let centerPos = { x: 0, y: 0 };
const BASE_EYE_WIDTH = 100;
const BASE_EYE_HEIGHT = 60;
const REFERENCE_EYE_DISTANCE = 150;

// Store frames for delay effect
const MAX_FRAMES = 30;
let rightFrameHistory = [];
let leftFrameHistory = [];

// Circle arrangement parameters
const CIRCLE_RADII = [0, 100, 200]; // Radii for each circle
const FRAME_DELAYS = [0, 10, 20]; // Delay in frames for each circle
const COPIES_PER_CIRCLE = [1, 6, 12]; // Number of copies in each circle
const ROTATION_SPEED = 0.005; // Speed of rotation
let rightRotationOffset = 0;
let leftRotationOffset = 0;

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
  
  centerPos.x = width / 2;
  centerPos.y = height / 2;
}

function draw() {
  background(255);
  
  // Update rotation offsets
  rightRotationOffset += ROTATION_SPEED;
  leftRotationOffset -= ROTATION_SPEED;
  
  if (capture.loadedmetadata) {
    let img = capture.get();
    
    if (faces.length > 0) {
      let face = faces[0];
      
      // Calculate eye centers
      let leftEyeCenter = getEyeCenter(face.leftEye.keypoints);
      let rightEyeCenter = getEyeCenter(face.rightEye.keypoints);
      
      // Calculate distance between eyes for scaling
      let eyeDistance = dist(leftEyeCenter.x, leftEyeCenter.y, 
                           rightEyeCenter.x, rightEyeCenter.y);
      
      // Calculate scale factor based on eye distance
      let scaleFactor = eyeDistance / REFERENCE_EYE_DISTANCE;
      let currentEyeWidth = BASE_EYE_WIDTH * scaleFactor;
      let currentEyeHeight = BASE_EYE_HEIGHT * scaleFactor;
      
      // Create eye images
      let rightEye = createImage(Math.floor(currentEyeWidth), Math.floor(currentEyeHeight));
      let leftEye = createImage(Math.floor(currentEyeWidth), Math.floor(currentEyeHeight));
      
      // Copy eye regions
      rightEye.copy(
        img,
        Math.floor(rightEyeCenter.x - currentEyeWidth/2),
        Math.floor(rightEyeCenter.y - currentEyeHeight/2),
        Math.floor(currentEyeWidth),
        Math.floor(currentEyeHeight),
        0,
        0,
        Math.floor(currentEyeWidth),
        Math.floor(currentEyeHeight)
      );
      
      leftEye.copy(
        img,
        Math.floor(leftEyeCenter.x - currentEyeWidth/2),
        Math.floor(leftEyeCenter.y - currentEyeHeight/2),
        Math.floor(currentEyeWidth),
        Math.floor(currentEyeHeight),
        0,
        0,
        Math.floor(currentEyeWidth),
        Math.floor(currentEyeHeight)
      );
      
      // Apply dithering
      applyDithering(rightEye);
      applyDithering(leftEye);
      
      // Store current frames
      rightFrameHistory.unshift({
        eye: rightEye,
        width: currentEyeWidth,
        height: currentEyeHeight
      });
      
      leftFrameHistory.unshift({
        eye: leftEye,
        width: currentEyeWidth,
        height: currentEyeHeight
      });
      
      // Limit frame history size
      if (rightFrameHistory.length > MAX_FRAMES) rightFrameHistory.pop();
      if (leftFrameHistory.length > MAX_FRAMES) leftFrameHistory.pop();
      
        // Draw left eye circles (counter-clockwise)
      for (let circleIndex = 1; circleIndex < CIRCLE_RADII.length; circleIndex++) {
        let radius = CIRCLE_RADII[circleIndex] + 50 + (sin(frameCount/10)*20); // Offset radius for left eye circles
        let numCopies = COPIES_PER_CIRCLE[circleIndex];
        console.log(sin(PI))
        let frameDelay = FRAME_DELAYS[circleIndex];
        
        let delayedFrame = leftFrameHistory[Math.min(frameDelay, leftFrameHistory.length - 1)];
        if (!delayedFrame) continue;
        
        push();
        translate(centerPos.x, centerPos.y);
        // translate(sin(centerPos.x), sin(centerPos.y)*10)
        for (let i = 0; i < numCopies; i++) {
          let angle = (i / numCopies) * TWO_PI + leftRotationOffset;
          let x = cos(angle) * radius;
          let y = sin(angle) * radius;
          
          push();
          translate(x, y);
          rotate(angle + PI/2);
          
          image(delayedFrame.eye, 
                -delayedFrame.width/2, 
                -delayedFrame.height/2);
          pop();
        }
        pop();
      }
      
      // Draw right eye circles (clockwise)
      for (let circleIndex = 0; circleIndex < CIRCLE_RADII.length; circleIndex++) {
        let radius = CIRCLE_RADII[circleIndex];
        let numCopies = COPIES_PER_CIRCLE[circleIndex];
        let frameDelay = FRAME_DELAYS[circleIndex];
        
        let delayedFrame = rightFrameHistory[Math.min(frameDelay, rightFrameHistory.length - 1)];
        if (!delayedFrame) continue;
        
        if (circleIndex === 0) {
          // Center copy
          image(delayedFrame.eye, 
                centerPos.x - delayedFrame.width/2, 
                centerPos.y - delayedFrame.height/2);
        } else {
          // Circle copies
          push();
          translate(centerPos.x, centerPos.y);
          for (let i = 0; i < numCopies; i++) {
            let angle = (i / numCopies) * TWO_PI + rightRotationOffset;
            let x = cos(angle) * radius;
            let y = sin(angle) * radius;
            
            push();
            translate(x, y);
            rotate(angle + PI/2);
            image(delayedFrame.eye, 
                  -delayedFrame.width/2, 
                  -delayedFrame.height/2);
            pop();
          }
          pop();
        }
      }
      
    
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
      
      if (rgb < THRESHOLD_DARK_GREY) {
        pixelValue = 0;
      }
      else if (rgb < THRESHOLD_LIGHT_GREY &&
               ((x % 4 === 0 && y % 4 === 0) || (x % 4 === 2 && y % 4 === 2))) {
        pixelValue = 0;
      }
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