let recorder;
let isRecording = false;

function setup() {
  createCanvas(1080, 1080, WEBGL);
  colorMode(HSB, 360, 100, 100, 0.5);
  baseHue = random(360);
  
  // Setup recorder
  recorder = new CCapture({
    format: 'webm',
    framerate: 60,
    name: 'fibonacci-loop',
    quality: 100,
    verbose: true
  });
}

function keyPressed() {
  if (key === 'r') {
    if (!isRecording) {
      isRecording = true;
      recorder.start();
      console.log('Started recording');
    }
  } else if (key === 's') {
    if (isRecording) {
      isRecording = false;
      recorder.stop();
      recorder.save();
      console.log('Saved recording');
    }
  }
}

function draw() {
  // Your existing draw code here
  
  if (isRecording) {
    recorder.capture(canvas);
    
    // Stop after one full loop
    if (millis() > 22000) {
      isRecording = false;
      recorder.stop();
      recorder.save();
      console.log('Recording complete');
    }
  }
}