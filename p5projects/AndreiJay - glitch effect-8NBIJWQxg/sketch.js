let video;
let canvas;

function setup() {
  canvas = createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  noStroke();
}

function draw() {
  background(0);

  // Capture the current video frame as an image
  video.loadPixels();

  // Prepare to manipulate video pixels
  loadPixels();

  // Iterate through every pixel in the video
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = (x + y * width) * 4;

      // Get the color values from the video pixels
      let r = video.pixels[index + 0];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];

      // Glitch effect 1: Random pixel displacement
      if (random(1) > 0.95) {
        r = video.pixels[(index + floor(random(-5, 5)) * 4 + width * floor(random(-5, 5))) % video.pixels.length];
        g = video.pixels[(index + floor(random(-5, 5)) * 4 + width * floor(random(-5, 5)) + 1) % video.pixels.length];
        b = video.pixels[(index + floor(random(-5, 5)) * 4 + width * floor(random(-5, 5)) + 2) % video.pixels.length];
      }

      // Glitch effect 2: Color channel offset
      if (random(1) > 0.85) {
        [r, g, b] = [b, r, g]; // Rotate color channels randomly
      }

      // Set the modified pixel values back to the display pixels
      pixels[index + 0] = r;
      pixels[index + 1] = g;
      pixels[index + 2] = b;
      pixels[index + 3] = 255; // Full opacity
    }
  }

  // Update the canvas with the modified pixels
  updatePixels();
}
