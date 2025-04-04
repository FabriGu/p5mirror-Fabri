let mic, recorder, soundFile;
let state = 0; // 0: idle, 1: recording, 2: continuous transcription
let transcriber;
let button;
let transcript = "";
let fullTranscript = ""; // Store the cumulative transcript
let statusMessage = "Loading model...";
let recordingInterval;
let recordingStartTime;
let transcriptionCount = 0;
let processingTranscription = false;

async function setup() {
  createCanvas(600, 600);
  textSize(16);
  textWrap(WORD);
  textAlign(CENTER, CENTER);
  
  // Load ASR pipeline
  const { pipeline } = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.0");
  transcriber = await pipeline(
    "automatic-speech-recognition",
    "onnx-community/whisper-tiny.en",
    { device: "webgpu" },
  );
  
  // Set up mic and recorder
  mic = new p5.AudioIn();
  mic.start();
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);
  
  // Create a button
  button = createButton("Start Continuous Transcription");
  button.style("font-size", "16px");
  // Center the button horizontally
  button.position(width / 2 - 110, height - 50);
  button.mousePressed(toggleContinuousTranscription);
  
  statusMessage = "Ready. Press the button to start continuous transcription.";
}

function draw() {
  background(240);
  
  // Draw status text at the top, centered and wrapped
  fill(0);
  text(statusMessage, 20, 30, width - 40);
  
  // Draw a box for the transcript
  fill(255);
  stroke(200);
  rect(20, 60, width - 40, height - 120, 10);
  
  // Display transcript text, centered and wrapped
  noStroke();
  fill(0);
  text(fullTranscript, 30, 70, width - 60, height - 140);
  
  // Draw recording indicator if in continuous mode
  if (state === 2) {
    fill(255, 0, 0);
    ellipse(width - 30, 30, 10, 10);
  }
}

function toggleContinuousTranscription() {
  if (state === 0) {
    // Start continuous transcription
    startContinuousTranscription();
  } else if (state === 2) {
    // Stop continuous transcription
    stopContinuousTranscription();
  }
}

function startContinuousTranscription() {
  if (!mic.enabled) {
    statusMessage = "Microphone not enabled!";
    return;
  }
  
  state = 2;
  statusMessage = "Continuous transcription active. Press button to stop.";
  button.html("Stop Transcription");
  fullTranscript = "";
  transcriptionCount = 0;
  recordingStartTime = millis();
  
  // Schedule the first transcription
  recordAndTranscribeChunk();
}

function stopContinuousTranscription() {
  state = 0;
  statusMessage = "Continuous transcription stopped.";
  button.html("Start Continuous Transcription");
  
  if (recorder && recorder.recording) {
    recorder.stop();
  }
  
  // Clear any pending recording intervals
  if (recordingInterval) {
    clearTimeout(recordingInterval);
    recordingInterval = null;
  }
}

function recordAndTranscribeChunk() {
  if (state !== 2) return;
  
  // If we're already processing a transcription, schedule the next one
  if (processingTranscription) {
    recordingInterval = setTimeout(recordAndTranscribeChunk, 1000);
    return;
  }
  
  processingTranscription = true;
  transcriptionCount++;
  
  // Create a new sound file for this chunk
  soundFile = new p5.SoundFile();
  
  // Record a 3-second segment
  recorder.record(soundFile, 3, async () => {
    try {
      statusMessage = "Processing chunk " + transcriptionCount + "...";
      
      // Give a little time for the recording to finalize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const waveform = soundFile.buffer.getChannelData(0);
      
      // Skip processing if the waveform is too quiet (silence detection)
      const energy = calculateEnergy(waveform);
      if (energy < 0.001) {
        console.log("Skipping quiet audio chunk", energy);
        processingTranscription = false;
        recordingInterval = setTimeout(recordAndTranscribeChunk, 500); // Try again sooner for silence
        return;
      }
      
      // Process the audio
      const result = await transcriber(waveform);
      
      if (result && result.text.trim() !== "") {
        // Append new text to cumulative transcript
        if (fullTranscript.length > 0) {
          fullTranscript += " " + result.text.trim();
        } else {
          fullTranscript = result.text.trim();
        }
      }
      
      statusMessage = "Listening... (Processed " + transcriptionCount + " chunks)";
    } catch (error) {
      console.error("Transcription error:", error);
      statusMessage = "Error transcribing: " + error.message;
    } finally {
      processingTranscription = false;
      
      // Schedule the next recording if still in continuous mode
      if (state === 2) {
        recordingInterval = setTimeout(recordAndTranscribeChunk, 500);
      }
    }
  });
}

// Calculate energy level of an audio buffer to detect silence
function calculateEnergy(buffer) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return sum / buffer.length;
}

// Clean up when we close or change pages
function windowClosed() {
  stopContinuousTranscription();
}