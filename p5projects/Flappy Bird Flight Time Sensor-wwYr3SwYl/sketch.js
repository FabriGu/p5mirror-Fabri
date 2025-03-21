// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/cXgA1d_E-jY&


var bird;
var pipes = [];

// Taken from serial input sketch of Dan.O
//simplified template. for longer story //https://editor.p5js.org/rios/sketches/wtZvFIkW5
//
const askForPort = true; //true first time to pick port, then change to false
const serial = new p5.WebSerial();

let portButton;
let inData;
let outData;
//
// let sensor1=0;

function setup() {
  createCanvas(640, 480);
  bird = new Bird();
  pipes.push(new Pipe());
  
  // taken from serial input sketch
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
}

function draw() {
  background(0);

  for (var i = pipes.length-1; i >= 0; i--) {
    pipes[i].show();
    pipes[i].update();

    if (pipes[i].hits(bird)) {
      console.log("HIT");
    }

    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
    }
  }

  bird.update();
  bird.show();

  if (frameCount % 75 == 0) {
    pipes.push(new Pipe());
  }
  
  // taken from serial input Sketch
  // console.log(inData)
  if (inData) {
    let sensor1 = inData[0];
    // console.log(sensor1)
    // let sensor2 = inData[1];
    fill(255, 0, 255, 255 - sensor1);
    // ellipse(width/2, height/2, sensor2, sensor2);
    text("Input " + sensor1, 100, 100);
    bird.up(sensor1);
  }
  
}

function keyPressed() {
  if (key == ' ') {
    
    //console.log("SPACE");
  }
}

// taken from serial input sketch 

function serialEvent() {
  // read a string from the serial port
  // until you get carriage return and newline:
  let inString = serial.readStringUntil("\r\n");
  //check to see that there's actually a string there:
  if (inString) {
    inData = split(inString, ",");
  }
}


function mouseDragged() {
  //send mouse to arduino
  //ceil makes it into an integer
  mpos = ceil(map(mouseX, 0, width, 0, 255));
  //mpos = constrain(mpos,0,255);
  serial.write(mpos);
  console.log(mpos);
  
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

