let sounds = [];
let x = 0;
let h = 0;
let beat = 60;
let sb = beat - 10;

function preload() {
  for (let s = 0; s < 7; s++) {
    sounds.push(loadSound('data/' + s + '.mp3'));
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

  // Main beat (Tabla)
  if (frameCount % beat == 1) {
    sounds[2].play();
    rect(x, y, 5, 15);
  }

  y += h;

  // Mango drum (half-beat division)
  if (frameCount % floor(beat / 2) == 1) {
    sounds[2].play();
    rect(x, y, 5, 15);
  }

  y += h;

  // Pineapple (third-beat division, typical of syncopated beats)
  if (frameCount % floor(beat / 3) == 1) {
    sounds[1].play();
    rect(x, y, 5, 15);
  }

  y += h;

  // Syncopated drum (small offset from main beat to create syncopation)
  if (frameCount % beat == sb) {
    sounds[5].play();
    rect(x, y, 5, 15);
    sb--; // Slowly phase out the syncopation
  }

  y += h;

  // Phased drum (adds another layer every 50 frames)
  if (frameCount % 50 == 1) {
    sounds[4].play();
    rect(x, y, 5, 15);
  }

  y += h;

  // Additional layer for polyrhythmic effect (e.g., playing every 7th beat)
  if (frameCount % floor(beat / 1.75) == 1) {
    sounds[3].play();
    rect(x, y, 5, 15);
  }
}
