let img;
let pixelSize = 10;
let frameSection = {x: 0, y: 0, w: 100, h: 100};
let centerSection = {x: 0, y: 0, w: 150, h: 150};
let rugWidth = 1080;
let rugHeight = 1400;
let framePieceCount;
let animationDelay = 200;
let currentPiece = 0;
let totalPieces = 0;
let placedElements = [];

function preload() {
  img = loadImage('eye.png');
}

function setup() {
  createCanvas(rugWidth, rugHeight);
  pixelDensity(1);
  noStroke();
  
  img.loadPixels();
  frameSection.x = int(random(0, img.width - frameSection.w));
  frameSection.y = int(random(0, img.height - frameSection.h));
  centerSection.x = int(random(0, img.width - centerSection.w));
  centerSection.y = int(random(0, img.height - centerSection.h));
  
  frameSection.h = rugWidth / 8;
  let frameSideLength = rugWidth / 8;
  framePieceCount = Math.floor((rugWidth - 2 * frameSideLength) / frameSideLength);
  if (framePieceCount % 2 !== 0) framePieceCount--;
  frameSection.w = frameSideLength;

  totalPieces = framePieceCount * 4 + 4 + 4;
  setInterval(addNextPiece, animationDelay);
}

function createCornerPiece(sectionImg) {
  let buffer = createGraphics(frameSection.w, frameSection.w);
  buffer.pixelDensity(1);
  buffer.noStroke();
  
  // Draw original triangle
  for(let x = 0; x < buffer.width; x++) {
    for(let y = 0; y < buffer.height; y++) {
      if (x >= y) {  // Only draw in bottom-right triangle
        let srcX = map(x, 0, buffer.width, 0, sectionImg.width);
        let srcY = map(y, 0, buffer.height, 0, sectionImg.height);
        let col = sectionImg.get(srcX, srcY);
        buffer.fill(col);
        buffer.rect(x, y, 1, 1);
      } else {  // Mirror for top-left triangle
        let mirrorX = y;
        let mirrorY = x;
        let col = buffer.get(mirrorX, mirrorY);
        buffer.fill(col);
        buffer.rect(x, y, 1, 1);
      }
    }
  }
  
  return buffer;
}

function addNextPiece() {
  if (currentPiece < totalPieces) {
    placedElements.push(currentPiece);
    currentPiece++;
  }
}

function draw() {
  background(220);
  
  let sectionImg = img.get(frameSection.x, frameSection.y, frameSection.w, frameSection.h);
  sectionImg = pixelateImage(sectionImg);
  let cornerPiece = createCornerPiece(sectionImg);
  let cornerSize = frameSection.w;
  let pieceWidth = (width - (2 * cornerSize)) / framePieceCount;
  
  let piecesDrawn = 0;
  
  // Draw frame pieces
  for (let i = 0; i < framePieceCount && piecesDrawn < placedElements.length; i++, piecesDrawn++) {
    let x = cornerSize + (i * pieceWidth);
    if (i % 2 === 0) {
      image(sectionImg, x, 0, pieceWidth, frameSection.h);
    } else {
      push();
      translate(x + pieceWidth, 0);
      scale(-1, 1);
      image(sectionImg, 0, 0, pieceWidth, frameSection.h);
      pop();
    }
  }

  // Right side
  for (let i = 0; i < framePieceCount && piecesDrawn < placedElements.length; i++, piecesDrawn++) {
    let y = cornerSize + (i * pieceWidth);
    push();
    translate(width-135, y);
    rotate(HALF_PI);
    if (i % 2 === 0) {
      image(sectionImg, 0, -frameSection.h, pieceWidth, frameSection.h);
    } else {
      scale(-1, 1);
      image(sectionImg, 0, -frameSection.h, pieceWidth, frameSection.h);
    }
    pop();
  }

  // Bottom
  for (let i = 0; i < framePieceCount && piecesDrawn < placedElements.length; i++, piecesDrawn++) {
    let x = cornerSize + (i * pieceWidth);
    push();
    translate(x, height);
    rotate(PI);
    if (i % 2 === 0) {
      image(sectionImg, 0, -frameSection.h, pieceWidth, frameSection.h);
    } else {
      scale(-1, 1);
      image(sectionImg, 0, -frameSection.h, pieceWidth, frameSection.h);
    }
    pop();
  }

  // Left side
  for (let i = 0; i < framePieceCount && piecesDrawn < placedElements.length; i++, piecesDrawn++) {
    let y = cornerSize + (i * pieceWidth);
    push();
    translate(135, y);
    rotate(-HALF_PI);
    if (i % 2 === 0) {
      image(sectionImg, 0, -frameSection.h, pieceWidth, frameSection.h);
    } else {
      scale(-1, 1);
      image(sectionImg, 0, -frameSection.h, pieceWidth, frameSection.h);
    }
    pop();
  }

  // Draw corners
  if (piecesDrawn < placedElements.length) {
    image(cornerPiece, 0, 0);
    piecesDrawn++;
  }
  if (piecesDrawn < placedElements.length) {
    push();
    translate(width-135, 0);
    rotate(HALF_PI);
    image(cornerPiece, 0, -cornerSize);
    pop();
    piecesDrawn++;
  }
  if (piecesDrawn < placedElements.length) {
    push();
    translate(135, height);
    rotate(-HALF_PI);
    image(cornerPiece, -cornerSize, 0);
    pop();
    piecesDrawn++;
  }
  if (piecesDrawn < placedElements.length) {
    push();
    translate(width-135, height);
    rotate(PI);
    image(cornerPiece, -cornerSize, -cornerSize);
    pop();
    piecesDrawn++;
  }

  // Draw center pieces
  if (piecesDrawn < placedElements.length) {
    let centerImg = img.get(centerSection.x, centerSection.y, centerSection.w, centerSection.h);
    centerImg = pixelateImage(centerImg);
    let centerX = frameSection.w;
    let centerY = frameSection.h;
    let centerW = width - (frameSection.w * 2);
    let centerH = height - (frameSection.h * 2);
    
    image(centerImg, centerX, centerY, centerW/2, centerH/2);
    piecesDrawn++;
    
    if (piecesDrawn < placedElements.length) {
      push();
      translate(width, 0);
      scale(-1, 1);
      image(centerImg, -width + centerX, centerY, centerW/2, centerH/2);
      pop();
      piecesDrawn++;
    }
    
    if (piecesDrawn < placedElements.length) {
      push();
      translate(0, height);
      scale(1, -1);
      image(centerImg, centerX, -height + centerY, centerW/2, centerH/2);
      pop();
      piecesDrawn++;
    }
    
    if (piecesDrawn < placedElements.length) {
      push();
      translate(width, height);
      scale(-1, -1);
      image(centerImg, -width + centerX, -height + centerY, centerW/2, centerH/2);
      pop();
    }
  }
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