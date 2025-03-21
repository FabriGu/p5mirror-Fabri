let serial;
let video;
const gridWidth = 16;
const gridHeight = 8;
let portButton;
let isConnected = false;
const askForPort = true; // true first time to pick port, then change to false


function setup() {
  createCanvas(640, 360);
  serial = new p5.WebSerial();

  serial.on('connected', onConnect);
  serial.on('disconnected', onDisconnect);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  if (!navigator.serial) {
      alert("WebSerial is not supported. Try Chrome.");
    }
    if (askForPort) {
      makePortButton();
    } else {
      serial.getPorts(); // Skip the button, use port from last time
    }
    serial.on("portavailable", openPort);

}

function draw() {
  image(video, 0, 0, width, height);

  if (isConnected) {
    sendVideoData();
  }
}

function sendVideoData() {
  let dataToSend = '';

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      let posX = int((x + 0.5) * (width / gridWidth));
      let posY = int((y + 0.5) * (height / gridHeight));
      let col = video.get(posX, posY);
      dataToSend += `${col[0]},${col[1]},${col[2]},`;
    }
  }
  dataToSend = dataToSend.slice(-1);
  dataToSend += 'E'; // End of frame marker
  serial.write(dataToSend);
  // console.log(`Sent ${dataToSend.length} characters`);
}

function connectToArduino() {
  if (!isConnected) {
    serial.getPorts();
    serial.on('portavailable', openPort);
  }
}

function openPort(port) {
  serial.open(port, 9600);
}

function onConnect() {
  isConnected = true;
  portButton.html('Disconnect');
  console.log('Connected to Arduino');
}

function onDisconnect() {
  isConnected = false;
  portButton.html('Connect to Arduino');
  console.log('Disconnected from Arduino');
}


function makePortButton() {
  portButton = createButton("choose port");
  portButton.position(10, 10);
  portButton.mousePressed(() => serial.requestPort());
}
