let lastFrameTime1 = 0;
let lastFrameTime2 = 0;
//preloading sounds
function preload() {
  // string1 = loadSound('string1.mp3');
  // string2 = loadSound('string2.mp3');
  // string3 = loadSound('string3.mp3');
  string1 = loadSound('beat1.mp3');
  string2 = loadSound('beat2.mp3');
  string3 = loadSound('beat3.mp3');
  percussion1 = loadSound('percussion1.mp3');
  percussion2 = loadSound('percussion2.mp3');
  percussion3 = loadSound('percussion3.mp3');
  
  gif1 = loadImage('heartBeating.gif');
}

const askForPort1 = false; //true first time to pick port, then change to false
const askForPort2 = false; //true first time to pick port, then change to false
const serial1 = new p5.WebSerial();
const serial2 = new p5.WebSerial();

let portButton1;
let portButton2;
let inData1;
let inData2;
let outData;
let heartbeat1; 
let heartbeat2; 
let sArr;
let pArr;
let ranS;
let ranP;
let chosenS;
let chosenP;

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
  
  sArr = [string1, string2, string3]
  pArr = [percussion1, percussion2, percussion3]
  
  
  ranS = parseInt(Math.random() * 3)
  ranP = parseInt(Math.random() * 3)

  chosenS = sArr[ranS]
  console.log(chosenS)
  chosenS.loop()
  chosenP = pArr[ranP]
  chosenP.loop()
  console.log(chosenP)

  fft1 = new p5.FFT();
  fft2 = new p5.FFT();
  
  //osc1 = new p5.Oscillator(); 
  //osc1.setType("sine");
  //osc1.amp(0.5);
  //osc1.start();
  //osc1.pan(1);
  
  //osc2 = new p5.Oscillator(); 
  //osc2.amp(0.5);
  //osc2.setType("sine");
  //osc2.start();
  //osc2.pan(0);
  
 frameRate(60)
}

////////////
// DRAW  ///
////////////
function draw() {
  background(255);
  
  // gif1.play();

//   if (inData1 && inData2) {
//     let sensor1_1 = inData1[0];
//     let sensor2_1 = parseInt(inData1[1]);
//     let sensor1_2 = inData2[0];
//     let sensor2_2 = parseInt(inData2[1]);
    
//     console.log(sensor2_1);
//     console.log(sensor2_2);
//     let heartbeat1 = map(sensor2_1, 0, 150, 0.1, 2);

//     let heartbeat2 = map(sensor2_2, 0, 150, 0.1, 2);
    let heartbeat1 = 0.3
    let heartbeat2 = 1.5
    
    image(gif1, (width/2)/2, (height/2)/2, 100, 100);
    text()
    image(gif1, (width/2)/2+200, (height/2)/2, 100, 100);
   
    chosenS.rate(heartbeat1)
    fft1.setInput(chosenS)
    push()
    let spectrum1 = fft1.analyze();
    let step1 = (width/2)/spectrum1.length;

    for (let i = 0; i < spectrum1.length; i++) {
      let x = map(i, 0, spectrum1.length, 0, width/2);
      let y = -height + map(spectrum1[i], 0, 255, height, 0);
      stroke([155,88,124])
      ellipse(x, height/2, width/spectrum1.length, y); // Draw a circle at each data point
    }
  //   for (let j = 0; j < 5; j++) {
  //     for (let i = 0; i < spectrum1.length; i++) {
  //       let x = map(i, 0, spectrum1.length, 0, width);
  //       let y = map(spectrum1[i], -1, 1, width/spectrum1.length, height);
  //       vertex(x, y);
  //     }
  //     endShape();
  // //     console.log(y1 + "  "+ y2)
  //   }
    pop()
   
    chosenP.rate(heartbeat2)
    push()
    fft2.setInput(chosenP)
    let spectrum2 = fft2.analyze();
    // let step2 = width / waveform.length;
    let step2 = (width/2)/spectrum2.length;
    // noStroke();
    // fill(0);
    for (let i = 0; i < spectrum2.length; i++) {
      let x = map(i, 0, spectrum2.length, 0, width/2);
      let y = -height + map(spectrum2[i], 0, 255, height, 0);
      stroke([122,24,155])
      ellipse((width+width/2)-(x+width/2), height/2, width/spectrum2.length, y); // Draw a circle at each data point

    }
    pop()
  // }
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
