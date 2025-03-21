//simplified template. for longer story //https://editor.p5js.org/rios/sketches/wtZvFIkW5
//
const askForPort = true; //true first time to pick port, then change to false
const serial = new p5.WebSerial();

let portButton;
let inData;
let outData;

let img;

let bright = 0; // variable to hold the data we're sending
let dark, light; // variables to hold the bgcolor

function preload() {
  img = loadImage('./images/img.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight); // make the canvas
  if (!navigator.serial) {
    alert("WebSerial is not supported Try Chrome ");
  }
  //first time you connect create button to identify port
  if (askForPort) {
    makePortButton();
  } else {
    serial.getPorts(); //skip the button use port from last time
  }
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);
  textSize(32);
  ellipseMode(CENTER);
  // define the colors
  dark = color(0);
  light = color(255, 204, 0);
  
}

////////////
// DRAW  ///
////////////
function drawGradient(c1, c2) {
  noFill();
  
  for (let y = 0; y < height; y++) {
    let interp = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, interp);
    stroke(c);
    line(0, y, width, y);
  }
}

function draw() {
  // drawGradient(dark, light);
  image(img, 0, 0);
  stroke(255);
  strokeWeight(3);
  noFill();
  ellipse(mouseX, mouseY, 10, 10);
}

function mouseDragged(){
   // console.log(get(mouseX, mouseY));
  bright = floor(map(mouseY, 0, 512, 0, 255));
  bright = constrain(bright, 0, 255);
  // serial.write(bright);
  // console.log(bright);
  console.log(str(img.get(mouseX,mouseY).slice(0,3).join(",")));
  serial.write(str(img.get(mouseX,mouseY).slice(0,3).join(",")) + "\n");
}


  //don't just stand there, put these variables to use in your code


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


// function mouseDragged() {
//   //send mouse to arduino
//   //ceil makes it into an integer
//   mpos = ceil(map(mouseX, 0, width, 0, 255));
//   //mpos = constrain(mpos,0,255);
//   serial.write(mpos);
//   console.log(mpos);
//   console.log(img.get(mouseX,mouseY))
//   console.log(str(img.get(mouseX,mouseY).join(",")));
  
// }


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
