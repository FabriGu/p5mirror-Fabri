let img;
let pixelSize = 10; // Size of each pixel in the pixelated image
let frameSection = {x: 0, y: 0, w: 100, h: 100}; // Section for the frame pattern
let centerSection = {x: 0, y: 0, w: 150, h: 150}; // Section for the center pattern
let framePieceCount = 6; // Number of frame pieces on each side (must be even)

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

function pixelateImage(img) {
  let buffer = createGraphics(img.width, img.height);
  buffer.pixelDensity(1);
  buffer.image(img, 0, 0);
  buffer.loadPixels();
  
  // Create new buffer for pixelated result
  let result = createGraphics(img.width, img.height);
  result.pixelDensity(1);
  
  // Sample pixels at intervals
  for (let x = 0; x < buffer.width; x += pixelSize) {
    for (let y = 0; y < buffer.height; y += pixelSize) {
      let col = buffer.get(x, y);
      result.noStroke();
      result.fill(col);
      result.rect(x, y, pixelSize, pixelSize);
    }
  }
  
  return result;
}

function createCornerPiece(sectionImg) {
  let buffer = createGraphics(sectionImg.width, sectionImg.height);
  buffer.pixelDensity(1);
  
  // Draw original image in top-left triangle
  buffer.image(sectionImg, 0, 0);
  
  // Create mirrored version for bottom-right triangle
  buffer.push();
  buffer.translate(buffer.width, buffer.height);
  buffer.rotate(PI);
  buffer.image(sectionImg, 0, 0);
  buffer.pop();
  
  return buffer;
}

function drawFrame() {
  let sectionImg = img.get(frameSection.x, frameSection.y, frameSection.w, frameSection.h);
  sectionImg = pixelateImage(sectionImg);
  
  // Calculate frame piece dimensions
  let pieceWidth = (width - frameSection.w * 2) / framePieceCount;
  let pieceHeight = frameSection.h;
  
  // Draw corners first
  let cornerPiece = createCornerPiece(sectionImg);
  image(cornerPiece, 0, 0); // Top-left
  push();
  translate(width, 0);
  rotate(HALF_PI);
  image(cornerPiece, 0, 0); // Top-right
  pop();
  push();
  translate(0, height);
  rotate(-HALF_PI);
  image(cornerPiece, 0, 0); // Bottom-left
  pop();
  push();
  translate(width, height);
  rotate(PI);
  image(cornerPiece, 0, 0); // Bottom-right
  pop();
  
  // Draw top frame pieces
  for (let i = 0; i < framePieceCount; i++) {
    let x = frameSection.w + i * pieceWidth;
    // Alternate between original and reflected
    if (i % 2 === 0) {
      image(sectionImg, x, 0, pieceWidth, pieceHeight);
    } else {
      push();
      scale(-1, 1);
      image(sectionImg, -x - pieceWidth, 0, pieceWidth, pieceHeight);
      pop();
    }
  }
  
  // Draw bottom frame pieces (rotated 180 degrees to maintain orientation)
  push();
  translate(0, height);
  rotate(PI);
  for (let i = 0; i < framePieceCount; i++) {
    let x = frameSection.w + i * pieceWidth;
    if (i % 2 === 0) {
      image(sectionImg, x, 0, pieceWidth, pieceHeight);
    } else {
      push();
      scale(-1, 1);
      image(sectionImg, -x - pieceWidth, 0, pieceWidth, pieceHeight);
      pop();
    }
  }
  pop();
  
  // Draw left frame pieces
  push();
  translate(0, frameSection.h);
  rotate(-HALF_PI);
  for (let i = 0; i < framePieceCount; i++) {
    let x = frameSection.w + i * pieceWidth;
    if (i % 2 === 0) {
      image(sectionImg, x, 0, pieceWidth, pieceHeight);
    } else {
      push();
      scale(-1, 1);
      image(sectionImg, -x - pieceWidth, 0, pieceWidth, pieceHeight);
      pop();
    }
  }
  pop();
  
  // Draw right frame pieces
  push();
  translate(width, frameSection.h);
  rotate(HALF_PI);
  for (let i = 0; i < framePieceCount; i++) {
    let x = frameSection.w + i * pieceWidth;
    if (i % 2 === 0) {
      image(sectionImg, x, 0, pieceWidth, pieceHeight);
    } else {
      push();
      scale(-1, 1);
      image(sectionImg, -x - pieceWidth, 0, pieceWidth, pieceHeight);
      pop();
    }
  }
  pop();
}

function drawCenter() {
  let centerX = frameSection.w;
  let centerY = frameSection.h;
  let centerW = width - (frameSection.w * 2);
  let centerH = height - (frameSection.h * 2);
  
  let sectionImg = img.get(centerSection.x, centerSection.y, centerSection.w, centerSection.h);
  sectionImg = pixelateImage(sectionImg);
  
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