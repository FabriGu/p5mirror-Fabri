// Sound files for different drum sounds
let tabla, dholak, hiHat, bassDrum;

// Common beat patterns for Indian rhythms (e.g., Teentaal - a 16-beat cycle)
let beatPattern = [
  { sound: "tabla", rate: 1 },
  { sound: "dholak", rate: 1.25 },
  { sound: "hiHat", rate: 1.5 },
  { sound: "tabla", rate: 1.75 },
  { sound: "bassDrum", rate: 2 },
  { sound: "tabla", rate: 1.75 },
  { sound: "dholak", rate: 1.5 },
  { sound: "hiHat", rate: 1.25 },
  { sound: "tabla", rate: 1 },
  { sound: "dholak", rate: 1.25 },
  { sound: "hiHat", rate: 1.5 },
  { sound: "tabla", rate: 1.75 },
  { sound: "bassDrum", rate: 2 },
  { sound: "tabla", rate: 1.75 },
  { sound: "dholak", rate: 1.5 },
  { sound: "hiHat", rate: 1.25 }
];

// Load the sound files
function preload() {
  tabla = loadSound('./data/0.mp3');
  dholak = loadSound('./data/1.mp3');
  hiHat = loadSound('./data/2.mp3');
  bassDrum = loadSound('./data/4.mp3');
}

function setup() {
  createCanvas(400, 400);
  textSize(20);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(220);
  text("Press any key to play rhythm", width / 2, height / 2);
}

// Beat pattern index to cycle through
let beatIndex = 0;

function keyPressed() {
  // Get the current beat from the pattern
  let beat = beatPattern[beatIndex];
  
  // Play the specified sound at the designated rate
  switch (beat.sound) {
    case "tabla":
      tabla.rate(beat.rate);
      tabla.play();
      break;
    case "dholak":
      dholak.rate(beat.rate);
      dholak.play();
      break;
    case "hiHat":
      hiHat.rate(beat.rate);
      hiHat.play();
      break;
    case "bassDrum":
      bassDrum.rate(beat.rate);
      bassDrum.play();
      break;
  }

  // Move to the next beat in the pattern
  beatIndex = (beatIndex + 1) % beatPattern.length;
}
