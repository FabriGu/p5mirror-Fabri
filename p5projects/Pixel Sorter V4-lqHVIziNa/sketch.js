let img;
let numRings = 10;  // Number of concentric rings to form
let ringRadius = 2; // Pixel width of each ring

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

  // Process multiple pixels per frame
  for (let i = 0; i < 10000; i++) {
    sortPixelsInRings();
  }

  img.updatePixels();
  image(img, 0, 0, width, height);
}

function sortPixelsInRings() {
  const x = int(random(img.width));
  const y = int(random(img.height));

  // Get neighboring pixel in direction of mouse
  const [neighborX, neighborY] = moveCloserToRing(x, y);

  // Check bounds
  if (neighborX < 0 || neighborX >= img.width || neighborY < 0 || neighborY >= img.height) {
    return;
  }

  // Get colors and brightness levels of current and neighbor pixels
  const colorOne = img.get(x, y);
  const colorTwo = img.get(neighborX, neighborY);

  let brightnessOne = red(colorOne) + green(colorOne) + blue(colorOne);
  let brightnessTwo = red(colorTwo) + green(colorTwo) + blue(colorTwo);

  // Calculate ring distances
  let ringDistOne = determineRing(x, y);
  let ringDistTwo = determineRing(neighborX, neighborY);

  // Sort pixels based on ring distance and brightness
  if (brightnessOne > brightnessTwo && ringDistOne > ringDistTwo) {
    img.set(x, y, colorTwo);
    img.set(neighborX, neighborY, colorOne);
  }
}

function determineRing(x, y) {
  let targetX = map(mouseX, 0, width, 0, img.width);
  let targetY = map(mouseY, 0, height, 0, img.height);
  let distanceFromRing = dist(targetX, targetY, x, y);

  // Determine which ring the pixel is in
  return int(distanceFromRing / ringRadius);
}

function moveCloserToRing(x, y) {
  let targetX = map(mouseX, 0, width, 0, img.width);
  let targetY = map(mouseY, 0, height, 0, img.height);
  let distFromMouse = dist(x, y, targetX, targetY);

  // Check if within target ring; stop moving if so
  if (distFromMouse <= numRings * ringRadius) {
    return [x, y];
  }

  // Adjust x and y to move pixel closer to the next ring inwards
  let newX = x;
  let newY = y;

  if (x < targetX) {
    newX = x + 1;
  } else if (x > targetX) {
    newX = x - 1;
  }

  if (y < targetY) {
    newY = y + 1;
  } else if (y > targetY) {
    newY = y - 1;
  }

  return [newX, newY];
}
