let sound;
let lowpass;

function preload() {
  sound = loadSound("./4.mp3")
  sound.loop(true);
  
  
}

function setup() {
  createCanvas(400, 400);
  // sound.play()
  lowpass = new p5.LowPass();
  
  sound.disconnect();
  sound.connect(lowpass);
}

function draw() {
  background(220);
}

function mousePressed() {
  if (!sound.isPlaying()) {
    
    sound.play();
  } else {
    sound.pause();
  }
}

