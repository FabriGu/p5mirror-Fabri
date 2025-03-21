let video;
let poseNet;
let poses = [];

let words;
let concatW = [];

function preload() {
  font = loadFont('Staatliches-Regular.ttf');
}

function setup() {
  textFont(font);
  createCanvas(640, 480, WEBGL);
  video = createCapture(VIDEO);
  video.size(width, height);

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', function(results) {
    poses = results;
  });

  video.hide();
  
  // words = createGraphics(600,600)
  // words.fill(255, 100)
  // words.textAlign(CENTER)
  // words.text("HELLO", 150,50)
}

function modelLoaded() {
  console.log('Model Loaded!');
}

function draw() {
  background(0);
  texture(video);
  plane(width, height);
  // console.log(poses)
  if (poses.length > 0) {
    let pose = poses[0].pose;
    let nose = pose.nose;
    let leftShoulder = pose.leftShoulder;
    let rightShoulder = pose.rightShoulder;
    let leftElbow = pose.leftElbow;
    let rightElbow = pose.rightElbow;
    let leftWrist = pose.leftWrist;
    let rightWrist = pose.rightWrist;
    let leftHip = pose.leftHip;
    let rightHip = pose.rightHip;
    let leftKnee = pose.leftKnee;
    let rightKnee = pose.rightKnee;
    let leftAnkle = pose.leftAnkle;
    let rightAnkle = pose.rightAnkle;
    
    // Draw crude 3D model
    let headSize = dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y) / 2;
    let torsoD = dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y) /2;
    let upperArmSize = dist(leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y) / 2;
    let lowerArmSize = dist(leftElbow.x, leftElbow.y, leftWrist.x, leftWrist.y) / 2;
    let upperLegSize = dist(leftHip.x, leftHip.y, leftKnee.x, leftKnee.y) / 2;
    let lowerLegSize = dist(leftKnee.x, leftKnee.y, leftAnkle.x, leftAnkle.y) / 2;

    
    words = createGraphics(torsoD, dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y)/2 )
    words.fill(255)
    words.textAlign(CENTER)
    words.text("HELLO HOW ARE YOU THIS IS SOME TEXT HERE", 150,50)
    
    // Head
    // push();
    // translate(nose.x - width / 2, nose.y - height / 2, 0);
    // fill(255, 0, 0); // Head color
    // sphere(headSize);
    // pop();
    // noStroke()
    // Torso
    push();
    translate((leftShoulder.x + rightShoulder.x) / 2 - width / 2, (leftShoulder.y + rightShoulder.y + 260) / 2 - height / 2, 0);
    rotateY(HALF_PI);
    // fill(0, 255, 0); // Body color
    texture(words)
    cylinder(torsoD, dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y));
    
    pop();

    // Left upper arm
    push();
    translate(leftShoulder.x - width / 2, leftShoulder.y - height / 2, 0);
    rotateZ(atan2(leftElbow.y - leftShoulder.y, leftElbow.x - leftShoulder.x));
    rotateZ(80)
    fill(0, 0, 255); // Left arm color
    texture(words)
    cylinder(upperArmSize, dist(leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y));
    pop();

    // Left lower arm
    push();
    translate(leftElbow.x - width / 2, leftElbow.y - height / 2, 0);
    rotateZ(atan2(leftWrist.y - leftElbow.y, leftWrist.x - leftElbow.x));
    rotateZ(80)
    fill(0, 0, 255); // Left arm color
    texture(words)
    cylinder(lowerArmSize, dist(leftElbow.x, leftElbow.y, leftWrist.x, leftWrist.y));
    pop();

    // Right upper arm
    push();
    translate(rightShoulder.x - width / 2, rightShoulder.y - height / 2, 0);
    rotateZ(atan2(rightElbow.y - rightShoulder.y, rightElbow.x - rightShoulder.x));
    rotateZ(80)
    fill(0, 0, 255); // Right arm color
    texture(words)
    cylinder(upperArmSize, dist(rightShoulder.x, rightShoulder.y, rightElbow.x, rightElbow.y));
    pop();

    // Right lower arm
    push();
    translate(rightElbow.x - width / 2, rightElbow.y - height / 2, 0);
    rotateZ(atan2(rightWrist.y - rightElbow.y, rightWrist.x - rightElbow.x));
    rotateZ(80)
    fill(0, 0, 255); // Right arm color
    texture(words)
    cylinder(lowerArmSize, dist(rightElbow.x, rightElbow.y, rightWrist.x, rightWrist.y));
    pop();

    // Left upper leg
    push();
    translate(leftHip.x - width / 2, leftHip.y - height / 2, 0);
    rotateZ(atan2(leftKnee.y - leftHip.y, leftKnee.x - leftHip.x));
    rotateZ(80)
    fill(255); // Left leg color
    texture(words)
    cylinder(upperLegSize, dist(leftHip.x, leftHip.y, leftKnee.x, leftKnee.y));
    pop();

    // Left lower leg
    push();
    translate(leftKnee.x - width / 2, leftKnee.y - height / 2, 0);
    rotateZ(atan2(leftAnkle.y - leftKnee.y, leftAnkle.x - leftKnee.x));
    rotateZ(80)
    fill(255); // Left leg color
    texture(words)
    cylinder(lowerLegSize, dist(leftKnee.x, leftKnee.y, leftAnkle.x, leftAnkle.y));
    pop();

    // Right upper leg
    push();
    translate(rightHip.x - width / 2, rightHip.y - height / 2, 0);
    rotateZ(atan2(rightKnee.y - rightHip.y, rightKnee.x - rightHip.x));
    rotateZ(80)
    fill(255); // Right leg color
    texture(words)
    cylinder(upperLegSize, dist(rightHip.x, rightHip.y, rightKnee.x, rightKnee.y));
    pop();

    // Right lower leg
    push();
    translate(rightKnee.x - width / 2, rightKnee.y - height / 2, 0);
    rotateZ(atan2(rightAnkle.y - rightKnee.y, rightAnkle.x - rightKnee.x));
    rotateZ(80)
    fill(255); // Right leg color
    texture(words)
    cylinder(lowerLegSize, dist(rightKnee.x, rightKnee.y, rightAnkle.x, rightAnkle.y));
    pop();
  }
}
