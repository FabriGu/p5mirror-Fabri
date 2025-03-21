const modelURL = 'https://teachablemachine.withgoogle.com/models/5iA42GQmR/';
// the json file (model topology) has a reference to the bin file (model weights)
const checkpointURL = modelURL + "model.json";
// the metatadata json file contains the text labels of your model and additional information
const metadataURL = modelURL + "metadata.json";

const flip = false; // whether to flip the webcam

let model;
let totalClasses;
let lnanvas;

let classification = "None Yet";
let probability = "100";
let poser;
let video;

//MY CODE
let colors = [];
let colorDir = [-1, 1, -1];

let backgroundCanvas;



// A function that loads the model from the checkpoint
async function load() {
  model = await tmPose.load(checkpointURL, metadataURL );
  totalClasses = model.getTotalClasses();
  console.log("Number of classes, ", totalClasses);
  
  webcam = new tmPose.Webcam(500, 500, flip); // width, height, 
  await webcam.setup(); // request access to the webcam
  await webcam.play();
}

async function setup() {
  myCanvas = createCanvas(500, 500);
  // Call the load function, wait until it finishes loading
  videoCanvas = createCanvas(670, 470)

  await load();
  video = createCapture(VIDEO, videoReady);
  video.size(670, 515);
  video.hide();
  
  // backgroundCanvas = createGraphics(500, 500);
  // await load();
  
  //MY CODE
  colors[0] = parseInt(random(0,256));
  colors[1] = parseInt(random(0,256));
  colors[2] = parseInt(random(0,256));
  
  // backgroundCanvas.background(colors[0],colors[1],colors[2])
  translate(500-width)
}

function draw() {
  // background(colors[0]*-1,-colors[1]*-1,-colors[2]*-1);
  // if(video) image(video,0,0);
  // fill(255,0,0)
  noFill()
  textSize(18);
  text("Result:" + classification, 10, 40);

  text("Probability:" + probability, 10, 20)
  ///ALEX insert if statement here testing classification against apppropriate part of array for this time in your video

  textSize(8);
  if (poser) { //did we get a skeleton yet;
    // console.log(poser)
    for (var i = 0; i < poser.length; i++) {
      let x = poser[i].position.x;
      let y = poser[i].position.y;
      // ellipse(x, y, 5, 5);
      
      text(poser[i].part, x + 4, y);
      push()
      stroke(colors[0],colors[1],colors[2])
      strokeWeight(20)
      strokeCap(ROUND)
      if (i >= 7 && i < poser.length && i< 11) {
        
        line(poser[i-2].position.x, poser[i-2].position.y, poser[i].position.x, poser[i].position.y)
      }
      if (i >= 13 && i < poser.length) {
        line(poser[i-2].position.x, poser[i-2].position.y, poser[i].position.x, poser[i].position.y)
      }
      // console.log(i)
      if (i ==5) {
        line(poser[i].position.x, poser[i].position.y, poser[i+1].position.x, poser[i+1].position.y)
        line(poser[i].position.x, poser[i].position.y, poser[i+6].position.x, poser[i+6].position.y)
        line(poser[i+1].position.x, poser[i+1].position.y, poser[i+7].position.x, poser[i+7].position.y)
        line(poser[i+6].position.x, poser[i+6].position.y, poser[i+7].position.x, poser[i+7].position.y)
      }
      if (i == 0) {
        let d = dist(poser[3].position.x, poser[3].position.y, poser[4].position.x, poser[4].position.y)
        circle(poser[i].position.x, poser[i].position.y, d+30,d+30)
      }
      pop()
    }
  }
  
  //MY CODE ---------------------------------------------------------
  for (let j = 0; j < colors.length; j++) {
    if ((colors[j] < 256 && colors[j] >= 0)) {
      colors[j] += colorDir[j];
    } else {
      colorDir[j] *= -1;
      colors[j] += colorDir[j];
    }
    // console.log(colors[j]);
  }
  
  //MY CODE ---------------------------------------------------------

}

function updateBackground() {
  backgroundCanvas.background(colors[0],colors[1],colors[2]); // Setting background color to white
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