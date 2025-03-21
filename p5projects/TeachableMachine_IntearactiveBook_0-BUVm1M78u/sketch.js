// Classifier Variable
let classifier;
// Model URL
let imageModelURL = "https://teachablemachine.withgoogle.com/models/W0-1lXe-9/";

let sounds = [];

// Video
let video;
// To store the classification
let label = "";
let prevLabel = "";

// Load the model first
function preload() {
  // See: https://github.com/ml5js/ml5-next-gen/issues/236
  ml5.setBackend('webgl');
  classifier = ml5.imageClassifier(imageModelURL + "model.json", {
    flipped: true,
  });
  for (let s = 0; s < 3; s++) {
    sounds.push(loadSound('data/' + s + '.mp3'));
  }
}

function setup() {
  createCanvas(640, 480);
  // Create the video
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();
  classifier.classifyStart(video, gotResult);
}

function draw() {
  background(0);
  // Draw the video
  image(video, 0, 0);

  // Draw the label
  fill(255);
  textSize(16);
  textAlign(CENTER);
  text(label, width / 2, height - 4);
  
  // if ()
  console.log(label)
  console.log(prevLabel)
  
  
  if (label == "Page 1" && prevLabel != "Page 1") {
    stopAllSounds();
    if (!sounds[0].isPlaying()) {
      sounds[0].play();
    }
  } else if (label == "Page 2" && prevLabel != "Page 2") {
    stopAllSounds();
    if (!sounds[1].isPlaying()) {
      sounds[1].play();
    }
  } else if (label == "Page 3" && prevLabel != "Page 3") {
    stopAllSounds();
    if (!sounds[2].isPlaying()) {
      sounds[2].play();
    }
  } else if (label == "Page 4" && prevLabel != "Page 4") {
    stopAllSounds();
    if (!sounds[2].isPlaying()) {
      sounds[2].play();
    }
  } else if (label == "No Page" && prevLabel != "No Page") {
    stopAllSounds();
  }
  
  prevLabel = label;
}

// When we get a result
function gotResult(results) {
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  label = results[0].label;
  
}

// supplied by claudeAI
function stopAllSounds() {
  // Loop through all sounds and stop any that are playing
  for (let i = 0; i < sounds.length; i ++) {
    // console.log(sound)
    console.log(i)
    // if (sounds[i].isPlaying()) {
      sounds[i].stop();
    // }
  }
 
}
