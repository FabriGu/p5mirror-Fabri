// Serial 
const askForPort = true; //true first time to pick port, then change to false
const serial = new p5.WebSerial();
let portButton;
let inData; 
let outData; 

let startRecordBtn;
let endRecordBtn;
let downloadBtn;

let avgBeats = [];
let R = false;

function setup() {
  
  // Serial
  createCanvas(windowWidth, windowHeight); // make the canvas
  if (!navigator.serial) {
    alert("WebSerial is not supported Try Chrome ");
  }
  //first time you connect create button to identify port
  if (askForPort ) {
     makePortButton();
  } else {
   serial.getPorts(); //skip the button use port from last time
  }
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);
  textSize(32);
  
  
  // create and position a ON button:
  startRecordBtn = createButton("Start");
  startRecordBtn.position(100, 10);
  // give the port button a mousepressed handler:
  startRecordBtn.mousePressed(() =>serial.write('1'));
  
  // create and position a ON button:
  endRecordBtn = createButton("Stop");
  endRecordBtn.position(100, 30);
  // give the port button a mousepressed handler:
  endRecordBtn.mousePressed(() =>serial.write('0'));
  
  // create and position a ON button:
  endRecordBtn = createButton("Download");
  endRecordBtn.position(150, 10);
  // give the port button a mousepressed handler:
  endRecordBtn.mousePressed(() =>serial.write('0'));

}

function draw() {
  background(255);
  
  if (inData) {
    let sensor1 = inData[0];
    let sensor2 = inData[1];
    let sensor3 = inData[2];

    text("Input " + sensor1 + ", " + sensor2 + ", " + sensor3, 100, 100);
  }
}


// SERIAL 

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
}

/////////////////////////////////////////////
// UTILITY FUNCTIONS TO MAKE CONNECTIONS  ///
/////////////////////////////////////////////


function openPort() {
  serial.open()
  if (portButton) portButton.hide();
}

// This is a convenience for picking from available serial ports:
function makePortButton() {
  // create and position a port chooser button:
  portButton = createButton("choose port");
  portButton.position(10, 10);
  // give the port button a mousepressed handler:
  portButton.mousePressed(() =>serial.requestPort());
}

async function sendQRCodeToArduino(qrData) {
  serial.write(qrData + '\n');
}

