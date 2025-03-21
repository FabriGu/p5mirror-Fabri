let img;
let mousePressedDown = false
let speed = 10000;

function preload() {
  img = loadImage("images/flower-1.jpg");
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
  // Get x and y coordinates for random pixel in image
  const x = int(random(img.width));
  const y = int(random(img.height));

  // Select a pixel that is closer to the mouse
  const [neighborX, neighborY] = moveCloserToMouse(x, y);

  // get color values for first pixel
  const colorValuesOne = getColValues(x, y);
  // get color values and turn them to color obj
  let colorOne = color(colorValuesOne[0], colorValuesOne[1], colorValuesOne[2])
  // find total to use as brightness
  let totalOne = colorValuesOne[0] + colorValuesOne[1] + colorValuesOne[2]
  
  // get color values for second pixel
  const colorValuesTwo = getColValues(neighborX, neighborY);
  // get color values and turn them to color obj
  let colorTwo = color(colorValuesTwo[0],colorValuesTwo[1],colorValuesTwo[2])
  // find total to use as brightness
  let totalTwo = colorValuesTwo[0] + colorValuesTwo[1] + colorValuesTwo[2]
  
  // determine distance to mouse
  let distanceOne = determineDist(x, y);
  let distanceTwo = determineDist(neighborX, neighborY);

  // Swap only if the brighter pixel is further from mouse and should be moved closer
  if (totalOne > totalTwo && distanceOne > distanceTwo) {
    img.set(x, y, colorTwo);
    img.set(neighborX, neighborY, colorOne);
  }
}

function determineDist(x, y) {
  // // 
  // get target coordinates
  const targetCoords = getTargetCoordinates();

  // determine distance
  let dx = targetCoords[0] - x;
  let dy = targetCoords[1] - y;
  return sqrt(dx * dx + dy * dy);
}

function moveCloserToMouse(x, y) {
  // determine where the mouse is
  // important to map
  // let targetX = map(mouseX, 0, width, 0, img.width);
  // let targetY = map(mouseY, 0, height, 0, img.height);
  
  const targetCoords = getTargetCoordinates();
  // console.log(targetCoords)

  // Find new coordinates closer to mouse by 1
  let newX = x;
  let newY = y;

  if (x < targetCoords[0]) {
    // move 1 to the right
    newX = x + 1;  
  } else if (x > targetCoords[0]) {
    // move 1 to the left
    newX = x - 1; 
  }

  if (y < targetCoords[1]) {
    // move 1 down
    newY = y + 1; 
  } else if (y > targetCoords[1]) {
    // move 1 up
    newY = y - 1; 
  }

  // return new coordinates in array
  return [newX, newY];
}
  
function getColValues(x, y) {
  
  let i = (x + y * img.width) * 4;
  
  return [img.pixels[i],
        img.pixels[i+1],
        img.pixels[i+2]]
}

function getTargetCoordinates() {
  // important to map the values if not get error when trying to find the coordinates
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
