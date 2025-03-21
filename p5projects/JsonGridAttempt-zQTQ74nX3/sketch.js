const askForPort = true; // true first time to pick port, then change to false
const serial = new p5.WebSerial();

let portButton;
let inData;
let outData;

let video;
const gridWidth = 16;  // 16 columns
const gridHeight = 8;  // 8 rows
const numLEDs = gridWidth * gridHeight; // Total 128 LEDs

function setup() {
  createCanvas(windowWidth, windowHeight); // Make the canvas
  if (!navigator.serial) {
    alert("WebSerial is not supported. Try Chrome.");
  }
  if (askForPort) {
    makePortButton();
  } else {
    serial.getPorts(); // Skip the button, use port from last time
  }
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);

  // Capture video from the camera
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
}

function draw() {
  image(video, 0, 0, width, height);

    

    // Create an object to store the RGB values
    let dataToSend = { 
      "pixels": [] 
    };

    
      // Iterate over a 16x8 grid to get color values
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          // Calculate the position on the video for each grid point
          let posX = (x + 0.5) * (width / gridWidth);
          let posY = (y + 0.5) * (height / gridHeight);

          // Get the color at that position
          let col = video.get(posX, posY);

          //Add the RGB values to the array
          // dataToSend.pixels.push({
          //   "r": col[0],
          //   "g": col[1],
          //   "b": col[2]
          // });
          dataToSend.pixels.push(
            col[0],
            col[1],
            col[2]
          );
        }
      }
  
  
    setTimeout(()=> {
       // Convert the object to a JSON string
      let jsonString = JSON.stringify(dataToSend);

      // Send the JSON string to Arduino

      serial.write(jsonString + "\n");  // Send JSON with newline at the end
      console.log(jsonString);
    }, 5000);
   
  
}

/////////////////////////////
// A CALLBACK FUNCTION CALLED WHEN DATA COMES IN
/////////////////////////////
function serialEvent() {
  let inString = serial.readStringUntil("\r\n");
  if (inString) {
    inData = split(inString, ",");
  }
}

/////////////////////////////////////////////
// UTILITY FUNCTIONS TO MAKE CONNECTIONS
/////////////////////////////////////////////
function openPort() {
  serial.open();
  if (portButton) portButton.hide();
}

function makePortButton() {
  portButton = createButton("choose port");
  portButton.position(10, 10);
  portButton.mousePressed(() => serial.requestPort());
}
