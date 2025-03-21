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

  // Initialize  video and start detecting when ready
  video = createCapture(VIDEO, detectObjects);
  video.size(640, 480);
  video.hide();

  // Load the COCO-SSD model
  cocoModel = await cocoSsd.load();
  console.log("COCO-SSD Model Loaded!");
}

function draw() {
  background(255,0.5);

  // Display the webcam feed
  // image(video, 0, 0);

  // Draw detected objects
  for (let i = 0; i < detectedObjects.length; i++) {
    let { bbox, score, class: label } = detectedObjects[i];
    let [x, y, w, h] = bbox;

    // Draw bounding box
    stroke(0, 0, 0);
    fill(255);
    rect(x, y, w, h);

    // Display label and confidence
    noStroke();
    fill(0);
    textSize(16);
    
    text(`${label} (${nf(score * 100, 0, 2)}%)`, x +w/3, y + h/2);
  }
}

async function detectObjects() {
  detectedObjects = await cocoModel.detect(video.elt);
  await tf.nextFrame();

  // Detect again!
  detectObjects();
}
