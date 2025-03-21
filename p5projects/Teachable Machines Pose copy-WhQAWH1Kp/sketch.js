const modelURL = 'https://teachablemachine.withgoogle.com/models/yS9BiXiLQ/';
// the json file (model topology) has a reference to the bin file (model weights)
const checkpointURL = modelURL + "model.json";
// the metatadata json file contains the text labels of your model and additional information
const metadataURL = modelURL + "metadata.json";


const flip = true; // whether to flip the webcam

let model;
let totalClasses;
let myCanvas;

let classification = "None Yet";
let probability = "100";
let poser;
let video;

//MY CODE
let transparency = true
let timer = 5
let posesCanvas;
let posesImg = []
let posesDesc = []
let level = 3

function preload() {
  // Load wall images
  posesImg[0] = loadImage('./inAirSf.png');
  posesImg[1] = loadImage('./wingsSf.png');
  // Add more walls as needed...
}


// A function that loads the model from the checkpoint
async function load() {
  model = await tmPose.load(checkpointURL, metadataURL);
  totalClasses = model.getTotalClasses();
  console.log("Number of classes, ", totalClasses);
}


async function setup() {
  myCanvas = createCanvas(200, 200);
  // Call the load function, wait until it finishes loading
  videoCanvas = createCanvas(600, 400)
  

  await load();
  video = createCapture(VIDEO, videoReady);
  video.size(800, 600)
  video.hide();
  
  //my code
  posesCanvas = createCanvas(600,400)
  frameRate(60)
}

function draw() {
  // background(255);
  if(video) image(video,0,0);
  fill(255,0,0)
  textSize(18);
  text("Result:" + classification, 10, 40);

  text("Probability:" + probability, 10, 20)
  ///ALEX insert if statement here testing classification against apppropriate part of array for this time in your video

  textSize(8);
  if (poser) { //did we get a skeleton yet;
    for (var i = 0; i < poser.length; i++) {
      let x = poser[i].position.x;
      let y = poser[i].position.y;
      ellipse(x, y, 5, 5);
      text(poser[i].part, x + 4, y);
    }
  }
  push()
  textAlign(CENTER, CENTER);
  textSize(100);
  text(timer, width/2, height/2);
  
  
  if (frameCount % 60 == 0 && timer > 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
    timer --;
    displayPose(transparency)
  } else if (timer == 0) {
    displayPose(transparency)
  }
  
  pop()
  if (classification != posesDesc[level]) {
    transparency = false
    displayPose(transparency)
    noLoop()
  }
}

function displayPose(transparency) {
  push()
  if (transparency) {
    tint(100, 180)
    image(posesImg[level]);
  } else {
    tint(100, 30)
    image(posesImg[level]);
  }
  level++;
  pop()
}

function videoReady() {
  console.log("Video Ready");
  predict();
}


async function predict() {
  // Prediction #1: run input through posenet
  // predict can take in an image, video or canvas html element
  const flipHorizontal = false;
  const {
    pose,
    posenetOutput
  } = await model.estimatePose(
    video.elt, //webcam.canvas,
    flipHorizontal
  );
  // Prediction 2: run input through teachable machine assification model
  const prediction = await model.predict(
    posenetOutput,
    flipHorizontal,
    totalClasses
  );

  // console.log(prediction);
  
  // Sort prediction array by probability
  // So the first classname will have the highest probability
  const sortedPrediction = prediction.sort((a, b) => -a.probability + b.probability);

  //communicate these values back to draw function with global variables
  classification = sortedPrediction[0].className;
  probability = sortedPrediction[0].probability.toFixed(2);
  if (pose) poser = pose.keypoints; // is there a skeleton
  predict();
}