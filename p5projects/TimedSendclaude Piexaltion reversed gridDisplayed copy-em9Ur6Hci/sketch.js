const serial = new p5.WebSerial();
let video;
const gridWidth = 16;
const gridHeight = 8;
const numLEDs = gridWidth * gridHeight;
let lastSendTime = 0;
const sendInterval = 200; // Send data every 100ms
let portButton;
let isConnected = false;
let debugText = "";
let pixelatedVideo;  // Add a global pixelated version of the video
let ledGrid = []; // Array to store the LED colors being sent

let dataSend = [];

// effects order
//    [0] = default 
//           will be 1 if the default mode is active
//    [1] = reverse 
//             will be 1 if reversed colors
//    [2] = grayscale 
//              will be 1 if grayscale 
//    [3] = mirrorX
//    [4] = mirrorY
//    [5] = hueShift 

// let effects = ["", "blackWhite", "mirrorX", "mirrorY", "reverse"]
let activeFX = []
// let effect = effects[0]




// let inData; 
let inData = ["0","0","0","0"] ;


function setup() {
  createCanvas(640, 360);
  if (!navigator.serial) {
    alert("WebSerial is not supported. Try Chrome.");
    return;
  }
  // console.log(typeof dataSend)
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);

  serial.on("close", onPortClose);
  
  makePortButton();
  
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  pixelatedVideo = createImage(gridWidth, gridHeight); // Create the pixelated video image
  ledGrid = new Array(numLEDs).fill([0, 0, 0]); // Initialize the LED grid with black
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

  // Draw the LED grid as a representation of the output
  // drawLEDGrid();
  
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
        let r = pixelatedVideo.pixels[index];
        let g = pixelatedVideo.pixels[index + 1];
        let b = pixelatedVideo.pixels[index + 2];

        if (inData[0] == "1") {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
        }

        // Handle grayscale - with proper rounding and constraints
        if (inData[1] == "1") {
            let grayscale = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            grayscale = constrain(grayscale, 0, 255);
            r = grayscale;
            g = grayscale;
            b = grayscale;
        }

        // Ensure all values are integers
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
      
        dataToSend += `${r},${g},${b},`;
        // ledGrid[y * gridWidth + x] = [r, g, b];
    }

    dataToSend = dataToSend.slice(0, -1) + 'E';
    serial.write(dataToSend);
}


/////////////////////////////
// A CALLBACK FUNCTION CALLED WHEN DATA COMES IN  ///  
/////////////////////////////

function serialEvent() {
  // read a string from the serial port
  // until you get carriage return and newline:
  let inString = serial.readStringUntil("\r\n");
  //check to see that there's actually a string there:
  if (inString) {
    inData = split(inString, ",");
  }
  // inData = ["1", "0","0","0"]
}

/////////////////////////////
// A CALLBACK FUNCTION CALLED WHEN DATA COMES IN  ///  
/////////////////////////////

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

