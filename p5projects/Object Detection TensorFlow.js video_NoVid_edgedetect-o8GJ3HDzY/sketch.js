// Based on
// https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
// Variable to hold the COCO-SSD model
let cocoModel;
// Variable to hold webcam video feed
let video;
// Variable to hold detection results
let detectedObjects = [];

async function setup() {
  createCanvas(640, 480);
  // Initialize video and start detecting when ready
  video = createCapture(VIDEO, detectObjects);
  video.size(640, 480);
  video.hide();
  
  // Load the COCO-SSD model
  cocoModel = await cocoSsd.load();
  console.log("COCO-SSD Model Loaded!");
}

function draw() {
  // Clear background to white
  background(255);
  
  // Load video pixels once
  video.loadPixels();
  loadPixels();
  
  // Process each detected object
  for (let i = 0; i < detectedObjects.length; i++) {
    let { bbox, score, class: label } = detectedObjects[i];
    let [x, y, w, h] = bbox;
    
    // Ensure we stay within canvas bounds
    x = Math.floor(Math.max(0, Math.min(x, width)));
    y = Math.floor(Math.max(0, Math.min(y, height)));
    w = Math.floor(Math.min(w, width - x));
    h = Math.floor(Math.min(h, height - y));
    
    // Process pixels within bounding box
    for (let py = y; py < y + h - 1; py++) {
      for (let px = x; px < x + w - 1; px++) {
        let loc = (px + py * width) * 4;
        let nextLoc = (px + 1 + py * width) * 4;
        let belowLoc = (px + (py + 1) * width) * 4;
        
        // Get brightness of current and neighboring pixels
        let currBright = (video.pixels[loc] + video.pixels[loc + 1] + video.pixels[loc + 2]) / 3;
        let nextBright = (video.pixels[nextLoc] + video.pixels[nextLoc + 1] + video.pixels[nextLoc + 2]) / 3;
        let belowBright = (video.pixels[belowLoc] + video.pixels[belowLoc + 1] + video.pixels[belowLoc + 2]) / 3;
        
        // Calculate edge intensity
        let diffX = Math.abs(currBright - nextBright);
        let diffY = Math.abs(currBright - belowBright);
        
        // If edge detected, set pixel to black, otherwise white
        if (diffX > 30 || diffY > 30) {
          pixels[loc] = 0;      // R
          pixels[loc + 1] = 0;  // G
          pixels[loc + 2] = 0;  // B
          pixels[loc + 3] = 255;// A
        } else {
          pixels[loc] = 255;    // R
          pixels[loc + 1] = 255;// G
          pixels[loc + 2] = 255;// B
          pixels[loc + 3] = 255;// A
        }
      }
    }
    
    // Draw bounding box
    stroke(0);
    noFill();
    rect(x, y, w, h);
    
    // Display label and confidence
    noStroke();
    fill(0);
    textSize(16);
    text(`${label} (${nf(score * 100, 0, 2)}%)`, x + w/3, y + h/2);
  }
  
  updatePixels();
}

async function detectObjects() {
  detectedObjects = await cocoModel.detect(video.elt);
  await tf.nextFrame();
  // Detect again!
  detectObjects();
}