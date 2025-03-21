// P5.js Code
const serial = new p5.WebSerial();
let video;
const gridWidth = 16;
const gridHeight = 8;
const numLEDs = gridWidth * gridHeight;
let lastSendTime = 0;
const sendInterval = 200; // Increased from 100ms to 200ms for stability
let portButton;
let isConnected = false;
let debugText = "";
let pixelatedVideo;
let ledGrid = [];

let dataSend = [];
let inData = ["0","0","0","0"];

function setup() {
  createCanvas(640, 360);
  if (!navigator.serial) {
    alert("WebSerial is not supported. Try Chrome.");
    return;
  }
  
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);
  serial.on("close", onPortClose);
  
  makePortButton();
  
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  pixelatedVideo = createImage(gridWidth, gridHeight);
  ledGrid = new Array(numLEDs).fill([0, 0, 0]);
}

function draw() {
  background(220);
  image(video, 0, 0, width, height);

  if (isConnected && millis() - lastSendTime > sendInterval) {
    sendVideoData();
    lastSendTime = millis();
  }
  
  fill(255);
  rect(0, height - 60, width, 60);
  fill(0);
  textSize(16);
  text(debugText, 10, height - 40);

  if (inData) {
    let sensor0 = inData[0];
    let sensor1 = inData[1];
    let sensor2 = inData[2];
    let sensor3 = inData[3];
    text("Input " + sensor0 + ", " + sensor1 + ", " + sensor2 + ", "+ sensor3, 100, 100);
  }
}
function sendVideoData() {
    let dataToSend = '';
    video.loadPixels();
    pixelatedVideo.copy(video, 0, 0, video.width, video.height, 0, 0, gridWidth, gridHeight);
    pixelatedVideo.loadPixels();

    // Rewrite the loops using < or > instead of !=
    if (inData[3] == "1") { // mirrorY
        for (let y = 0; y < gridHeight; y++) {
            if (inData[2] == "1") { // mirrorX
                for (let x = gridWidth - 1; x >= 0; x--) {
                    processPixel(x, y);
                }
            } else {
                for (let x = 0; x < gridWidth; x++) {
                    processPixel(x, y);
                }
            }
        }
    } else {
        for (let y = gridHeight - 1; y >= 0; y--) {
            if (inData[2] == "1") { // mirrorX
                for (let x = gridWidth - 1; x >= 0; x--) {
                    processPixel(x, y);
                }
            } else {
                for (let x = 0; x < gridWidth; x++) {
                    processPixel(x, y);
                }
            }
        }
    }

    function processPixel(x, y) {
        let index = (y * gridWidth + x) * 4;
        // Ensure initial RGB values are integers
        let r = Math.floor(pixelatedVideo.pixels[index]);
        let g = Math.floor(pixelatedVideo.pixels[index + 1]);
        let b = Math.floor(pixelatedVideo.pixels[index + 2]);

        // Apply reverse effect
        if (inData[0] == "1") {
            r = Math.floor(255 - r);
            g = Math.floor(255 - g);
            b = Math.floor(255 - b);
        }

        // Apply grayscale effect - ensure result is an integer
        if (inData[1] == "1") {
            let grayscale = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
            // Ensure grayscale value is within valid range
            grayscale = Math.max(0, Math.min(255, grayscale));
            r = g = b = grayscale;
        }

        // Final safety check to ensure values are valid integers between 0-255
        r = Math.max(0, Math.min(255, Math.floor(r)));
        g = Math.max(0, Math.min(255, Math.floor(g)));
        b = Math.max(0, Math.min(255, Math.floor(b)));

        dataToSend += `${r},${g},${b},`;
    }

    // Only send if we have data
    if (dataToSend.length > 0) {
        dataToSend = dataToSend.slice(0, -1) + 'E';
        serial.write(dataToSend);
    }
}


function serialEvent() {
    let inString = serial.readStringUntil("\r\n");
    if (inString && inString.trim()) {
        try {
            let newData = split(inString, ",");
            if (newData.length === 4) {
                inData = newData;
            }
        } catch (error) {
            console.error("Error parsing serial data:", error);
        }
    }
}

function openPort(selectedPort) {
    try {
        serial.open();
        isConnected = true;
        portButton.hide();
        debugText = "Port opened successfully";
    } catch (error) {
        console.error("Error opening port:", error);
        debugText = "Error opening port";
        isConnected = false;
    }
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
