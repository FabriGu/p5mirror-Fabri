//simplified template. for longer story //https://editor.p5js.org/rios/sketches/wtZvFIkW5
//
const askForPort = false; //true first time to pick port, then change to false
const serial = new p5.WebSerial();
let portButton;
let inData; 
let outData; 

//for colors
let colors = [];

let colorDir = [-1, 1, -1];
// for colors
let clearBtn;

function setup() {
  createCanvas(windowWidth, windowHeight); // make the canvas
  // check to see if serial is available:
  if (!navigator.serial) {
    alert("WebSerial is not supported in this browser. Try Chrome or MS Edge.");
  }
  //first time you connect create button to identify port
  if (askForPort ) {
     makePortButton();
  } else {
   serial.getPorts(); //skip the button and go with port selected last time
  }
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);
  textSize(32);
  // for colors
  colors[0] = parseInt(random(0,256));
  colors[1] = parseInt(random(0,256));
  colors[2] = parseInt(random(0,256));
  // for colors
  clearBtn = createButton("HOVER OVER TO Clear Canvas");
  clearBtn.position(10, 10);
  
}

////////////
// DRAW  ///
////////////
function draw() {
  // background(255);
  if (
    mouseX > 10 - clearBtn.size().width &&
    mouseX < 10 + clearBtn.size().width &&
    mouseY > 10 - clearBtn.size().height &&
    mouseY < 10 + clearBtn.size().height
  ) {
    background(255);
  }
  
  
  if (inData) {
    let sensor1 = inData[0];
    let sensor1Map = map( sensor1, 0, 1000, 0, 699);
    // console.log(width, height);
    
    let sensor2 = inData[1];
    
    let sensor3 = inData[2];
    let sensor3Map = map( sensor3, 0, 1000, 0, 720);
    // console.log(inData[3]);
    // console.log("hello");

    // text("Input " + sensor1 + ", " + sensor2 + ", " + sensor3, 100, 100);
    // ellipse(width/2, height/2, sensor1, sensor2);
    for (let j = 0; j < colors.length; j++) {
      if ((colors[j] < 256 && colors[j] >= 0)) {
        colors[j] += colorDir[j];
      } else {
        colorDir[j] *= -1;
        colors[j] += colorDir[j];
      }
      // console.log(colors[j]);
    }
    fill(colors);
    noStroke()
    ellipse(sensor1Map, sensor3Map, sensor2, sensor2);
  }
  
  
  
  if (mouseIsPressed) {
    serial.write(1); 
    push()
    textSize(50);
    fill("red");
    t = createP("DONT DO THAT!", width/2-190, height/2);
    sleep(2000).then(t.remove());
    pop()
  } else {
    serial.write(0);
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
