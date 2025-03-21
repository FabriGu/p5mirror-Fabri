let video;
let trailBuffer;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Create a graphics buffer to hold the echoing effect
  trailBuffer = createGraphics(width, height);
  trailBuffer.clear(); // Start with a transparent background
}

function draw() {
  video.loadPixels();
  trailBuffer.loadPixels();
  background(0)

  // Threshold for prominent colors (adjust as needed)
  let brightnessThreshold = 150;

  // Loop through each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = (x + y * width) * 4;

      // Get color values from the video frame
      let r = video.pixels[index + 0];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];
      let avgBrightness = (r + g + b) / 3;

      // If brightness exceeds the threshold, add it to the trail buffer
      if (avgBrightness > brightnessThreshold) {
        trailBuffer.pixels[index + 0] = r;
        trailBuffer.pixels[index + 1] = g;
        trailBuffer.pixels[index + 2] = b;
        trailBuffer.pixels[index + 3] = 150; // Set transparency for the echo effect
      }
      // } else {
      //   trailBuffer.pixels[index + 0] = r;
      //   trailBuffer.pixels[index + 1] = g;
      //   trailBuffer.pixels[index + 2] = b;
      //   // Keep background pixels transparent in the trail buffer
      //   trailBuffer.pixels[index + 3] = max(trailBuffer.pixels[index + 3] - 10, 0);
      // }
    }
  }

  // Update pixels in the trail buffer and draw it to the main canvas
  trailBuffer.updatePixels();
  image(trailBuffer, 0, 0);
}
