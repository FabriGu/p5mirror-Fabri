let mic, recorder;
let state = 0; // 0: idle, 1: recording, 2: continuous transcription
let transcriber;
let button;
let fullTranscript = ""; // Store the cumulative transcript
let statusMessage = "Loading model...";
let isTranscribing = false;

// Audio buffer system
let audioChunks = []; // Array to store audio chunks waiting to be processed
let chunkDuration = 2; // Duration of each audio chunk in seconds
let currentRecording = null; // Current recording sound file
let nextChunkTimeout = null;
let chunkCount = 0;

async function setup() {
  createCanvas(600, 600);
  textSize(16);
  textWrap(WORD);
  textAlign(CENTER, CENTER);
  
  // Load ASR pipeline
  const { pipeline } = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.0");
  // transcriber = await pipeline(
  //   "automatic-speech-recognition",
  //   "onnx-community/whisper-tiny.en",
  //   { device: "webgpu" },
  // );
  transcriber = await pipeline(
    "automatic-speech-recognition",
    "onnx-community/whisper-tiny.en",
    { device: "webgpu" },
  ).then(() => {whisperLoaded = true; console.log("whisperModelLoaded?: ", whisperLoaded); console.log(transcriber);});
  
  console.log(transcriber)
  
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
    
    // Display buffer status
    fill(0);
    text(`Buffer: ${audioChunks.length} chunks waiting`, width - 100, 50);
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
  audioChunks = [];
  chunkCount = 0;
  
  // Start the first recording
  recordNextChunk();
  
  // Start the transcription processor
  processNextChunk();
}

function stopContinuousTranscription() {
  state = 0;
  statusMessage = "Continuous transcription stopped.";
  button.html("Start Continuous Transcription");
  
  // Stop any current recording
  if (recorder && recorder.recording) {
    recorder.stop();
  }
  
  // Clear any pending timeouts
  if (nextChunkTimeout) {
    clearTimeout(nextChunkTimeout);
    nextChunkTimeout = null;
  }
  
  // Clear buffer
  audioChunks = [];
  isTranscribing = false;
}

function recordNextChunk() {
  if (state !== 2) return;
  
  // Create a new sound file for this chunk
  currentRecording = new p5.SoundFile();
  chunkCount++;
  
  // Record a chunk
  recorder.record(currentRecording, chunkDuration, () => {
    // When recording is complete, add to the buffer
    if (state === 2) { // Check if we're still in continuous mode
      audioChunks.push({
        soundFile: currentRecording,
        id: chunkCount
      });
      
      // Schedule the next recording immediately
      nextChunkTimeout = setTimeout(recordNextChunk, 100);
    }
  });
}

async function processNextChunk() {
  if (state !== 2) return;
  console.log("processing next chunk")
  
  // If there's a chunk to process and we're not already transcribing
  if (audioChunks.length > 0 && !isTranscribing) {
    isTranscribing = true;
    
    const chunk = audioChunks.shift(); // Get the oldest chunk
    statusMessage = `Processing chunk ${chunk.id}... (${audioChunks.length} in buffer)`;
    
    try {
      const waveform = chunk.soundFile.buffer.getChannelData(0);
      
      // Skip processing if the waveform is too quiet (silence detection)
      const energy = calculateEnergy(waveform);
      if (energy < 0.001) {
        console.log(`Skipping quiet audio chunk ${chunk.id}`, energy);
      } else {
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
      }
      
      // Release memory
      chunk.soundFile = null;
      
      statusMessage = `Listening... (Buffer: ${audioChunks.length} chunks)`;
    } catch (error) {
      console.error("Transcription error:", error);
      statusMessage = "Error transcribing: " + error.message;
    } finally {
      isTranscribing = false;
      
      // Process the next chunk if available
      if (audioChunks.length > 0) {
        processNextChunk();
      } else {
        // If no chunks, check again shortly
        setTimeout(processNextChunk, 100);
      }
    }
  } else {
    // If no chunks or already transcribing, check again shortly
    setTimeout(processNextChunk, 100);
  }
}

// Calculate energy level of an audio buffer to detect silence
function calculateEnergy(buffer) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return sum / buffer.length;
}

// Handle cleanup
function windowClosed() {
  stopContinuousTranscription();
}