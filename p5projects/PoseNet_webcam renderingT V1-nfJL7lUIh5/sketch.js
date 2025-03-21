let video;
let poseNet;
let poses = [];
let words = [];
let wordsArray = ["Hello", "World", "OpenAI", "ml5.js", "p5.js", "JavaScript", "Art", "Code", "Creative"];
let customFont;
let cylinderRadius = 50; // Radius of the cylinder
let cylinderHeight = 200; // Height of the cylinder
let segments = 50; // Number of segments to divide the circumference

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
  // Load the font file
  customFont = loadFont('./cmsy.ttf');
}

function setup() {
  createCanvas(640, 480, WEBGL);
  video = createCapture(VIDEO);
  video.size(width, height);

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', function(results) {
    poses = results;
    generateWords();
  });

  video.hide();
  textFont(customFont);
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
    draw3DModel();
  }
}

function draw3DModel() {
  let pose = poses[0].pose;
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

  let wordsPerSegment = words.length / segments;

  for (let i = 0; i < segments; i++) {
    let theta = map(i, 0, segments, 0, TWO_PI);

    let x = cylinderRadius * cos(theta);
    let y = cylinderHeight / 2;
    let z = cylinderRadius * sin(theta);

    // Calculate orientation of text
    let rx = PI / 2;
    let ry = -theta;

    push();
    translate(x, y, z);
    rotateX(rx);
    rotateY(ry);

    // Render text at position
    let startIndex = floor(i * wordsPerSegment);
    let endIndex = floor((i + 1) * wordsPerSegment);
    for (let j = startIndex; j < endIndex; j++) {
      words[j].display();
    }

    pop();
  }
}
