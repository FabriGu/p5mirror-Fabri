let video;
let trailBuffer;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Create a graphics buffer for the trail effect
  trailBuffer = createGraphics(width, height);
}

function draw() {
  // Capture the current frame from the video
  video.loadPixels();

  // Draw the current frame onto the trail buffer with a low opacity to keep the trail
  trailBuffer.tint(255, 100); // Set opacity of the current frame
  trailBuffer.image(video, 0, 0, width, height);

  // Overlay the trail buffer onto the main canvas
  image(trailBuffer, 0, 0);

  // Apply additional color distortions and effects
  loadPixels();
  trailBuffer.loadPixels();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = (x + y * width) * 4;

      // Apply random RGB shifting for a trippy effect
      let r = trailBuffer.pixels[index + 0];
      let g = trailBuffer.pixels[index + 1];
      let b = trailBuffer.pixels[index + 2];

      if (random(1) > 0.95) {
        pixels[index + 0] = g; // Shift red to green
        pixels[index + 1] = b; // Shift green to blue
        pixels[index + 2] = r; // Shift blue to red
      } else {
        pixels[index + 0] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
      }
      pixels[index + 3] = 255; // Full opacity
    }
  }

  updatePixels();
}
