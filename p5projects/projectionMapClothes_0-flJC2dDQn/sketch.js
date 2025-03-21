/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates segmenting a person by body parts with ml5.bodySegmentation.
 */

let bodySegmentation;
let video;
let segmentation;

let options = {
  runtime: "tfjs", // "tfjs" or "mediapipe"
  modelType: "general", // "general" or "landscape"
  maskType: "parts", // "background", "person", or "parts" (used to change the type of segmentation mask output)
  flipped: true,
};

function preload() {
  bodySegmentation = ml5.bodySegmentation("BodyPix", options);
}

function setup() {
  createCanvas(640, 480);
  // Create the video
  video = createCapture(VIDEO);
  push();
  // scale(-1,1)
  video.size(640, 480);
  pop();
  video.hide();
  pixelDensity(1)

  bodySegmentation.detectStart(video, gotResults);
}

function draw() {
  background(255);
  image(video, 0, 0);
  if (segmentation) {
    console.log(segmentation)
    image(segmentation.mask, 0, 0, width, height);
  }
}

// callback function for body segmentation
function gotResults(result) {
  segmentation = result;
  // console.log(result)
}
