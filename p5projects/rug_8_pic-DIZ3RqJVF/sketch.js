let img;
const pixelSize = 10;
const rugWidth = 1080;
const rugHeight = 1350;
const animationDelay = 20;

let frameSection = {
  w: rugWidth / 8,
  h: rugWidth / 8,
  x: 0,
  y: 0
};

let centerSection = {
  w: rugWidth / 4,
  h: rugHeight / 4,
  x: 0,
  y: 0
};

let framePieceCount;
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
  
  // Randomly position frame and center samples within source image
  frameSection.x = int(random(0, img.width - frameSection.w));
  frameSection.y = int(random(0, img.height - frameSection.h));
  centerSection.x = int(random(0, img.width - centerSection.w));
  centerSection.y = int(random(0, img.height - centerSection.h));
  
  // Calculate frame piece counts
  framePieceCount = Math.floor((rugWidth - 2 * frameSection.w) / frameSection.w);
  // framePieceCount+=2;
  if (framePieceCount % 2 !== 0) framePieceCount--;
  
  // Total pieces: frame sides + corners + center quadrants
  totalPieces = framePieceCount * 4 + 4 + 4+4;
  
  setInterval(addNextPiece, animationDelay);
}

function createCornerPiece(sectionImg) {
  let buffer = createGraphics(frameSection.w, frameSection.w);
  buffer.pixelDensity(1);
  buffer.noStroke();
  
  for(let x = 0; x < buffer.width; x++) {
    for(let y = 0; y < buffer.height; y++) {
      if (x >= y) {
        let srcX = map(x, 0, buffer.width, 0, sectionImg.width);
        let srcY = map(y, 0, buffer.height, 0, sectionImg.height);
        let col = sectionImg.get(srcX, srcY);
        buffer.fill(col);
        buffer.rect(x, y, 1, 1);
      } else {
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
  
  let piecesDrawn = 0;
  let pieceWidth = frameSection.w;
  
  // Draw top frame
  for (let i = 0; i < framePieceCount && piecesDrawn < placedElements.length; i++, piecesDrawn++) {
    let x = frameSection.w + (i * pieceWidth);
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

  // Draw right frame
  for (let i = 0; i < (framePieceCount+2) && piecesDrawn < placedElements.length; i++, piecesDrawn++) {
    let y = frameSection.h + (i * pieceWidth);
    push();
    translate(width, y);
    rotate(HALF_PI);
    if (i % 2 === 0) {
      image(sectionImg, 0, 0, pieceWidth, frameSection.h);
    } else {
      scale(-1, 1);
      image(sectionImg, -frameSection.h, 0, pieceWidth, frameSection.h);
    }
    pop();
  }

  // Draw bottom frame
  for (let i = 0; i < framePieceCount && piecesDrawn < placedElements.length; i++, piecesDrawn++) {
    let x = frameSection.w + (i * pieceWidth);
    push();
    translate(x+frameSection.h, height );
    rotate(PI);
    if (i % 2 === 0) {
      image(sectionImg, 0, 0, pieceWidth, frameSection.h);
    } else {
      translate(pieceWidth, 0);
      scale(-1, 1);
      image(sectionImg, 0, 0, pieceWidth, frameSection.h);
    }
    pop();
  }

  // Draw left frame
  for (let i = 0; i < (framePieceCount +2) && piecesDrawn < placedElements.length; i++, piecesDrawn++) {
    let y = frameSection.h + (i * pieceWidth);
    push();
    translate(0, y);
    rotate(-HALF_PI);
    if (i % 2 === 0) {
      image(sectionImg, -frameSection.h*2, 0, pieceWidth, frameSection.h);
    } else {
      scale(-1, 1);
      image(sectionImg, -frameSection.h,0, pieceWidth, frameSection.h);
    }
    pop();
  }

  // Draw corners
  if (piecesDrawn < placedElements.length) {
    image(cornerPiece, 0, 0);
    // rotate(HALF_PI);
    push()
    translate(frameSection.w,0)
    // rotate(-HALF_PI)
    image(cornerPiece, 0, 0);
    pop()
    piecesDrawn++;
  }
  if (piecesDrawn < placedElements.length) {
    push();
    translate(width-frameSection.w, 0);
    push()
    translate(-frameSection.w, 0);
    rotate(PI/4)
    image(cornerPiece, 0, -frameSection.w);
    pop()
    rotate(HALF_PI);
    image(cornerPiece, 0, -frameSection.w);
    pop();
    piecesDrawn++;
  }
  if (piecesDrawn < placedElements.length) {
    push();
    translate(width, height);
    rotate(PI);
    image(cornerPiece, 0, -frameSection.w);
    pop();
    piecesDrawn++;
  }
  if (piecesDrawn < placedElements.length) {
    push();
    translate(0, height);
    rotate(-HALF_PI);
    image(cornerPiece, -frameSection.h, 0);
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
    
    // Top left
    image(centerImg, centerX, centerY, centerW/2, centerH/2);
    piecesDrawn++;
    
    if (piecesDrawn < placedElements.length) {
      // Top right
      push();
      translate(centerImg.width+frameSection.w, centerY);
      scale(-1, 1);
      image(centerImg, -centerX - centerW/2, 0, centerW/2, centerH/2);
      pop();
      piecesDrawn++;
    }
    
    if (piecesDrawn < placedElements.length) {
      // Bottom left
      push();
      translate(centerX, height-centerImg.height*2);
      scale(1, -1);
      image(centerImg, 0, -centerH/2, centerW/2, centerH/2);
      pop();
      piecesDrawn++;
    }
    
    if (piecesDrawn < placedElements.length) {
      // Bottom right
      push();
      translate(width - (centerImg.width*2),height-centerImg.height*2-55);
      scale(-1, -1);
      image(centerImg, -centerW/2, -centerH/2, centerW/2, centerH/2);
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