const kMatrixWidth = 16;
const kMatrixHeight = 16;
const pixelSize = 35;
const spacing = 2;

let startHue = 0;
let xPhase = 0;
let xPhaseMul = 2 * 256;
let yPhaseMul = 256;
let yPhaseMulStep = 3;
let xPhaseMulStep = 2;

function setup() {
  // Adjust canvas size to account for spacing
  createCanvas(
    kMatrixWidth * (pixelSize + spacing) - spacing,
    kMatrixHeight * (pixelSize + spacing) - spacing
  );
  colorMode(HSB, 255);
  frameRate(10); // Slow down animation by reducing framerate
}

function draw() {
  background(0);
  
  // Update animation parameters
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

  // Draw the LED matrix
  let pixelHue = startHue;
  for (let i = 0; i < 384; i++) {
    // Calculate x, y positions using sine waves
    let x = 32767 + cos(xPhase/8000 + i * xPhaseMul/5000) * 32767;
    let y = 32767 + sin(i * yPhaseMul/5000) * 32767;
    
    // Scale to matrix size
    x = map(x, 0, 65535, 0, kMatrixWidth - 1);
    y = map(y, 0, 65535, 0, kMatrixHeight - 1);
    
    // Draw with anti-aliasing
    drawSoftPixel(x, y, pixelHue);
    
    pixelHue = (pixelHue + 0.5) % 255;
  }
}

function drawSoftPixel(x, y, hue) {
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
          // Draw pixel border
          stroke(0);
          strokeWeight(1);
          fill(hue, 255, brightness);
          
          // Calculate position with spacing
          let xPos = px * (pixelSize + spacing);
          let yPos = py * (pixelSize + spacing);
          
          // Draw rounded rectangle for softer look
          rect(xPos, yPos, pixelSize, pixelSize, 4);
        }
      }
    }
  }
}