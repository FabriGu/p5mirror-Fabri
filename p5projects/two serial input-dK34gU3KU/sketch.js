const askForPort1 = true; //true first time to pick port, then change to false
const askForPort2 = true; //true first time to pick port, then change to false
const serial1 = new p5.WebSerial();
const serial2 = new p5.WebSerial();

let portButton1;
let portButton2;
let inData1;
let inData2;
let outData;




function setup() {
  createCanvas(windowWidth, windowHeight); // make the canvas
  if (!navigator.serial) {
    alert("WebSerial is not supported. Try Chrome.");
  }
  
  // Create buttons to select ports for both Arduinos
  makePortButton1();
  makePortButton2();

  serial1.on("portavailable", openPort1);
  serial2.on("portavailable", openPort2);
  serial1.on("data", serialEvent1);
  serial2.on("data", serialEvent2);
  textSize(32);
  ellipseMode(CENTER);
  
  
  osc1 = new p5.Oscillator(); 
  osc1.setType("sine");
  osc1.amp(0.5);
  osc1.start();
  osc1.pan(1);
  
  osc2 = new p5.Oscillator(); 
  osc2.amp(0.5);
  osc2.setType("sine");
  osc2.start();
  osc2.pan(0);
}

////////////
// DRAW  ///
////////////
function draw() {
  // background(255);
  if (inData1 && inData2) {
    let sensor1_1 = inData1[0];
    let sensor2_1 = parseInt(inData1[1]);
    let sensor1_2 = inData2[0];
    let sensor2_2 = parseInt(inData2[1]);
    
    console.log(sensor2_1);
    console.log(sensor2_2);
    let bpm1 = map(sensor2_1, 0, 200, 40, 880);
    osc1.freq(bpm1);
    let bpm2 = map(sensor2_2, 0, 200, 40, 880);
    osc2.freq(bpm2);
    
    
//     fill(255, 0, 255, 255 - sensor1_1);
//     ellipse(width/4, height/2, sensor2_1, sensor2_1);
//     text("Input 1: " + sensor1_1 + ", " + sensor2_1, 100, 100);
//     fill(255, 0, 255, 255 - sensor1_2);
//     ellipse(3*width/4, height/2, sensor2_2, sensor2_2);
//     text("Input 2: " + sensor1_2 + ", " + sensor2_2, 500, 100);
  }
}

/////////////////////////////
// A CALLBACK FUNCTION CALLED WHEN DATA COMES IN  ///
/////////////////////////////

function serialEvent1() {
  let inString = serial1.readStringUntil("\r\n");
  if (inString) {
    inData1 = split(inString, ",");
  }
}

function serialEvent2() {
  let inString = serial2.readStringUntil("\r\n");
  if (inString) {
    inData2 = split(inString, ",");
  }
}

/////////////////////////////////////////////
// UTILITY FUNCTIONS TO MAKE CONNECTIONS  ///
/////////////////////////////////////////////

function openPort1() {
  serial1.open();
  if (portButton1) portButton1.hide();
}

function openPort2() {
  serial2.open();
  if (portButton2) portButton2.hide();
}

// This is a convenience for picking from available serial ports:
function makePortButton1() {
  portButton1 = createButton("choose port for Arduino 1");
  portButton1.position(10, 10);
  portButton1.mousePressed(() => serial1.requestPort());
}

function makePortButton2() {
  portButton2 = createButton("choose port for Arduino 2");
  portButton2.position(200, 10);
  portButton2.mousePressed(() => serial2.requestPort());
}
