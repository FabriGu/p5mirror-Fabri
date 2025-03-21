const askForPort = true; // true first time to pick port, then change to false
const serial = new p5.WebSerial();

let portButton;
let inData;
let outData;

let video;
const gridSize = 8; // 8x8 grid for 64 LEDs

function setup() {
  createCanvas(windowWidth, windowHeight); // make the canvas
  if (!navigator.serial) {
    alert("WebSerial is not supported. Try Chrome.");
  }
  // first time you connect create button to identify port
  if (askForPort) {
    makePortButton();
  } else {
    serial.getPorts(); // skip the button, use port from last time
  }
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);

  // Capture video from the camera
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  textSize(32);
  noFill();
}

function draw() {
  image(video, 0, 0, width, height);

  let dataToSend = "";

  // Iterate over an 8x8 grid to get color values
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize*2; x++) {
      // Calculate the position on the video for each grid point
      let posX = (x + 0.5) * (width / gridSize);
      let posY = (y + 0.5) * (height / gridSize);

      // Get the color at that position
      let color = video.get(posX, posY);

      // Extract RGB values and add to data string
      let r = color[0];
      let g = color[1];
      let b = color[2];
      
      if (x > 15) {
        dataToSend += `${r},${g},${b}`;
      } else {
        dataToSend += `${r},${g},${b},`;
      }
      
    }
    // dataToSend += `${r},${g},${b}`
    dataToSend += `\n`;
  }

  // Send the entire set of color data to Arduino
  // if (serial.isOpen()) {
  setTimeout(function() {
      serial.write(dataToSend);
  }, 500)
    
  
    console.log(dataToSend)
  // }
}

/////////////////////////////
// A CALLBACK FUNCTION CALLED WHEN DATA COMES IN  ///
/////////////////////////////
function serialEvent() {
  // read a string from the serial port
  // until you get carriage return and newline:
  let inString = serial.readStringUntil("\r\n");
  // check to see that there's actually a string there:
  if (inString) {
    inData = split(inString, ",");
  }
}

/////////////////////////////////////////////
// UTILITY FUNCTIONS TO MAKE CONNECTIONS  ///
/////////////////////////////////////////////
function openPort() {
  serial.open();
  if (portButton) portButton.hide();
}

// This is a convenience for picking from available serial ports:
function makePortButton() {
  // create and position a port chooser button:
  portButton = createButton("choose port");
  portButton.position(10, 10);
  // give the port button a mousepressed handler:
  portButton.mousePressed(() => serial.requestPort());
}
