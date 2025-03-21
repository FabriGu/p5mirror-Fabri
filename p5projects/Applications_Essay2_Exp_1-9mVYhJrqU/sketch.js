const askForPort = true;
const serial = new p5.WebSerial();
let portButton;
let inData;
let outData;
let startRecordBtn;
let endRecordBtn;
let downloadBtn;
let avgBeats = [];
let R = false;

// Variables for plotting
let dataPoints = [];
const maxDataPoints = 200;
let isRecording = false;
let recordedData = [];
let recordingStartTime = 0; // Store when recording starts

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  if (!navigator.serial) {
    alert("WebSerial is not supported Try Chrome ");
  }
  
  if (askForPort) {
    makePortButton();
  } else {
    serial.getPorts();
  }
  
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);
  textSize(32);
  
  // Start Recording button
  startRecordBtn = createButton("Start Recording");
  startRecordBtn.position(100, 10);
  startRecordBtn.mousePressed(() => {
    serial.write('1');
    isRecording = true;
    recordedData = [];
    recordingStartTime = Date.now(); // Record start time
    console.log("Started recording");
  });
  
  // Stop Recording button
  endRecordBtn = createButton("Stop Recording");
  endRecordBtn.position(100, 40);
  endRecordBtn.mousePressed(() => {
    serial.write('0');
    isRecording = false;
    console.log("Stopped recording");
  });
  
  // Download button
  downloadBtn = createButton("Download CSV");
  downloadBtn.position(100, 70);
  downloadBtn.mousePressed(downloadCSV);
}

function draw() {
  background(255);
  
  if (inData) {
    let sensor1 = parseFloat(inData[0]);
    let sensor2 = parseFloat(inData[1]);
    let sensor3 = parseFloat(inData[2]);
    
    // Add new data point
    dataPoints.push({
      sensor1: sensor1,
      sensor2: sensor2,
      sensor3: sensor3,
      time: millis()
    });
    
    // Keep only last maxDataPoints
    if (dataPoints.length > maxDataPoints) {
      dataPoints.shift();
    }
    
    // Record data if recording is active
    if (isRecording) {
      const currentTime = Date.now();
      const relativeTimeSeconds = (currentTime - recordingStartTime) / 1000; // Convert to seconds
      
      recordedData.push({
        timestamp: new Date().toISOString(),
        relativeTime: relativeTimeSeconds.toFixed(3), // 3 decimal places for millisecond precision
        sensor2: sensor2
      });
    }
    
    // Draw the plot
    drawPlot();
    
    // Display current values and recording status
    fill(0);
    text("Current Values:", 100, 120);
    text("Sensor 1: " + sensor1, 100, 160);
    text("Sensor 2: " + sensor2, 100, 200);
    text("Sensor 3: " + sensor3, 100, 240);
    
    if (isRecording) {
      const currentTime = Date.now();
      const elapsedTime = ((currentTime - recordingStartTime) / 1000).toFixed(1);
      fill(255, 0, 0);
      text("Recording: " + elapsedTime + "s", 100, 280);
    }
  }
}

function drawPlot() {
  // Draw plot background
  push();
  translate(300, height - 100);
  
  // Draw axes
  stroke(0);
  line(0, 0, width - 400, 0); // x-axis
  line(0, -400, 0, 0); // y-axis
  
  // Plot the data
  noFill();
  stroke(255, 0, 0); // Red for sensor1
  beginShape();
  for (let i = 0; i < dataPoints.length; i++) {
    let x = map(i, 0, maxDataPoints, 0, width - 400);
    let y = map(dataPoints[i].sensor1, 0, 1023, 0, -400);
    vertex(x, y);
  }
  endShape();
  
  stroke(0, 255, 0); // Green for sensor2
  beginShape();
  for (let i = 0; i < dataPoints.length; i++) {
    let x = map(i, 0, maxDataPoints, 0, width - 400);
    let y = map(dataPoints[i].sensor2, 0, 1023, 0, -400);
    vertex(x, y);
  }
  endShape();
  
  stroke(0, 0, 255); // Blue for sensor3
  beginShape();
  for (let i = 0; i < dataPoints.length; i++) {
    let x = map(i, 0, maxDataPoints, 0, width - 400);
    let y = map(dataPoints[i].sensor3, 0, 1023, 0, -400);
    vertex(x, y);
  }
  endShape();
  
  pop();
}

function downloadCSV() {
  if (recordedData.length === 0) {
    console.log("No data to download");
    return;
  }
  
  // Create CSV content with relative timestamps
  let csvContent = "Timestamp,RelativeTime(s),Sensor2\n";
  recordedData.forEach(row => {
    csvContent += `${row.timestamp},${row.relativeTime},${row.sensor2}\n`;
  });
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "sensor_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function serialEvent() {
  let inString = serial.readStringUntil("\r\n");
  if (inString) {
    inData = split(inString, ",");
  }
}

function openPort() {
  serial.open();
  if (portButton) portButton.hide();
}

function makePortButton() {
  portButton = createButton("choose port");
  portButton.position(10, 10);
  portButton.mousePressed(() => serial.requestPort());
}