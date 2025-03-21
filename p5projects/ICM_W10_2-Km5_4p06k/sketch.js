let sounds = [];
let c = 0;

let lowpass; 

function preload() {
  for (let i = 0; i < 10; i++) {
    console.log(`./${i}.mp3`)
    sounds[i] = loadSound(`./${i}.mp3`);
    // sounds[i].loop(true);
  }
  

  
}

function setup() {
  createCanvas(400, 400);
  // sound.play()
  console.log(sounds[2])
  lowpass = new p5.LowPass();
  
  sounds[5].disconnect();
  sounds[5].connect(lowpass);
  
  
}

function draw() {
  background(220);
}

function mousePressed() {
  console.log(sounds)
  console.log(c)
  console.log(sounds[c])
  if (!sounds[c].isPlaying()) {
    // setType(filter);
    // lowpass.freq(frameCount);
    sounds[c].play();
  } else {
    sounds[c].pause();
    if (c < 9) {
       c++;
    } else {
      c = 0;
    }
   
  }
}


