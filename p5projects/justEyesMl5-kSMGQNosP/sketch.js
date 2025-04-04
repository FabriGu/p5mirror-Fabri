/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates keypoint tracking of facial features on live video through ml5.faceMesh.
 */

let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  // draw the webcam video
  image(video, 0, 0, width, height);

  // draw the faces' bounding boxes
  for (let j = 0; j < faces.length; j++) {
    let face = faces[j];

    strokeWeight(5);
    
    // draw the left eye
    stroke(255, 255, 0);
    for (let i = 0; i < face.leftEye.keypoints.length; i++) {
      let keypoint = face.leftEye.keypoints[i];
      let x = keypoint.x;
      let y = keypoint.y;
      point(x, y);
    }
   
    // draw the right eye
    stroke(0, 255, 255);
    for (let i = 0; i < face.rightEye.keypoints.length; i++) {
      let keypoint = face.rightEye.keypoints[i];
      let x = keypoint.x;
      let y = keypoint.y;
      point(x, y);
    }
  
  }
}

function gotFaces(results) {
  faces = results;
}
