let facemesh;
let video;
let predictions = [];
let gridResolution = 16; // Adjust as needed
let gridData = [];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', (results) => {
    predictions = results;
  });
}

function modelReady() {
  console.log('Facemesh model loaded');
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const headBounds = getHeadBounds(predictions[0]);
    drawGrid(headBounds);
    gridData = captureGridData(headBounds);
  }
}

// Calculate the bounding box of the head using facial landmarks
function getHeadBounds(prediction) {
  const landmarks = prediction.scaledMesh;
  const headIndices = [10, 152, 234, 454]; // Example indices for head region
  const headPoints = headIndices.map((index) => landmarks[index]);
  
  const minX = Math.min(...headPoints.map((p) => p[0]));
  const maxX = Math.max(...headPoints.map((p) => p[0]));
  const minY = Math.min(...headPoints.map((p) => p[1]));
  const maxY = Math.max(...headPoints.map((p) => p[1]));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Draw a grid over the head bounding box
function drawGrid(bounds) {
  noFill();
  stroke(255, 0, 0);
  strokeWeight(1);
  for (let i = 0; i < gridResolution; i++) {
    for (let j = 0; j < gridResolution; j++) {
      const x = bounds.x + (bounds.width / gridResolution) * i;
      const y = bounds.y + (bounds.height / gridResolution) * j;
      rect(x, y, bounds.width / gridResolution, bounds.height / gridResolution);
    }
  }
}

// Capture grid data for bitmap generation
function captureGridData(bounds) {
  let data = [];
  for (let i = 0; i < gridResolution; i++) {
    for (let j = 0; j < gridResolution; j++) {
      const x = bounds.x + (bounds.width / gridResolution) * i;
      const y = bounds.y + (bounds.height / gridResolution) * j;
      const w = bounds.width / gridResolution;
      const h = bounds.height / gridResolution;

      const col = get(int(x + w / 2), int(y + h / 2)); // Sample color in grid cell
      const brightnessValue = brightness(color(col)) > 128 ? 1 : 0; // Simplify to binary
      data.push(brightnessValue);
    }
  }
  return data;
}

// Convert grid data to a hex bitmap
function generateHexBitmap(gridData) {
  let hexData = '';
  for (let i = 0; i < gridData.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      if (i + j < gridData.length && gridData[i + j] === 1) {
        byte |= (1 << (7 - j));
      }
    }
    hexData += byte.toString(16).padStart(2, '0'); // Convert byte to hex
  }
  return hexData;
}

// Call this function to get the hex string for the printer
function getBitmapForPrinter() {
  return generateHexBitmap(gridData);
}
