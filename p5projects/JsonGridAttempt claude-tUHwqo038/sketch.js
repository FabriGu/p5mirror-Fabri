const serial = new p5.WebSerial();
let video;
const gridWidth = 16;
const gridHeight = 8;
const numLEDs = gridWidth * gridHeight;
let lastSendTime = 0;
const sendInterval = 500; // Send data every 100ms
let portButton;
let isConnected = false;
let debugText = "";

function setup() {
  createCanvas(640, 360);
  if (!navigator.serial) {
    alert("WebSerial is not supported. Try Chrome.");
    return;
  }
  
  serial.on("noport", makePortButton);
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);
  serial.on("close", onPortClose);
  
  makePortButton();
  
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
}

function draw() {
  background(220);
  image(video, 0, 0, width, height);
  
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

function sendVideoData() {
  let dataToSend = { "pixels": [] };
  
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      let posX = int((x + 0.5) * (width / gridWidth));
      let posY = int((y + 0.5) * (height / gridHeight));
      let col = video.get(posX, posY);
      dataToSend.pixels.push(col[0], col[1], col[2]);
    }
  }
  
  let jsonString = JSON.stringify(dataToSend);
  serial.write(jsonString + "E");
  debugText = `Sent: ${jsonString.substring(0, 50)}...`;
  
  console.log("Full JSON sent:", jsonString);
}

function serialEvent() {
  let inString = serial.readStringUntil("\n");
  if (inString != null) {
    console.log("Received:", inString);
    debugText += ` | Received: ${inString}`;
  }
}

function openPort(selectedPort) {
  serial.open(selectedPort, 9600);
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