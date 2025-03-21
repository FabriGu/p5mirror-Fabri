let img;

function preload() {
  img = loadImage("images/cat-3.jpg");
}

function setup() {
  createCanvas(500, 500);
  img.resize(100, 100);
  noSmooth();
}

function draw() {
  img.loadPixels();

  // Process a limited number of pixels per frame for smooth movement
  let pixelsToMove = 1000;
  for (let i = 0; i < pixelsToMove; i++) {
    let x = int(random(img.width));
    let y = int(random(img.height));
    movePixelInCircle(x, y);
  }

  img.updatePixels();
  image(img, 0, 0, width, height);
}

function movePixelInCircle(x, y) {
  // Get current color of the pixel
  const currentColor = img.get(x, y);

  // Calculate target center as the mouse position mapped to image coordinates
  let centerX = map(mouseX, 0, width, 0, img.width);
  let centerY = map(mouseY, 0, height, 0, img.height);

  // Calculate distance and angle from the center
  let dx = x - centerX;
  let dy = y - centerY;
  let distance = sqrt(dx * dx + dy * dy);
  let angle = atan2(dy, dx);

  // Set step size based on distance (closer pixels move in smaller steps)
  let step = map(distance, 0, img.width / 2, 0.5, 2);

  // Calculate new position along the angle toward the center
  let newX = constrain(x - step * cos(angle), 0, img.width - 1);
  let newY = constrain(y - step * sin(angle), 0, img.height - 1);

  // Get color of new position and update the pixels
  let newColor = img.get(newX, newY);
  img.set(newX, newY, currentColor);
  img.set(x, y, newColor);
}
