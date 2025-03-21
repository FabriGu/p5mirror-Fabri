let sounds = [];  // Array to store sounds for different drum types
let x = 0;  // x-position for visual display of beats
let h = 0;  // Height spacing for each sound
let beat = 60;  // Base beat duration

function preload() {
  for (let s = 0; s < 6; s++) {
    sounds.push(loadSound('data/' + s + '.mp3')); // Load sounds for tabla, dholak, hi-hat, bass drum
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

  // Tabla (main beat rhythm, e.g., Teentaal structure)
  if (frameCount % beat == 1) {
    sounds[0].play(); // Tabla sound
    rect(x, y, 5, 15);
  }

  y += h;

  // Dholak (support beat, half the speed of tabla)
  if (frameCount % floor(beat / 2) == 1) {
    sounds[1].play(); // Dholak sound
    rect(x, y, 5, 15);
  }

  y += h;

  // Hi-hat (syncopated rhythm, third-beat division for variation)
  if (frameCount % floor(beat / 3.5) == 1) {
    sounds[0].play(); // Hi-hat sound
    rect(x, y, 5, 15);
  }

  y += h;

  // Bass Drum (slow, steady beat every fourth beat, adding a bass layer)
  if (frameCount % floor(beat * 2) == 1) {
    sounds[4].play(); // Bass drum sound
    rect(x, y, 5, 15);
  }
}
