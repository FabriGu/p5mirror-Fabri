let sounds = [];  // Array to store sounds for tabla, dholak, hi-hat, bass drum, fillers
let x = 0;        // x-position for visual display of beats
let h = 0;        // Height spacing for each sound
let beat = 60;    // Base beat duration
let cycleLength = beat * 16;  // Total frames for a 16-beat cycle

function preload() {
  for (let s = 0; s < 6; s++) {
    sounds.push(loadSound('data/' + s + '.mp3')); // Load sounds for tabla, dholak, hi-hat, bass drum, fillers
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  h = height / sounds.length;
  noStroke();
}

function draw() {
  x++;
  if (x > width) {
    background('white');
    x = 0;
  }

  let y = 0;
  fill('black');

  // **Teentaal structure (16 beats)**
  // Each section in Teentaal has 4 beats. We'll layer sounds and add syncopation for complexity.
  
  // Tabla: Main beats on counts 1, 5, 9, and 13 (these are the main "taal" points)
  if (frameCount % cycleLength == 1 || 
      frameCount % cycleLength == beat * 4 + 1 ||
      frameCount % cycleLength == beat * 8 + 1 || 
      frameCount % cycleLength == beat * 12 + 1) {
    sounds[0].play();
    rect(x, y, 5, 15);
  }

  y += h;

  // Dholak: Accent beats in each section, adding depth
  if (frameCount % cycleLength == beat * 2 + 1 || 
      frameCount % cycleLength == beat * 6 + 1 ||
      frameCount % cycleLength == beat * 10 + 1 || 
      frameCount % cycleLength == beat * 14 + 1) {
    sounds[1].play();
    rect(x, y, 5, 15);
  }

  y += h;

  // Hi-hat: Syncopated rhythm for more texture (every 3rd beat, offset for variety)
  if (frameCount % floor(beat * 1.5) == 1) {
    sounds[2].play();
    rect(x, y, 5, 15);
  }

  y += h;

  // Bass Drum: Every 4 beats, adds a low-end layer
  if (frameCount % floor(beat * 4) == 1) {
    sounds[3].play();
    rect(x, y, 5, 15);
  }

  y += h;

  // Filler sound 1: Light taps on beats 7 and 15
  if (frameCount % cycleLength == beat * 6 + 1 || frameCount % cycleLength == beat * 14 + 1) {
    sounds[4].play();
    rect(x, y, 5, 15);
  }

  y += h;

  // Filler sound 2: Adds complexity on off-beats (every 8 frames for more variation)
  if (frameCount % 8 == 0) {
    sounds[5].play();
    rect(x, y, 5, 15);
  }
}
