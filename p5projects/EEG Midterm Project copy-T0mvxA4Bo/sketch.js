// TODO:

// Add legend to sketch
// Each symbol plotted is one sec of avg. value, instead of entire thing.


// Global variables
let suryaStatenames = ['Noise', 'Muscle', 'Focus', 'Clear', 'Meditate'];
let suryaTimeElapsed = 0;
let suryaTotalTime = 180; // 3 minutes in seconds

let suryaConnectButton = null;
let suryaStartButton = null;
let suryaIsConnected = false;
let suryaIsRecording = false; // Changed to false initially

// Add this near the top of your sketch.js file, with other global variables
let museValueHistory = [];
const maxHistoryLength = 1000; // Adjust this value based on how much history you want to keep

// STYLE VARS
let ovalCenterX = 0;
let ovalCenterY = 0;
let ovalWidth = 0;
let ovalHeight = 0;
let baseShapeSize = 12;
let offsetFromOval = 30;
let segments = 3;
let subsections = 10;
let symbolsPerSubsection = 6;

let lastUpdateTime = 0;

// Add this with other global variables
let readyToSave = false;

function setup() {
  createCanvas(600, 800);
  frameRate(30);  // Set frame rate to 30 fps
  background(255);
  
  // STYLE
  ovalCenterX = width / 2;
  ovalCenterY = height / 2;
  ovalWidth = 250;
  ovalHeight = 400;
  
  // ML
  setupMuse();
  setupMuseML();
  
  // INTERACTION
  suryaStartButton = createButton('Start Recording');
  suryaStartButton.position(150, height + 10);
  suryaStartButton.mousePressed(suryaStartRecording);
  suryaStartButton.attribute('disabled', '');
  
  suryaConnectButton = createButton('Connect to Muse2');
  suryaConnectButton.position(10, height + 10);
  suryaConnectButton.mousePressed(connectToMuse);
  bluetoothConnection = new webBLE();

}

function draw() {
  background(255);
  
  if (!suryaIsConnected) {
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(0);
    text('Please connect to Muse2', width/2, height/2);
    return;
  }
  
  if (!suryaIsRecording && !readyToSave) {
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(0);
    text('Press "Start Recording" to begin', width/2, height/2);
    return;
  }
  
  // UPDATE CYCLE
  if (suryaIsRecording) {
    let currentTime = millis();
    if (currentTime - lastUpdateTime >= 1000) {  // Update every second
      suryaTimeElapsed++;
      lastUpdateTime = currentTime;
      updateMuseValueHistory(); // Update the history once per second
    }
  }

  // DRAW THINGS
  drawDottedOval();
  drawSegmentMarkers();
  displayEEGData();
  drawLegend();
  //drawDebugInfo();  // Add debug information
  
  if (suryaTimeElapsed >= suryaTotalTime && suryaIsRecording) {
    suryaIsRecording = false;
    readyToSave = true;
    suryaStartButton.html('Save and Reset');
  }
  
  if (readyToSave) {
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(0);
    //text('Recording complete. Click "Save and Reset" to save and start a new recording.', width/2, height - 50);
    text('*', width/2, height - 50);
  }
}

function drawDottedOval() {
  noFill();
  stroke(0);
  strokeWeight(2);
  let totalPoints = 100;
  for (let i = 0; i < totalPoints; i++) {
    let angle = map(i, 0, totalPoints, 0, TWO_PI);
    let x = ovalCenterX + cos(angle) * ovalWidth / 2;
    let y = ovalCenterY + sin(angle) * ovalHeight / 2;
    point(x, y);
  }
}

function drawSegmentMarkers() {
  stroke(0);
  strokeWeight(2);
  for (let i = 0; i < segments; i++) {
    let angle = map(i, 0, segments, -PI/2, PI*1.5);
    let x1 = ovalCenterX + cos(angle) * (ovalWidth/2 - 10);
    let y1 = ovalCenterY + sin(angle) * (ovalHeight/2 - 10);
    let x2 = ovalCenterX + cos(angle) * (ovalWidth/2 + 10);
    let y2 = ovalCenterY + sin(angle) * (ovalHeight/2 + 10);
    line(x1, y1, x2, y2);
  }
}

function displayEEGData() {
  for (let i = 0; i < segments * subsections; i++) {
    if (i >= museValueHistory.length) break; // Only draw up to the current history length
    
    let angle = map(i, 0, segments * subsections, -PI/2, PI*1.5);
    let x = ovalCenterX + cos(angle) * (ovalWidth/2 + offsetFromOval);
    let y = ovalCenterY + sin(angle) * (ovalHeight/2 + offsetFromOval);

    let subsectionStates = [];
    for (let k = 0; k < symbolsPerSubsection; k++) {
      let index = i * symbolsPerSubsection + k;
      if (index < museValueHistory.length) {
        subsectionStates.push(museValueHistory[index]);
      }
    }
    
    drawShapesInSubsection(x, y, angle, subsectionStates);
  }
}

function drawShapesInSubsection(x, y, angle, states) {
  push();
  translate(x, y);
  rotate(angle + PI/2);

  let yOffset = 0;
  for (let i = 0; i < states.length; i++) {
    let state = states[i];
    let size = baseShapeSize * map(noise(x, y, i), 0, 1, 0.8, 1.2);  // Subtle size variation
    
    noFill();
    stroke(0);
    strokeWeight(1);
    
    switch (state.toLowerCase()) {
      case 'noise':
        drawNoisyLine(0, yOffset, size);
        break;
      case 'muscle':
        drawSquiggle(0, yOffset, size);
        break;
      case 'focus':
        drawSpiral(0, yOffset, size);
        break;
      case 'clear':
        drawDottedArc(0, yOffset, size);
        break;
      case 'meditate':
        drawFlower(0, yOffset, size);
        break;
    }
    yOffset += size * 1.2;  // Adjusted spacing between shapes
  }
  
  pop();
}

function drawNoisyLine(x, y, size) {
  beginShape();
  for (let i = 0; i < 5; i++) {
    let xOff = map(i, 0, 4, -size/2, size/2);
    let yOff = random(-2, 2);
    vertex(x + xOff, y + yOff);
  }
  endShape();
}

function drawSquiggle(x, y, size) {
  beginShape();
  for (let i = 0; i < 10; i++) {
    let xOff = map(i, 0, 9, -size/2, size/2);
    let yOff = sin(i * 0.8) * 3;
    vertex(x + xOff, y + yOff);
  }
  endShape();
}

function drawSpiral(x, y, size) {
  beginShape();
  for (let i = 0; i < 20; i++) {
    let angle = map(i, 0, 19, 0, TWO_PI);
    let radius = map(i, 0, 19, 0, size/2);
    let xOff = cos(angle) * radius;
    let yOff = sin(angle) * radius;
    vertex(x + xOff, y + yOff);
  }
  endShape();
}

function drawDottedArc(x, y, size) {
  for (let i = 0; i < 10; i++) {
    let angle = map(i, 0, 9, 0, PI);
    let xOff = cos(angle) * size/2;
    let yOff = sin(angle) * size/2;
    point(x + xOff, y + yOff);
  }
}

function drawFlower(x, y, size) {
  for (let i = 0; i < 5; i++) {
    let angle = map(i, 0, 5, 0, TWO_PI);
    let xOff = cos(angle) * size/3;
    let yOff = sin(angle) * size/3;
    arc(x + xOff, y + yOff, size/4, size/4, angle, angle + PI);
  }
}

function drawLegend() {
  let legendX = 50;
  let legendY = height - 150;
  let spacing = 25;

  textAlign(LEFT, CENTER);
  textSize(12);
  fill(0);
  noStroke();

  text("Legend:", legendX, legendY);
  legendY += 20;

  for (let i = 0; i < suryaStatenames.length; i++) {
    push();
    translate(legendX, legendY + i * spacing);
    drawShapesInSubsection(0, 0, 0, [suryaStatenames[i]]);
    pop();
    text(suryaStatenames[i], legendX + 40, legendY + i * spacing);
  }
}

function drawDebugInfo() {
  let debugX = 10;
  let debugY = height - 200;
  let lineHeight = 15;

  textAlign(LEFT, TOP);
  textSize(12);
  fill(0);
  noStroke();

  text("Debug Info:", debugX, debugY);
  debugY += lineHeight;

  for (let state in suryaState) {
    text(`${state}: ${suryaState[state].toFixed(4)}`, debugX, debugY);
    debugY += lineHeight;
  }
}

function suryaGetDominantState() {
  let maxValue = 0.1;  // Set a minimum threshold
  let dominantState = 'Noise';
  
  // Use reduce to find the key-value pair with the highest value
  let maxEntry = Object.entries(state).reduce((max, current) => {
    return current[1] > max[1] ? current : max;
  });
  
  dominantState = maxEntry[0];
  
  return dominantState;
}

function suryaStartRecording() {
  if (suryaIsConnected && !suryaIsRecording && !readyToSave) {
    suryaIsRecording = true;
    suryaStartButton.html('Stop Recording');
    suryaTimeElapsed = 0;
    lastUpdateTime = millis();
    museValueHistory = []; // Clear previous history
  } else if (suryaIsConnected && suryaIsRecording) {
    suryaIsRecording = false;
    suryaStartButton.html('Start Recording');
  } else if (readyToSave) {
    saveCanvas('eeg_visualization', 'png');
    readyToSave = false;
    suryaStartButton.html('Start Recording');
    background(255); // Clear the canvas
  } else {
    console.log('Please connect to Muse2 first');
  }
}

function updateMuseValueHistory() {
  let dominantState = suryaGetDominantState();
  museValueHistory.push(dominantState);
  
  // Keep the history array at a manageable size
  if (museValueHistory.length > maxHistoryLength) {
    museValueHistory.shift(); // Remove the oldest value
  }
}

function connectToMuse() {
  if (!suryaIsConnected) {
    bluetoothConnection.connect(connectionOptions, museConnected);
  }
}

function museConnected(error, characteristics) {
  if (error) {
    console.log('Error connecting to Muse:', error);
  } else {
    suryaIsConnected = true;
    suryaConnectButton.attribute('disabled', '');
    suryaStartButton.removeAttribute('disabled');
    console.log('Connected to Muse2');

    let museIsReady = initMuseStreaming(characteristics);
    if (museIsReady) {
      startMuse();
    }

    bluetoothConnection.onDisconnected(onDisconnected);
  }
}

function onDisconnected() {
  console.log('Muse Disconnected');
  suryaIsConnected = false;
  suryaIsRecording = false;
  suryaConnectButton.removeAttribute('disabled');
  suryaStartButton.attribute('disabled', '');
}
