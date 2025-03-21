const askForPort = true; // Set to false after first connection
const serial = new p5.WebSerial();

// Grid configuration
const GRID_SIZE = 10;
let boxWidth, boxHeight;
let gridSequence = [];
let currentBoxIndex = 0;
let sampledImage = null;

// Thermal printer configuration
const PRINTER_WIDTH = 384;
const PRINTER_HEIGHT = 250;

let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let sampleButton;
let portButton;

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);
  
  // Setup WebSerial
  if (!navigator.serial) {
    alert("WebSerial is not supported. Try Chrome.");
  }
  
  if (askForPort) {
    makePortButton();
  } else {
    serial.getPorts();
  }
  
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);
  
  // Setup face tracking
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  faceMesh.detectStart(video, gotFaces);
  
  // Create sampling button
  sampleButton = createButton('Sample Grid Box');
  sampleButton.position(10, height + 10);
  sampleButton.mousePressed(sampleNextBox);
  
  // Generate random sequence
  gridSequence = generateRandomSequence(GRID_SIZE * GRID_SIZE);
  
  boxWidth = 200 / GRID_SIZE;
  boxHeight = 250 / GRID_SIZE;
}

function draw() {
  image(video, 0, 0, width, height);
  
//   // Draw face tracking and grid
//   for (let i = 0; i < faces.length; i++) {
//     let face = faces[i];
//     drawFaceGrid(face);
//     for (let j = 0; j < face.keypoints.length; j++) {
//       let keypoint = face.keypoints[j];
//       fill(0, 255, 0);
//       noStroke();
//       circle(keypoint.x, keypoint.y, 5);
//     }
//   }
  
  // Display sampled image
  if (sampledImage) {
    image(sampledImage, width - 100, height - 100, 100, 100);
  }
}

function drawFaceGrid(face) {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  for (let point of face.keypoints) {
    minX = min(minX, point.x);
    minY = min(minY, point.y);
    maxX = max(maxX, point.x);
    maxY = max(maxY, point.y);
  }
  
  stroke(255);
  noFill();
  for (let i = 0; i <= GRID_SIZE; i++) {
    let x = minX + (i * boxWidth);
    line(x, minY, x, maxY);
  }
  for (let i = 0; i <= GRID_SIZE; i++) {
    let y = minY + (i * boxHeight);
    line(minX, y, maxX, y);
  }
  
  // Number the grid boxes
  textSize(8);
  fill(255);
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      let x = minX + (j * boxWidth);
      let y = minY + (i * boxHeight);
      text(i * GRID_SIZE + j, x + 2, y + 8);
    }
  }
}

async function sampleNextBox() {
  if (faces.length === 0 || !serial.isOpen()) return;
  
  let face = faces[0];
  let minX = Infinity, minY = Infinity;
  
  for (let point of face.keypoints) {
    minX = min(minX, point.x);
    minY = min(minY, point.y);
  }
  
  // Get current box coordinates
  let boxIndex = gridSequence[currentBoxIndex];
  let row = floor(boxIndex / GRID_SIZE);
  let col = boxIndex % GRID_SIZE;
  
  // Sample the box
  let x = minX + (col * boxWidth);
  let y = minY + (row * boxHeight);
  
  sampledImage = createGraphics(ceil(boxWidth), ceil(boxHeight));
  sampledImage.copy(video, x, y, boxWidth, boxHeight, 0, 0, boxWidth, boxHeight);
  
  // Convert to printer format
  let imageData = [];
  sampledImage.loadPixels();
  for (let y = 0; y < sampledImage.height; y++) {
    for (let x = 0; x < sampledImage.width; x += 8) {
      let bite = 0;
      for (let b = 0; b < 8; b++) {
        if (x + b < sampledImage.width) {
          let idx = (y * sampledImage.width + x + b) * 4;
          let brightness = (sampledImage.pixels[idx] + sampledImage.pixels[idx + 1] + sampledImage.pixels[idx + 2]) / 3;
          if (brightness < 128) bite |= (1 << (7 - b));
        }
      }
      imageData.push(bite);
    }
  }
  
  // Create image.h content
  let fileContent = '#ifndef IMAGE_H\n#define IMAGE_H\n\n';
  fileContent += 'unsigned char show[] = {\n';
  
  // Add header bytes
  fileContent += '0x1B,0x2A,0x20,0xFA,0x00,   //Bitmap size: 24*250\n';
  
  // Add image data
  for (let i = 0; i < imageData.length; i++) {
    fileContent += '0x' + imageData[i].toString(16).padStart(2, '0');
    if (i < imageData.length - 1) fileContent += ',';
    if ((i + 1) % 16 === 0) fileContent += '\n';
  }
  
  // Add printer control codes
  fileContent += ',\n0x1B,0x40,  // Initialize printer\n';
  fileContent += '0x1D,0x2F,0x30  // Print bitmap\n';
  fileContent += '};\n\n#endif';
  
  // Send file content to PHP server
  try {
    const response = await fetch('http://localhost:8888/save_image.php', {  // MAMP default port
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileContent })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('image.h saved successfully');
      // Send print trigger after file is saved
      serial.write('P');
    } else {
      console.error('Failed to save image.h:', result.error);
    }
  } catch (error) {
    console.error('Error saving file:', error);
  }
  
  currentBoxIndex = (currentBoxIndex + 1) % (GRID_SIZE * GRID_SIZE);
}

function generateRandomSequence(length) {
  let seq = Array.from({length}, (_, i) => i);
  for (let i = seq.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [seq[i], seq[j]] = [seq[j], seq[i]];
  }
  return seq;
}

function convertToThermalFormat(img) {
  let printerImg = createImage(PRINTER_WIDTH, PRINTER_HEIGHT);
  printerImg.copy(img, 0, 0, img.width, img.height, 0, 0, PRINTER_WIDTH, PRINTER_HEIGHT);
  printerImg.loadPixels();
  
  let printerData = [];
  printerData.push(0x1B, 0x2A, 0x20, PRINTER_WIDTH & 0xFF, (PRINTER_WIDTH >> 8) & 0xFF);
  
  for (let y = 0; y < PRINTER_HEIGHT; y++) {
    for (let x = 0; x < PRINTER_WIDTH; x += 8) {
      let bite = 0;
      for (let b = 0; b < 8; b++) {
        if (x + b < PRINTER_WIDTH) {
          let idx = (y * PRINTER_WIDTH + x + b) * 4;
          let brightness = (printerImg.pixels[idx] + printerImg.pixels[idx + 1] + printerImg.pixels[idx + 2]) / 3;
          if (brightness < 128) bite |= (1 << (7 - b));
        }
      }
      printerData.push(bite);
    }
  }
  
  printerData.push(0x1B, 0x40);
  printerData.push(0x1D, 0x2F, 0x30);
  
  return printerData;
}

async function sendToPrinter(data) {
  // if (!serial.isOpen()) return;
  
  // Send data in chunks to avoid buffer overflow
  const CHUNK_SIZE = 32;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    const byteArray = new Uint8Array(chunk);
    await serial.write(byteArray);
    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between chunks
  }
  
  // Send newline to mark end of transmission
  await serial.write('\n');
}

function serialEvent() {
  let inString = serial.readStringUntil("\r\n");
  if (inString) {
    console.log("Received:", inString);
  }
}

function openPort() {
  serial.open({ baudRate: 9600 });
  if (portButton) portButton.hide();
}

function makePortButton() {
  portButton = createButton("choose port");
  portButton.position(10, 10);
  portButton.mousePressed(() => serial.requestPort());
}

function gotFaces(results) {
  faces = results;
}