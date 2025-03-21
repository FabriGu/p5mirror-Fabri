const kMatrixWidth = 16;
const kMatrixHeight = 16;
const pixelSize = 0.1;
const spacing = 0.02;

let matrixSize;

let startHue = 0;
let xPhase = 0;
let xPhaseMul = 2 * 256;
let yPhaseMul = 256;
let yPhaseMulStep = 3;
let xPhaseMulStep = 2;
let rotationX = 0;
let rotationY = 0;

function setup() {
  const canvasSize = max(windowWidth, windowHeight) * 0.8;
  createCanvas(canvasSize, canvasSize, WEBGL);
  colorMode(HSB, 255);
  frameRate(15);
  noStroke();
  
  // Enable smooth shading
  setAttributes('antialias', true);
}

function draw() {
  background(0);
  
  // Set up lighting
  ambientLight(60);
  pointLight(255, 0, 255, 0, 0, 300);
  
  // Add some ambient rotation
  rotationX += 0.01;
  rotationY += 0.005;
  
  // Set up camera and rotation
  orbitControl();
  rotateX(rotationX);
  rotateY(rotationY);
  
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
  matrixSize = pixelSize * kMatrixWidth + spacing * (kMatrixWidth - 1);
  let startX = -matrixSize/2;
  let startY = -matrixSize/2;

  // Move everything back so we can see it
  translate(0, 0, -2);
  
  // Draw on a sphere
  for (let i = 0; i < 384; i++) {
    let x = 32767 + cos(xPhase/8000 + i * xPhaseMul/5000) * 32767;
    let y = 32767 + sin(i * yPhaseMul/5000) * 32767;
    
    x = map(x, 0, 65535, 0, kMatrixWidth - 1);
    y = map(y, 0, 65535, 0, kMatrixHeight - 1);
    
    drawSoftPixel3D(x, y, pixelHue, startX, startY);
    
    pixelHue = (pixelHue + 0.5) % 255;
  }
}

function drawSoftPixel3D(x, y, hue, startX, startY) {
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
          fill(hue, 255, brightness);
          
          let xPos = startX + px * (pixelSize + spacing);
          let yPos = startY + py * (pixelSize + spacing);
          
          // Convert flat coordinates to spherical
          let phi = map(xPos, -matrixSize/2, matrixSize/2, -PI/2, PI/2);
          let theta = map(yPos, -matrixSize/2, matrixSize/2, -PI/2, PI/2);
          let radius = 1;
          
          push();
          translate(
            radius * cos(theta) * cos(phi),
            radius * sin(theta),
            radius * cos(theta) * sin(phi)
          );
          
          // Orient box to face outward from sphere center
          rotateY(phi);
          rotateX(-theta);
          
          box(pixelSize);
          pop();
          translate(-radius * cos(theta) * cos(phi), -radius * sin(theta), -radius * cos(theta) * sin(phi))
        }
      }
    }
  }
  
}