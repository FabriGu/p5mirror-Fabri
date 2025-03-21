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

  // Loop to process multiple pixels per frame
  for (let i = 0; i < 10000; i++) {
    sortPixels();
  }

  img.updatePixels();
  image(img, 0, 0, width, height);
}

function sortPixels() {
  // Randomly pick a pixel
  const x = int(random(img.width));
  const y = int(random(img.height));

  // Get a neighboring pixel randomly
  let neighborX = x + int(random(-1, 2));
  let neighborY = y + int(random(-1, 2));

  // Boundary check for neighbors
  if (neighborX < 0 || neighborX >= img.width || neighborY < 0 || neighborY >= img.height) {
    return;
  }

  // Get colors and brightness totals
  const colorOne = img.get(x, y);
  const colorTwo = img.get(neighborX, neighborY);
  
  let totalOne = red(colorOne) + green(colorOne) + blue(colorOne);
  let totalTwo = red(colorTwo) + green(colorTwo) + blue(colorTwo);

  // Calculate distance to mouse
  let distanceOne = determineDist(x, y);
  let distanceTwo = determineDist(neighborX, neighborY);

  // Swap only if:
  // - Brighter pixel is farther from the mouse and needs to move closer
  // - Darker pixel is closer and should move farther away
  if (totalOne > totalTwo && distanceOne > distanceTwo) {
    img.set(x, y, colorTwo);
    img.set(neighborX, neighborY, colorOne);
  }
}

function determineDist(x, y) {
  let targetX = map(mouseX, 0, width, 0, img.width);
  let targetY = map(mouseY, 0, height, 0, img.height);

  let dx = targetX - x;
  let dy = targetY - y;
  return sqrt(dx * dx + dy * dy);
}
