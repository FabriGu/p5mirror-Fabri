// https://happycoding.io/examples/p5js/images/pixel-sorter

let img;

function preload() {
  img = loadImage("images/cat-3.jpg");

  // Click the > menu to the left and look in
  // the images directory for more images to try!
  // Or upload your own image!
  // URLs also work, like this:
  // img = loadImage('https://upload.wikimedia.org/wikipedia/commons/6/69/June_odd-eyed-cat_cropped.jpg');
}

function setup() {
  createCanvas(500, 500);

  // Resize the image so it fits on the screen.
  // We make it 100x100 so we can see individual pixels.
  img.resize(100, 100);

  noSmooth();
}

function draw() {
  img.loadPixels();

  // Loop 1000 times to speed up the animation.
  for (let i = 0; i < 10000; i++) {
    sortPixels();
  }

  img.updatePixels();

  image(img, 0, 0, width, height);
}

function sortPixels() {
  // Get a random pixel.
  const x = random(img.width);
  const y = random(img.height - 1);

  // Get the color of the pixel.
  const colorOne = img.get(x, y);

  // Get the color of the pixel below the first one.
  // const colorTwo = img.get(x, y + 1);
  // get color of neighbour 
  let neighborX = x + int(random(-1, 2));
  let neighborY = y + int(random(-1, 2));
  let colorTwo = img.get(neighborX, neighborY);
  

  // Get the total R+G+B of both colors.
  let totalOne = red(colorOne) + green(colorOne) + blue(colorTwo);
  let totalTwo = red(colorTwo) + green(colorTwo) + blue(colorTwo);

  // If the first total is less than the second total, swap the pixels.
  // This causes darker colors to fall to the bottom,
  // and light pixels to rise to the top.
  
  let distanceOne = determineDist(x, y);
  let distanceTwo = determineDist(neighborX, neighborY);
  
  if (totalOne < totalTwo && distanceOne < distanceTwo) {
    
    // console.log("og: ", determineDir(x, y))
//     console.log("Nog: ", determineDir(neighborX, neighborY))
    
     // Calculate the direction and distance toward the mouse
    
    
//     if (distanceOne > distanceTwo) {
//       img.set(x , y , colorTwo);
//       img.set(neighborX, neighborY, colorOne);
//     } 
    // else if (distnaceTwo > distanceOne) {
    //   img.set(x , y , colorTwo);
    //   img.set(neighborX, neighborY, colorOne);
    // }
                              
    img.set(x , y , colorTwo);
    img.set(neighborX, neighborY, colorOne);
  }
}

function determineDir(x, y) {
  // Determine x direction
  let xDir = 0;
  if (x < mouseX) {
    xDir = 1;  // Move right
  } else if (x > mouseX) {
    xDir = -1; // Move left
  }

  // Determine y direction
  let yDir = 0;
  if (y < mouseY) {
    yDir = 1;  // Move down
  } else if (y > mouseY) {
    yDir = -1; // Move up
  }
  
  return [xDir, yDir];
}

function determineDist(x, y) {
  let targetX = map(mouseX, 0, width, 0, img.width);
  let targetY = map(mouseY, 0, height, 0, img.height);

  let dx = targetX - x;
  let dy = targetY - y;
  let distance = sqrt(dx * dx + dy * dy);
  
  return distance;

}