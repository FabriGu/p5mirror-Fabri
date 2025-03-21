let video;
let canvas;
let waveOffset = 0;

function setup() {
  canvas = createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  noStroke();
}

function draw() {
  background(0);

  // Load the video pixels and canvas pixels for manipulation
  video.loadPixels();
  loadPixels();

  // Parameters for the wave effect
  waveOffset += 0.05;
  let waveFrequency = 0.02;
  let waveAmplitude = 20;

  // Iterate through every pixel in the video to apply effects
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Compute wave displacement based on y position and waveOffset
      let waveX = x + sin(y * waveFrequency + waveOffset) * waveAmplitude;

      // Constrain the waveX value within the image width
      waveX = constrain(waveX, 0, width - 1);

      // Get the index for the displaced pixel location
      let index = (floor(waveX) + y * width) * 4;

      // Apply some color manipulation for trippy effects
      let r = video.pixels[index + 0];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];

      // Effect 1: Random color channel shifting
      if (random(1) > 0.98) {
        [r, g, b] = [b, r, g]; // Rotate color channels
      }

      // Effect 2: Slight brightness alteration
      if (random(1) > 0.96) {
        r = r * 1.5 % 255;
        g = g * 0.8 % 255;
        b = b * 1.2 % 255;
      }

      // Apply the manipulated colors to the current pixel location
      let currentIndex = (x + y * width) * 4;
      pixels[currentIndex + 0] = r;
      pixels[currentIndex + 1] = g;
      pixels[currentIndex + 2] = b;
      pixels[currentIndex + 3] = 255; // Full opacity
    }
  }

  // Update the canvas with the modified pixels
  updatePixels();
}
