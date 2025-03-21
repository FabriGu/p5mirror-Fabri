

const askForPort = true; //true first time to pick port, then change to false
const serial = new p5.WebSerial();
let portButton;
let inData; 
let outData; 
function setup() {
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
}
////////////
// DRAW  ///
////////////

function draw() {
  background(255);
  
  // Calculate grid dimensions
  let cellSize = min(width, height) / 4;
  let gridSize = cellSize * 3;
  let startX = (width - gridSize) / 2;
  let startY = (height - gridSize) / 2;
  
  if (inData && Array.isArray(inData) && inData.length >= 9) {  // Check if data is valid
    let activePoints = []; // Store coordinates of active dots
    
    // First draw all dots
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        let x = startX + col * cellSize + cellSize/2; // Center of cell
        let y = startY + row * cellSize + cellSize/2;
        let index = row * 3 + col;
        
        // Convert string to number and check if it's 1
        let sensorValue = parseInt(inData[index].trim()) === 1;
        
        // Draw dot
        if (sensorValue) {
          fill(0, 255, 0); // Green for ON state
          noStroke();
          circle(x, y, cellSize/3);
          activePoints.push({x: x, y: y}); // Store active point coordinates
        } else {
          fill(200); // Gray for OFF state
          noStroke();
          circle(x, y, cellSize/4);
        }
      }
    }
    
    // Then draw lines between active dots
    if (activePoints.length > 1) {
      stroke(0, 255, 0);
      strokeWeight(2);
      for (let i = 0; i < activePoints.length - 1; i++) {
        line(
          activePoints[i].x, 
          activePoints[i].y, 
          activePoints[i + 1].x, 
          activePoints[i + 1].y
        );
      }
    }
    
    // Debug output
    console.log("Active points:", activePoints.length);
    console.log("Sensor values:", inData.join(", "));
  } else {
    // Draw empty grid if no valid data
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        let x = startX + col * cellSize + cellSize/2;
        let y = startY + row * cellSize + cellSize/2;
        fill(200);
        noStroke();
        circle(x, y, cellSize/4);
      }
    }
  }
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