let img;
let pixelSize = 10; // Size of each pixel in the pixelated image
let frameSection = {x: 0, y: 0, w: 100, h: 100}; // Section for the frame pattern
let centerSection = {x: 0, y: 0, w: 150, h: 150}; // Section for the center pattern

function preload() {
  // Replace 'your-image.jpg' with your actual image path
  img = loadImage('eye.png');
}

function setup() {
  createCanvas(1080, 1080);
  pixelDensity(1); // Ensure consistent pixelation across devices
  
  // Wait for image to load before selecting random sections
  img.loadPixels();
  
  // Randomly select frame section (smaller)
  frameSection.x = int(random(0, img.width - frameSection.w));
  frameSection.y = int(random(0, img.height - frameSection.h));
  
  // Randomly select center section (larger)
  centerSection.x = int(random(0, img.width - centerSection.w));
  centerSection.y = int(random(0, img.height - centerSection.h));
}

function draw() {
  background(220);
  
  // Draw the outer frame pattern
  drawFrame();
  
  // Draw the center pattern
  drawCenter();
  
  // Only draw once
  noLoop();
}

function drawFrame() {
  // Draw top frame
  drawFrameSection(0, 0, width, height/6);
  // Draw bottom frame (flipped vertically)
  push();
  scale(1, -1);
  translate(0, -height);
  drawFrameSection(0, 0, width, height/6);
  pop();
  
  // Draw left frame
  drawFrameSection(0, height/6, width/6, height * 4/6);
  // Draw right frame (flipped horizontally)
  push();
  scale(-1, 1);
  translate(-width, 0);
  drawFrameSection(0, height/6, width/6, height * 4/6);
  pop();
}

function drawFrameSection(x, y, w, h) {
  let sectionImg = img.get(frameSection.x, frameSection.y, frameSection.w, frameSection.h);
  sectionImg.loadPixels();
  
  // Pixelate and repeat the section
  for (let i = x; i < x + w; i += frameSection.w) {
    for (let j = y; j < y + h; j += frameSection.h) {
      image(sectionImg, i, j);
    }
  }
}

function drawCenter() {
  let centerX = width/6;
  let centerY = height/6;
  let centerW = width * 4/6;
  let centerH = height * 4/6;
  
  let sectionImg = img.get(centerSection.x, centerSection.y, centerSection.w, centerSection.h);
  sectionImg.loadPixels();
  
  // Draw top-left quarter (original)
  image(sectionImg, centerX, centerY, centerW/2, centerH/2);
  
  // Draw top-right quarter (flipped horizontally)
  push();
  scale(-1, 1);
  image(sectionImg, -width + centerX, centerY, centerW/2, centerH/2);
  pop();
  
  // Draw bottom-left quarter (flipped vertically)
  push();
  scale(1, -1);
  image(sectionImg, centerX, -height + centerY, centerW/2, centerH/2);
  pop();
  
  // Draw bottom-right quarter (flipped both ways)
  push();
  scale(-1, -1);
  image(sectionImg, -width + centerX, -height + centerY, centerW/2, centerH/2);
  pop();
}

function pixelateImage(img) {
  // Create a temporary graphics buffer
  let buffer = createGraphics(img.width, img.height);
  buffer.image(img, 0, 0);
  buffer.loadPixels();
  
  // Sample pixels at intervals
  for (let x = 0; x < buffer.width; x += pixelSize) {
    for (let y = 0; y < buffer.height; y += pixelSize) {
      let col = buffer.get(x, y);
      buffer.noStroke();
      buffer.fill(col);
      buffer.rect(x, y, pixelSize, pixelSize);
    }
  }
  
  return buffer;
}