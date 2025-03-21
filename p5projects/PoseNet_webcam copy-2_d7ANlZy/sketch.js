let video;
let poseNet;
let poses = [];
let words = [];
let wordsArray = ["Hello", "World", "OpenAI", "ml5.js", "p5.js", "JavaScript", "Art", "Code", "Creative"];

class Word {
  constructor(x, y, z, size, text) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size;
    this.text = text;
  }

  display() {
    push();
    translate(this.x, this.y, this.z);
    textSize(this.size);
    fill(255);
    text(this.text, 0, 0);
    pop();
  }
}

function preload() {
  customFont = loadFont('./cmsy.ttf');
}

function setup() {
  createCanvas(640, 480, WEBGL);
  video = createCapture(VIDEO);
  video.size(width, height);
  textFont(customFont);

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', function(results) {
    poses = results;
    generateWords();
  });

  video.hide();
}

function modelLoaded() {
  console.log('Model Loaded!');
}

function generateWords() {
  if (poses.length > 0) {
    words = []; // Clear previous words

    let pose = poses[0].pose;

    // Iterate over keypoints and add words
    for (let i = 0; i < pose.keypoints.length; i++) {
      let keypoint = pose.keypoints[i];
      if (keypoint.score > 0.2) {
        let word = random(wordsArray);
        let size = random(16, 24);
        words.push(new Word(keypoint.position.x - width / 2, keypoint.position.y - height / 2, 0, size, word));
      }
    }
  }
}

function draw() {
  background(0);
  texture(video);
  plane(width, height);

  if (poses.length > 0) {
    for (let i = 0; i < words.length; i++) {
      words[i].display();
    }
    draw3DModel();
  }
}

function draw3DModel() {
  if (poses.length > 0) {
    let pose = poses[0].pose;
    let keypoints = pose.keypoints.filter(keypoint => keypoint.score > 0.2);

    // Sort keypoints from top to bottom
    keypoints.sort((a, b) => a.position.y - b.position.y);

    let lineHeight = 30; // Spacing between lines
    let lineY = keypoints[0].position.y - height / 2 - 50; // Start position for the first line
    let currentLineY = lineY;
    let currentLineX = keypoints[0].position.x - width / 2; // Start position for the first word
    let maxLineWidth = width - 20; // Maximum width for a line

    for (let i = 0; i < words.length; i++) {
      let word = words[i];

      // Check if the word fits in the current line
      let wordWidth = textWidth(word.text) * word.size / 16;
      if (currentLineX + wordWidth > maxLineWidth) {
        // Move to the next line
        currentLineY += lineHeight;
        currentLineX = keypoints[0].position.x - width / 2; // Reset X position
      }

      // Position the word
      word.x = currentLineX;
      word.y = currentLineY;
      word.z = 0;

      // Update current X position for the next word
      currentLineX += wordWidth + 10; // Add some padding between words

      // Display the word
      word.display();
    }
  }
  if (poses.length > 0) {
    let pose = poses[0].pose;
    let nose = pose.keypoints[0].position;
    let leftShoulder = pose.keypoints[5].position;
    let rightShoulder = pose.keypoints[6].position;
    let leftElbow = pose.keypoints[7].position;
    let rightElbow = pose.keypoints[8].position;
    let leftWrist = pose.keypoints[9].position;
    let rightWrist = pose.keypoints[10].position;
    let leftHip = pose.keypoints[11].position;
    let rightHip = pose.keypoints[12].position;
    let leftKnee = pose.keypoints[13].position;
    let rightKnee = pose.keypoints[14].position;
    let leftAnkle = pose.keypoints[15].position;
    let rightAnkle = pose.keypoints[16].position;

    // Adjust video position and size
    push();
    translate(-width / 2, -height / 2);
    texture(video);
    plane(width, height);
    pop();

    // Draw crude 3D model
    let headSize = dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y) / 2;
    let torsoSize = dist(leftShoulder.x, leftShoulder.y, leftHip.x, leftHip.y) / 2;
    let upperArmSize = dist(leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y) / 2;
    let lowerArmSize = dist(leftElbow.x, leftElbow.y, leftWrist.x, leftWrist.y) / 2;
    let upperLegSize = dist(leftHip.x, leftHip.y, leftKnee.x, leftKnee.y) / 2;
    let lowerLegSize = dist(leftKnee.x, leftKnee.y, leftAnkle.x, leftAnkle.y) / 2;

    // Head
    push();
    translate(nose.x - width / 2, nose.y - height / 2, 0);
    fill(255, 0, 0); // Head color
    sphere(headSize);
    pop();

    // Torso
    push();
    translate((leftShoulder.x + rightShoulder.x) / 2 - width / 2, (leftShoulder.y + rightShoulder.y) / 2 - height / 2, 0);
    rotateX(HALF_PI);
    fill(0, 255, 0); // Body color
    cylinder(torsoSize, dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y));
    pop();

    // Left upper arm
    push();
    translate(leftShoulder.x - width / 2, leftShoulder.y - height / 2, 0);
    rotateZ(atan2(leftElbow.y - leftShoulder.y, leftElbow.x - leftShoulder.x));
    fill(0, 0, 255); // Left arm color
    cylinder(upperArmSize, dist(leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y));
    pop();

    // Left lower arm
    push();
    translate(leftElbow.x - width / 2, leftElbow.y - height / 2, 0);
    rotateZ(atan2(leftWrist.y - leftElbow.y, leftWrist.x - leftElbow.x));
    fill(0, 0, 255); // Left arm color
    cylinder(lowerArmSize, dist(leftElbow.x, leftElbow.y, leftWrist.x, leftWrist.y));
    pop();

    // Right upper arm
    push();
    translate(rightShoulder.x - width / 2, rightShoulder.y - height / 2, 0);
    rotateZ(atan2(rightElbow.y - rightShoulder.y, rightElbow.x - rightShoulder.x));
    fill(0, 0, 255); // Right arm color
    cylinder(upperArmSize, dist(rightShoulder.x, rightShoulder.y, rightElbow.x, rightElbow.y));
    pop();

    // Right lower arm
    push();
    translate(rightElbow.x - width / 2, rightElbow.y - height / 2, 0);
    rotateZ(atan2(rightWrist.y - rightElbow.y, rightWrist.x - rightElbow.x));
    fill(0, 0, 255); // Right arm color
    cylinder(lowerArmSize, dist(rightElbow.x, rightElbow.y, rightWrist.x, rightWrist.y));
    pop();

    // Left upper leg
    push();
    translate(leftHip.x - width / 2, leftHip.y - height / 2, 0);
    rotateZ(atan2(leftKnee.y - leftHip.y, leftKnee.x - leftHip.x));
    fill(255); // Left leg color
    cylinder(upperLegSize, dist(leftHip.x, leftHip.y, leftKnee.x, leftKnee.y));
    pop();

    // Left lower leg
    push();
    translate(leftKnee.x - width / 2, leftKnee.y - height / 2, 0);
    rotateZ(atan2(leftAnkle.y - leftKnee.y, leftAnkle.x - leftKnee.x));
    fill(255); // Left leg color
    cylinder(lowerLegSize, dist(leftKnee.x, leftKnee.y, leftAnkle.x, leftAnkle.y));
    pop();

    // Right upper leg
    push();
    translate(rightHip.x - width / 2, rightHip.y - height / 2, 0);
    rotateZ(atan2(rightKnee.y - rightHip.y, rightKnee.x - rightHip.x));
    fill(255); // Right leg color
    cylinder(upperLegSize, dist(rightHip.x, rightHip.y, rightKnee.x, rightKnee.y));
    pop();

    // Right lower leg
    push();
    translate(rightKnee.x - width / 2, rightKnee.y - height / 2, 0);
    rotateZ(atan2(rightAnkle.y - rightKnee.y, rightAnkle.x - rightKnee.x));
    fill(255); // Right leg color
    cylinder(lowerLegSize, dist(rightKnee.x, rightKnee.y, rightAnkle.x, rightAnkle.y));
    pop();
  }
}
