const kMatrixWidth = 16;
const kMatrixHeight = 16;
const pixelSize = 35;
const spacing = 2;
const orbSize = 400; // Diameter of the orb

let startHue = 0;
let xPhase = 0;
let xPhaseMul = 2 * 256;
let yPhaseMul = 256;
let yPhaseMulStep = 3;
let xPhaseMulStep = 2;
let mask;

function setup() {
  const canvasSize = max(windowWidth, windowHeight) * 0.8;
  createCanvas(canvasSize, canvasSize);
  colorMode(HSB, 255);
  frameRate(15);
  noStroke();
  
  // Create circular mask
  mask = createGraphics(width, height);
  mask.noStroke();
  mask.fill(255);
  mask.circle(width/2, height/2, orbSize);
}

function draw() {
  background(0);
  
  // Create offscreen graphics for the LED matrix
  let pg = createGraphics(width, height);
  pg.colorMode(HSB, 255);
  pg.noStroke();
  
  startHue = (startHue + 0.5) % 255;
  xPhase += 0.5;
  
  yPhaseMul += yPhaseMulStep * 0.25;
  if (yPhaseMul <= 96) {
    yPhaseMulStep = random(4) + 1;
  }
  if (yPhaseMul >= 8 * 128) {
    yPhaseMulStep = -random(4) - 1;
  }
  
  xPhaseMul += xPhaseMulStep * 0.25;
  if (xPhaseMul <= 96) {
    xPhaseMulStep = random(4) + 1;
  }
  if (xPhaseMul >= 8 * 128) {
    xPhaseMulStep = -random(4) - 1;
  }

  let pixelHue = startHue;
  let matrixSize = pixelSize * kMatrixWidth + spacing * (kMatrixWidth - 1);
  let startX = width/2 - matrixSize/2;
  let startY = height/2 - matrixSize/2;

  for (let i = 0; i < 384; i++) {
    let x = 32767 + cos(xPhase/8000 + i * xPhaseMul/5000) * 32767;
    let y = 32767 + sin(i * yPhaseMul/5000) * 32767;
    
    x = map(x, 0, 65535, 0, kMatrixWidth - 1);
    y = map(y, 0, 65535, 0, kMatrixHeight - 1);
    
    drawSoftPixel(pg, x, y, pixelHue, startX, startY);
    
    pixelHue = (pixelHue + 0.5) % 255;
  }
  
  // Apply mask
  pg.loadPixels();
  mask.loadPixels();
  
  // Only draw pixels where mask is white
  image(pg, 0, 0);
  blend(mask, 0, 0, width, height, 0, 0, width, height, MULTIPLY);
}

function drawSoftPixel(pg, x, y, hue, startX, startY) {
  let xInt = floor(x);
  let yInt = floor(y);
  let xFrac = x - xInt;
  let yFrac = y - yInt;
  
  let br00 = (1 - xFrac) * (1 - yFrac);
  let br10 = xFrac * (1 - yFrac);
  let br01 = (1 - xFrac) * yFrac;
  let br11 = xFrac * yFrac;
  
  for(let offY = 0; offY <= 1; offY++) {
    for(let offX = 0; offX <= 1; offX++) {
      let px = xInt + offX;
      let py = yInt + offY;
      
      if (px >= 0 && px < kMatrixWidth && py >= 0 && py < kMatrixHeight) {
        let brightness = 255 * (offX ? (offY ? br11 : br10) : (offY ? br01 : br00));
        if (brightness > 0) {
          brightness = map(brightness, 0, 255, 50, 255);
          pg.fill(hue, 255, brightness);
          
          let xPos = startX + px * (pixelSize + spacing);
          let yPos = startY + py * (pixelSize + spacing);
          
          pg.rect(xPos, yPos, pixelSize, pixelSize, 4);
        }
      }
    }
  }
}