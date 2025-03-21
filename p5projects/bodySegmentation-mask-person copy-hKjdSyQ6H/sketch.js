/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates segmenting the background from a person with ml5.bodySegmentation.
 */

let bodySegmentation;
let video;
let segmentation;
let segmentationMask;

let options = {
  maskType: "person",
};

function preload() {
  bodySegmentation = ml5.bodySegmentation("SelfieSegmentation", options);
}

function setup() {
  createCanvas(640, 480);
  // Create the video
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // segmentationMask = createGraphics(640, 480);
  // segmentationMask.background(0);

  bodySegmentation.detectStart(video, gotResults);
  
  createButtonsketc("Get New Frame").position(10, 10).mousePressed(() =>       {console.log("trying");bodySegmentation.detectStart(video, gotResults);});
}

function drawFrame() {
  background(255);

  if (segmentation) {
    // video.mask(segmentation.mask);
    image(segmentationMask, 0, 0);
    
  }
}


// callback function for body segmentation
function gotResults(result) {
  segmentation = result;
  
  if (segmentation) {
    bodySegmentation.detectStop();

    segmentationMask = createGraphics(640, 480);

    segmentationMask.image(segmentation.mask, 0, 0, 640, 480);
    // console.log(segmentationMask)

    drawFrame()
  }
  
}


