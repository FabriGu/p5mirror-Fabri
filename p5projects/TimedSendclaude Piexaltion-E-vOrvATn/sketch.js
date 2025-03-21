const serial = new p5.WebSerial();
let video;
const gridWidth = 16;
const gridHeight = 8;
const numLEDs = gridWidth * gridHeight;
let lastSendTime = 0;
const sendInterval = 100; // Send data every 100ms
let portButton;
let isConnected = false;
let debugText = "";

// let pixelatedVideo;

function setup() {
  createCanvas(640, 360);
  if (!navigator.serial) {
    alert("WebSerial is not supported. Try Chrome.");
    return;
  }
  
  // serial.on("noport", makePortButton);
  serial.on("portavailable", openPort);
  // serial.on("data", serialEvent);
  serial.on("close", onPortClose);
  
  makePortButton();
  
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
 
}

function draw() {
  background(220);
  // push()
  // scale(-1, 1);
  image(video, 0, 0, width, height);
  // pop()
  
  if (isConnected && millis() - lastSendTime > sendInterval) {
    sendVideoData();
    lastSendTime = millis();
  }
  
  // Display debug information
  fill(255);
  rect(0, height - 60, width, 60);
  fill(0);
  textSize(16);
  text(debugText, 10, height - 40);
}

// function sendVideoData() {
//   let dataToSend = '';

//   for (let y = 0; y < gridHeight; y++) {
//     for (let x = 0; x < gridWidth; x++) {
//       let posX = int((x + 0.5) * (width / gridWidth));
//       let posY = int((y + 0.5) * (height / gridHeight));
//       let col = video.get(posX, posY);
//       dataToSend += `${col[0]},${col[1]},${col[2]},`;
//     }
//   }
//   dataToSend = dataToSend.slice(-1);
//   dataToSend += 'E'; // End of frame marker
//   serial.write(dataToSend);
//   // console.log(Sent ${dataToSend.length} characters);
// }

function sendVideoData() {
  let dataToSend = '';

  // Create a pixelated version of the video by scaling it down to 16x8
  video.loadPixels(); // Load the video pixels
  let pixelatedVideo = createImage(gridWidth, gridHeight); // Create a new image at 16x8 size
  pixelatedVideo.copy(video, 0, 0, video.width, video.height, 0, 0, gridWidth, gridHeight); // Copy video into pixelated version
  pixelatedVideo.loadPixels(); // Load pixels for the pixelated image

  // Iterate over the 16x8 grid to get the average colors
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      let index = (y * gridWidth + x) * 4; // Get the pixel index (each pixel has 4 values: R, G, B, A)
      

      let r = pixelatedVideo.pixels[index];
      let g = pixelatedVideo.pixels[index + 1];
      let b = pixelatedVideo.pixels[index + 2];

      // Append the averaged RGB values to the data string
      dataToSend += `${r},${g},${b},`;
    }
    // console.log(pixelatedVideo.pixels)
  }

  dataToSend = dataToSend.slice(0, -1); // Remove the last comma
  dataToSend += 'E'; // End of frame marker
  serial.write(dataToSend);
  // console.log(dataToSend);
}



// function serialEvent() {
//   let inString = serial.readStringUntil("\n");
//   if (inString != null) {
//     console.log("Received:", inString);
//     debugText += ` | Received: ${inString}`;
//   }
// }

function openPort(selectedPort) {
  serial.open();
  isConnected = true;
  portButton.hide();
  debugText = "Port opened successfully";
}

function onPortClose() {
  isConnected = false;
  debugText = "Port closed";
  makePortButton();
}

function makePortButton() {
  portButton = createButton('Choose Serial Port');
  portButton.position(10, 10);
  portButton.mousePressed(() => {
    serial.requestPort();
    debugText = "Requesting port...";
  });
}