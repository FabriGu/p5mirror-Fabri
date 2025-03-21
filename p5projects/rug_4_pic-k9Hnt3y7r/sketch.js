let img;
let pixelSize = 10; // Size of each pixel in the pixelated image
let frameSection = {x: 0, y: 0, w: 100, h: 100}; // Section for the frame pattern
let centerSection = {x: 0, y: 0, w: 150, h: 150}; // Section for the center pattern
let rugSize = 1080; // Size of the rug (square)

function preload() {
  // Replace 'your-image.jpg' with your actual image path
  img = loadImage('eye.png');
}

function setup() {
  createCanvas(rugSize, rugSize);
  pixelDensity(1);
  
  // Wait for image to load before selecting random sections
  img.loadPixels();
  
  // Randomly select frame section (smaller)
  frameSection.x = int(random(0, img.width - frameSection.w));
  frameSection.y = int(random(0, img.height - frameSection.h));
  
  // Randomly select center section (larger)
  centerSection.x = int(random(0, img.width - centerSection.w));
  centerSection.y = int(random(0, img.height - centerSection.h));
  
  // Calculate frame dimensions based on rug size
  frameSection.h = rugSize / 8; // Height of frame
  let frameSideLength = rugSize / 6; // Length of each frame side piece
  // Ensure even number of pieces
  framePieceCount = Math.floor((rugSize - 2 * frameSideLength) / frameSideLength);
  if (framePieceCount % 2 !== 0) framePieceCount--;
  frameSection.w = frameSideLength;
}

function draw() {
  background(220);
  drawFrame();
  drawCenter();
  noLoop();
}

function pixelateImage(img) {
  let buffer = createGraphics(img.width, img.height);
  buffer.pixelDensity(1);
  buffer.image(img, 0, 0);
  buffer.loadPixels();
  
  let result = createGraphics(img.width, img.height);
  result.pixelDensity(1);
  
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
  let size = frameSection.w;
  let buffer = createGraphics(size, size);
  buffer.pixelDensity(1);
  
  // Draw original triangle
  buffer.push();
  buffer.beginShape();
  buffer.texture(sectionImg);
  buffer.vertex(0, 0, 0, 0);
  buffer.vertex(size, 0, sectionImg.width, 0);
  buffer.vertex(0, size, 0, sectionImg.height);
  buffer.endShape();
  buffer.pop();
  
  // Draw mirrored triangle
  buffer.push();
  buffer.beginShape();
  buffer.texture(sectionImg);
  buffer.vertex(size, size, sectionImg.width, sectionImg.height);
  buffer.vertex(size, 0, sectionImg.width, 0);
  buffer.vertex(0, size, 0, sectionImg.height);
  buffer.endShape();
  buffer.pop();
  
  return buffer;
}

function drawFrame() {
  // Get and pixelate the frame section
  let sectionImg = img.get(frameSection.x, frameSection.y, frameSection.w, frameSection.h);
  sectionImg = pixelateImage(sectionImg);
  
  // Create corner piece
  let cornerPiece = createCornerPiece(sectionImg);
  let cornerSize = frameSection.w;
  
  // Draw corners
  image(cornerPiece, 0, 0, cornerSize, cornerSize); // Top-left
  push();
  translate(width, 0);
  rotate(HALF_PI);
  image(cornerPiece, 0, 0, cornerSize, cornerSize); // Top-right
  pop();
  push();
  translate(0, height);
  rotate(-HALF_PI);
  image(cornerPiece, 0, 0, cornerSize, cornerSize); // Bottom-left
  pop();
  push();
  translate(width, height);
  rotate(PI);
  image(cornerPiece, 0, 0, cornerSize, cornerSize); // Bottom-right
  pop();
  
  let pieceWidth = (width - (2 * cornerSize)) / framePieceCount;
  
  // Draw frame sides
  for (let i = 0; i < framePieceCount; i++) {
    let x = cornerSize + (i * pieceWidth);
    
    // Top
    if (i % 2 === 0) {
      image(sectionImg, x, 0, pieceWidth, frameSection.h);
    } else {
      push();
      translate(x + pieceWidth, 0);
      scale(-1, 1);
      image(sectionImg, 0, 0, pieceWidth, frameSection.h);
      pop();
    }
    
    // Bottom
    if (i % 2 === 0) {
      image(sectionImg, x, height - frameSection.h, pieceWidth, frameSection.h);
    } else {
      push();
      translate(x + pieceWidth, height);
      scale(-1, -1);
      image(sectionImg, 0, 0, pieceWidth, frameSection.h);
      pop();
    }
    
    // Left
    if (i % 2 === 0) {
      image(sectionImg, 0, cornerSize + (i * pieceWidth), frameSection.h, pieceWidth);
    } else {
      push();
      translate(0, cornerSize + (i * pieceWidth) + pieceWidth);
      scale(1, -1);
      image(sectionImg, 0, 0, frameSection.h, pieceWidth);
      pop();
    }
    
    // Right
    if (i % 2 === 0) {
      image(sectionImg, width - frameSection.h, cornerSize + (i * pieceWidth), frameSection.h, pieceWidth);
    } else {
      push();
      translate(width, cornerSize + (i * pieceWidth) + pieceWidth);
      scale(-1, -1);
      image(sectionImg, 0, 0, frameSection.h, pieceWidth);
      pop();
    }
  }
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