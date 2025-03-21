let img;
let mousePressedDown = false;
let speed = 10000;

function preload() {
  img = loadImage("images/city-night.jpg");
}

function setup() {
  createCanvas(img.width, img.height);
  img.resize(300, 300);
  noSmooth();
}

function draw() {
  img.loadPixels();

  // Loop to process multiple pixels per frame
  if (mousePressedDown) {
    for (let i = 0; i < speed; i++) {
      sortPixels();
    }
  }

  img.updatePixels();
  image(img, 0, 0, width, height);
}

function sortPixels() {
  // Get x and y coordinates for a random pixel in the image
  const x = int(random(img.width));
  const y = int(random(img.height));

  // Select a neighboring pixel closer to the mouse
  let [neighborX, neighborY] = moveCloserToMouse(x, y);

  // Ensure neighboring pixel is within bounds
  if (neighborX < 0 || neighborX >= img.width || neighborY < 0 || neighborY >= img.height) {
    return;
  }

  // Get color values and brightness for both pixels
  const colorValuesOne = getColValues(x, y);
  const colorValuesTwo = getColValues(neighborX, neighborY);
  let brightnessOne = colorValuesOne[0] + colorValuesOne[1] + colorValuesOne[2];
  let brightnessTwo = colorValuesTwo[0] + colorValuesTwo[1] + colorValuesTwo[2];

  // Calculate distances to the mouse position
  let distanceOne = determineDist(x, y);
  let distanceTwo = determineDist(neighborX, neighborY);

  // Swap if brighter pixel is further from mouse, or attempt slope movement
  if (brightnessOne > brightnessTwo && distanceOne > distanceTwo) {
    // Standard swap
    const tempColor = color(colorValuesOne[0], colorValuesOne[1], colorValuesOne[2]);
    img.set(x, y, color(colorValuesTwo[0], colorValuesTwo[1], colorValuesTwo[2]));
    img.set(neighborX, neighborY, tempColor);
  } else if (brightnessOne >= brightnessTwo && distanceOne >= distanceTwo) {
    // If a direct swap isn't possible, try shifting laterally to "flow" around
    let sideNeighborX = neighborX + (random(1) < 0.5 ? -1 : 1); // Move left or right
    sideNeighborX = constrain(sideNeighborX, 0, img.width - 1); // Constrain within bounds

    // If the side position is valid and can hold this pixel, perform the swap
    const sideColorValues = getColValues(sideNeighborX, neighborY);
    let sideBrightness = sideColorValues[0] + sideColorValues[1] + sideColorValues[2];
    let sideDistance = determineDist(sideNeighborX, neighborY);

    // Swap only if the target side pixel has a lower brightness and is further from the mouse
    if (sideBrightness < brightnessOne && sideDistance > distanceOne) {
      img.set(x, y, color(sideColorValues[0], sideColorValues[1], sideColorValues[2]));
      img.set(sideNeighborX, neighborY, color(colorValuesOne[0], colorValuesOne[1], colorValuesOne[2]));
    }
  }
}


function determineDist(x, y) {
  // Get target coordinates (mouse position in the image's space)
  const targetCoords = getTargetCoordinates();

  // Calculate distance to mouse
  let dx = targetCoords[0] - x;
  let dy = targetCoords[1] - y;
  return sqrt(dx * dx + dy * dy);
}

function moveCloserToMouse(x, y) {
  const targetCoords = getTargetCoordinates();

  // Calculate movement towards mouse by 1 pixel
  let newX = x;
  let newY = y;

  if (x < targetCoords[0]) newX = x + 1;
  else if (x > targetCoords[0]) newX = x - 1;

  if (y < targetCoords[1]) newY = y + 1;
  else if (y > targetCoords[1]) newY = y - 1;

  // Additional logic to encourage an orb shape
  if (random(1) < 0.5) {
    if (newX !== x && (y === targetCoords[1] || random(1) < 0.5)) newY += (random(1) < 0.5 ? 1 : -1);
    else if (newY !== y) newX += (random(1) < 0.5 ? 1 : -1);
  }

  // Return new coordinates, constrained within the image boundaries
  return [constrain(newX, 0, img.width - 1), constrain(newY, 0, img.height - 1)];
}

function getColValues(x, y) {
  let i = (x + y * img.width) * 4;
  return [img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]];
}

function getTargetCoordinates() {
  let targetX = map(mouseX, 0, width, 0, img.width);
  let targetY = map(mouseY, 0, height, 0, img.height);
  return [targetX, targetY];
}

function mousePressed() {
  mousePressedDown = true;
}

function mouseReleased() {
  mousePressedDown = false;
}
