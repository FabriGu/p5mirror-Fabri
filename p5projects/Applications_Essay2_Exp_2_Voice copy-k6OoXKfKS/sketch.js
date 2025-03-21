// Simulation Parameters
const SIMULATION_DURATION = 180;   // Duration in seconds
const INITIAL_HEART_RATE = 127;   // Starting heart rate
const SAMPLE_RATE = 2;            // Samples per second (reduced for less frequent updates)
const BASE_NOISE_FACTOR = 2;      // Base amount of random variation

// Pattern Parameters
const DECLINE_RATE = 0.3;         // How quickly heart rate drops in decline phase
const SPIKE_MAGNITUDE = 180;      // Maximum heart rate during spike
const RESTING_HEART_RATE = 85;    // Final resting heart rate

// Anomaly Parameters
const ANOMALY_CHANCE = 0.02;      // Probability of anomaly per second
const ARTIFACT_CHANCE = 0.01;     // Probability of measurement artifact
const MAX_ANOMALY_DURATION = 5;   // Maximum duration of an anomaly in seconds
const ANOMALY_MAGNITUDE = 30;     // How much anomalies can affect heart rate
const ARTIFACT_MAGNITUDE = 80;    // How extreme measurement artifacts can be

// UI Elements
let startRecordBtn;
let downloadBtn;
let isRecording = false;
let recordedData = [];
let currentTime = 0;
let currentRate = INITIAL_HEART_RATE;

// Anomaly tracking
let activeAnomalies = [];
let lastAnomalyTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('Arial');
  
  startRecordBtn = createButton("Begin Recording");
  startRecordBtn.position(windowWidth/2 - 50, windowHeight/2);
  startRecordBtn.mousePressed(startRecording);
  
  downloadBtn = createButton("Download CSV");
  downloadBtn.position(windowWidth/2 - 50, windowHeight/2 + 40);
  downloadBtn.mousePressed(downloadCSV);
  downloadBtn.hide();
  frameRate(5);
}

function draw() {
  background(0);  // Black background
  
  if (isRecording) {
    // Generate simulated heart rate data
    currentRate = generateHeartRate(currentTime);
    
    recordedData.push({
      timestamp: new Date().toISOString(),
      relativeTime: currentTime.toFixed(3),
      heartRate: currentRate
    });
    
    // Display heart rate in large font
    textSize(200);
    fill(255);  // White text
    text(currentRate, width/2, height/2);
    
    currentTime += 1/SAMPLE_RATE;
    
    if (currentTime >= SIMULATION_DURATION) {
      stopRecording();
    }
  }
}

function keyPressed() {
  if (key === 'w' || key === 'W') {
    if (isRecording) {
      stopRecording();
    }
  }
}

function generateHeartRate(time) {
  let heartRate = getBaseHeartRate(time);
  
  updateAnomalies(time);
  heartRate += calculateAnomalyEffect(time);
  
  if (random() < ARTIFACT_CHANCE) {
    heartRate += random(-ARTIFACT_MAGNITUDE, ARTIFACT_MAGNITUDE);
  }
  
  const dynamicNoise = BASE_NOISE_FACTOR * (1 + sin(time * 0.1));
  heartRate += random(-dynamicNoise, dynamicNoise);
  
  return Math.round(constrain(heartRate, 40, 200));
}

function getBaseHeartRate(time) {
  let baseRate = INITIAL_HEART_RATE;
  
  if (time < 30) {
    baseRate = INITIAL_HEART_RATE + sin(time * 0.2) * 3;
  } else if (time < 60) {
    baseRate = INITIAL_HEART_RATE - (time - 30) * DECLINE_RATE;
  } else if (time < 90) {
    baseRate = time >= 74 && time <= 76 ? SPIKE_MAGNITUDE : 110;
  } else if (time < 120) {
    baseRate = 100 - (time - 90) * 0.2;
  } else if (time < 150) {
    baseRate = 90 + sin(time * 0.2) * 2;
  } else {
    baseRate = RESTING_HEART_RATE;
  }
  
  return baseRate;
}

function updateAnomalies(time) {
  activeAnomalies = activeAnomalies.filter(a => time < a.endTime);
  
  if (random() < ANOMALY_CHANCE && time - lastAnomalyTime > 3) {
    const duration = random(2, MAX_ANOMALY_DURATION);
    const magnitude = random(-ANOMALY_MAGNITUDE, ANOMALY_MAGNITUDE);
    const type = random() < 0.5 ? 'sudden' : 'gradual';
    
    activeAnomalies.push({
      startTime: time,
      endTime: time + duration,
      magnitude: magnitude,
      type: type,
      frequency: random(0.3, 1.0)
    });
    
    lastAnomalyTime = time;
  }
}

function calculateAnomalyEffect(time) {
  let totalEffect = 0;
  
  for (let anomaly of activeAnomalies) {
    const progress = (time - anomaly.startTime) / (anomaly.endTime - anomaly.startTime);
    
    if (anomaly.type === 'sudden') {
      totalEffect += anomaly.magnitude;
    } else {
      totalEffect += anomaly.magnitude * sin(progress * PI + time * anomaly.frequency);
    }
  }
  
  return totalEffect;
}

function startRecording() {
  isRecording = true;
  recordedData = [];
  currentTime = 0;
  activeAnomalies = [];
  lastAnomalyTime = 0;
  startRecordBtn.hide();
  downloadBtn.hide();
}

function stopRecording() {
  isRecording = false;
  downloadBtn.show();
}

function downloadCSV() {
  if (recordedData.length === 0) {
    console.log("No data to download");
    return;
  }
  
  let csvContent = "Timestamp,RelativeTime(s),HeartRate\n";
  recordedData.forEach(row => {
    csvContent += `${row.timestamp},${row.relativeTime},${row.heartRate}\n`;
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "heart_rate_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (!isRecording) {
    startRecordBtn.position(windowWidth/2 - 50, windowHeight/2);
    downloadBtn.position(windowWidth/2 - 50, windowHeight/2 + 40);
  }
}