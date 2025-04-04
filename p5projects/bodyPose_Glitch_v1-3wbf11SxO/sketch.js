/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates drawing skeletons on poses for the MoveNet model.
 */

let video;
let bodyPose;
let poses = [];
let connections;

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(640, 480);

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);
  
  if(poses.length) {
    // console.log(poses)
    let noseX = poses[0].nose.x
    let noseY = poses[0].nose.y
    
    let eye1X = poses[0].left_eye.x
    let eye1Y = poses[0].left_eye.y
    let eye2X = poses[0].right_eye.x
    let eye2Y = poses[0].right_eye.y
    let eyeDist = dist(eye1X, eye1Y, eye2X, eye2Y)
    // console.log(eyeDist)
    
    push()
    rectMode(CENTER);
    noFill()
    stroke(255,0,0)
    strokeWeight(5)
    square(poses[0].nose.x ,poses[0].nose.y - eyeDist/2 ,eyeDist*4)  
    
    pop()
  }

}

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}
