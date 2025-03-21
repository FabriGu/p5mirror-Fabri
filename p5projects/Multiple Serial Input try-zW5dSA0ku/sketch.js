//simplified template. for longer story //https://editor.p5js.org/rios/sketches/wtZvFIkW5
//
const askForPort = true; //true first time to pick port, then change to false
const serial1 = new p5.WebSerial();
const serial2 = new p5.WebSerial();
let inpt = [serial1, serial2];

let portButton1;
let portButton2;
let portButtons = [portButton1,portButton2];

let inData1;
let inData2;
let inDatainpt = [inData1, inData2];

let outData1;
let outData2;
let outDataout = [outData1, outData2];

function setup() {
  createCanvas(windowWidth, windowHeight); // make the canvas
  if (!navigator.serial) {
    alert("WebSerial is not supported Try Chrome ");
  }
  //first time you connect create button to identify port
  if (askForPort) {
    makePortButtons();
  } else {
    serial1.getPorts(); //skip the button use port from last time
    serial2.getPorts();
  }
  serial1.on("portavailable", function() {
    openPort(0);
  });
  serial1.on("data", function() {
    serialEvent(0);
  });
  textSize(32);
  ellipseMode(CENTER);
  
  serial1.on("portavailable", function() {
    openPort(1);
  });
  serial1.on("data", function() {
    serialEvent(1);
  });
  textSize(32);
  ellipseMode(CENTER);
}

////////////
// DRAW  ///
////////////
function draw() {
  background(255);
  if (inData1) {
    let sensor1 = inData1[0];
    let sensor2 = inData1[1];
    fill(255, 0, 255, 255 - sensor1);
    ellipse(width/2, height/2, sensor2, sensor2);
    text("Input " + sensor1 + ", " + sensor1, 100, 100);
  }
  
  background(255);
  if (inData2) {
    let sensor1 = inData2[0];
    let sensor2 = inData2[1];
    fill(255, 0, 255, 255 - sensor1);
    ellipse(width/2, height/2, sensor2, sensor2);
    text("Input " + sensor1 + ", " + sensor1, 100, 100);
  }

  //don't just stand there, put these variables to use in your code
}

/////////////////////////////
// A CALLBACK FUNCTION CALLED WHEN DATA COMES IN  ///
/////////////////////////////

function serialEvent(num) {
  // read a string from the serial port
  // until you get carriage return and newline:
    let inString = inpt[num].readStringUntil("\r\n");
  
  //check to see that there's actually a string there:

  if (inString) {
    inDatainpt[num] = split(inString, ",");
  }
}


function mouseDragged() {
  //send mouse to arduino
  //ceil makes it into an integer
  mpos = ceil(map(mouseX, 0, width, 0, 255));
  //mpos = constrain(mpos,0,255);
  serial1.write(mpos);
  serial2.write(mpos);
  console.log(mpos);
  
}


/////////////////////////////////////////////
// UTILITY FUNCTIONS TO MAKE CONNECTIONS  ///
/////////////////////////////////////////////

function openPort(num) {
  console.log(inpt[num])
  inpt[num].open();
  console.log(inpt[num])
  if (portButtons[num]) portButtons[num].hide();
}

// This is a convenience for picking from available serial ports:
function makePortButtons() {
  // create and position a port chooser button:
  portButton1 = createButton("choose port 1");
  portButton1.position(10, 10);
  // give the port button a mousepressed handler:
  portButton1.mousePressed(() => serial1.requestPort());
  
  // create and position a port chooser button:
  portButton2 = createButton("choose port 2");
  portButton2.position(10, 30);
  // give the port button a mousepressed handler:
  portButton2.mousePressed(() => serial2.requestPort());
}
