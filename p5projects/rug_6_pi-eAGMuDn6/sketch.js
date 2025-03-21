let img;
let pixelSize = 10; // Size of each pixel in the pixelated image
let frameSection = {x: 0, y: 0, w: 100, h: 100}; // Section for the frame pattern
let centerSection = {x: 0, y: 0, w: 150, h: 150}; // Section for the center pattern
let rugWidth = 1080; // Width of the rug
let rugHeight = 1400; // Height of the rug
let framePieceCount;

function preload() {
  // Replace 'your-image.jpg' with your actual image path
  img = loadImage('eye.png');
}

function setup() {
  createCanvas(rugWidth, rugHeight, WEBGL);
  pixelDensity(1);
  imageMode(CORNER);
  noStroke();
  
  // Wait for image to load before selecting random sections
  img.loadPixels();
  
  // Randomly select frame section (smaller)
  frameSection.x = int(random(0, img.width - frameSection.w));
  frameSection.y = int(random(0, img.height - frameSection.h));
  
  // Randomly select center section (larger)
  centerSection.x = int(random(0, img.width - centerSection.w));
  centerSection.y = int(random(0, img.height - centerSection.h));
  
  // Calculate frame dimensions based on rug width
  frameSection.h = rugWidth / 8; // Height of frame
  let frameSideLength = rugWidth / 8; // Length of each frame side piece
  // Ensure even number of pieces for width
  framePieceCount = Math.floor((rugWidth - 2 * frameSideLength) / frameSideLength);
  if (framePieceCount % 2 !== 0) framePieceCount--;
  frameSection.w = frameSideLength;
}

function draw() {
  background(220);
  translate(-width/2, -height/2); // Reset to top-left corner for easier positioning
  push();
  drawFrame();
  pop();
  push();
  drawCenter();
  pop();
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
  let buffer = createGraphics(frameSection.w, frameSection.w, WEBGL);
  buffer.pixelDensity(1);
  
  buffer.push();
  buffer.translate(-buffer.width/2, -buffer.height/2);
  
  // Draw first triangle (pointing to center)
  buffer.beginShape(TRIANGLES);
  buffer.texture(sectionImg);
  buffer.vertex(0, 0, 0, 0);
  buffer.vertex(buffer.width, buffer.height, sectionImg.width, sectionImg.height);
  buffer.vertex(0, buffer.height, 0, sectionImg.height);
  buffer.endShape();
  
  // Draw mirrored triangle
  buffer.beginShape(TRIANGLES);
  buffer.texture(sectionImg);
  buffer.vertex(0, 0, 0, 0);
  buffer.vertex(buffer.width, 0, sectionImg.width, 0);
  buffer.vertex(buffer.width, buffer.height, sectionImg.width, sectionImg.height);
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
  
  // Draw corners with proper alignment
  image(cornerPiece, 0, 0); // Top-left
  push();
  translate(width - cornerSize, 0);
  rotate(PI/2);
  image(cornerPiece, 0, -cornerSize); // Top-right
  pop();
  push();
  translate(0, height - cornerSize);
  rotate(-PI/2);
  image(cornerPiece, -cornerSize, 0); // Bottom-left
  pop();
  push();
  translate(width - cornerSize, height - cornerSize);
  rotate(PI);
  image(cornerPiece, -cornerSize, -cornerSize); // Bottom-right
  pop();
  
  let pieceWidth = (width - (2 * cornerSize)) / framePieceCount;
  
  // Draw frame sides with consistent orientation relative to center
  for (let i = 0; i < framePieceCount; i++) {
    let x = cornerSize + (i * pieceWidth);
    
    // Top frame (oriented downward)
    push();
    translate(x + pieceWidth/2, 0);
    rotate(PI);
    if (i % 2 === 0) {
      image(sectionImg, -pieceWidth/2, -frameSection.h, pieceWidth, frameSection.h);
    } else {
      scale(-1, 1);
      image(sectionImg, -pieceWidth/2, -frameSection.h, pieceWidth, frameSection.h);
    }
    pop();
    
    // Bottom frame (oriented upward)
    push();
    translate(x + pieceWidth/2, height);
    if (i % 2 === 0) {
      image(sectionImg, -pieceWidth/2, 0, pieceWidth, frameSection.h);
    } else {
      scale(-1, 1);
      image(sectionImg, -pieceWidth/2, 0, pieceWidth, frameSection.h);
    }
    pop();
    
    // Left frame (oriented rightward)
    push();
    translate(0, cornerSize + (i * pieceWidth) + pieceWidth/2);
    rotate(-PI/2);
    if (i % 2 === 0) {
      image(sectionImg, -pieceWidth/2, -frameSection.h, pieceWidth, frameSection.h);
    } else {
      scale(-1, 1);
      image(sectionImg, -pieceWidth/2, -frameSection.h, pieceWidth, frameSection.h);
    }
    pop();
    
    // Right frame (oriented leftward)
    push();
    translate(width, cornerSize + (i * pieceWidth) + pieceWidth/2);
    rotate(PI/2);
    if (i % 2 === 0) {
      image(sectionImg, -pieceWidth/2, -frameSection.h, pieceWidth, frameSection.h);
    } else {
      scale(-1, 1);
      image(sectionImg, -pieceWidth/2, -frameSection.h, pieceWidth, frameSection.h);
    }
    pop();
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