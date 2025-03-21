const replicateProxy = "https://replicate-api-proxy.glitch.me";
let img;
let feedback;
let transcriptionArray = [];
let isProcessing = false;
let processingInterval;
let audioChunks = [];
let transcriptionDiv;

function setup() {
  createElement("br");
  transcriptionDiv = createDiv();
  transcriptionDiv.position(10, 150);
  transcriptionDiv.style('width', '80%');
  transcriptionDiv.style('min-height', '200px');
  transcriptionDiv.style('padding', '10px');
  transcriptionDiv.style('border', '1px solid black');
  transcriptionDiv.style('background-color', '#f0f0f0');
  
  feedback = createP("Status: Ready to record");
  feedback.position(10, 90);
  
  let canvas = createCanvas(512, 512);
  canvas.position(0, 400);
  setupAudio();
}

function draw() {
  if (img) image(img, 0, 0);
}

async function processAudioChunk(chunk) {
  try {
    const b64Audio = await convertBlobToBase64(chunk);
    console.log("Processing new chunk");
    
    let data = {
      fieldToConvertBase64ToURL: "audio",
      fileFormat: "wav",
      version: "3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
      input: {
        task: "transcribe",
        audio: b64Audio,
        language: "None",
        timestamp: "chunk",
        batch_size: 64,
        diarise_audio: false
      }
    };

    const url = replicateProxy + "/create_n_get/";
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(url, options);
    const jsonResponse = await response.json();
    
    if (jsonResponse.output && jsonResponse.output.text) {
      const transcribedText = jsonResponse.output.text.trim();
      if (transcribedText) {
        console.log("New transcribed text:", transcribedText);
        transcriptionArray.push(transcribedText);
        updateTranscriptionDisplay();
      }
    }
  } catch (error) {
    console.error("Error processing audio chunk:", error);
  }
}

function updateTranscriptionDisplay() {
  const transcriptionText = transcriptionArray.join(" ");
  console.log("Updating display with new text");
  transcriptionDiv.html(`<strong>Transcription:</strong><br>${transcriptionText}`);
}

async function startProcessingLoop() {
  if (isProcessing) {
    console.log("Processing loop already running");
    return;
  }
  
  console.log("Starting processing loop");
  isProcessing = true;
  
  processingInterval = setInterval(async () => {
    if (audioChunks.length > 0) {
      console.log("Processing chunk from queue");
      const chunk = new Blob(audioChunks, { type: "audio/webm" });
      // audioChunks = []; // Clear processed chunks
      // audioChunks = audioChunks.slice(1)
      console.log(audioChunks)
      await processAudioChunk(chunk);
    }
  }, 3000); // Process every 2 seconds
}

async function stopProcessingLoop() {
  console.log("Stopping processing loop");
  isProcessing = false;
  clearInterval(processingInterval);
  
  if (audioChunks.length > 0) {
    const finalChunk = new Blob(audioChunks, { type: "audio/webm" });
    await processAudioChunk(finalChunk);
    audioChunks = [];
  }
}

async function convertBlobToBase64(audioBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsDataURL(audioBlob);
  });
}

function setupAudio() {
  const audioContext = new AudioContext();
  let mediaStream;
  let mediaRecorder;

  const buttonContainer = createDiv();
  buttonContainer.style('position', 'absolute');
  buttonContainer.style('top', '50px');
  buttonContainer.style('left', '10px');

  const startButton = createButton("Start Recording");
  startButton.parent(buttonContainer);
  startButton.style('margin-right', '10px');
  startButton.style('padding', '8px 16px');
  
  const stopButton = createButton("Stop Recording");
  stopButton.parent(buttonContainer);
  stopButton.style('margin-right', '10px');
  stopButton.style('padding', '8px 16px');
  
  const clearButton = createButton("Clear Transcription");
  clearButton.parent(buttonContainer);
  clearButton.style('padding', '8px 16px');

  clearButton.mousePressed(() => {
    transcriptionArray = [];
    updateTranscriptionDisplay();
  });

  startButton.mousePressed(async () => {
    try {
      transcriptionArray = [];
      updateTranscriptionDisplay();
      
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm'
      });

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });

      mediaRecorder.start(1000);
      startProcessingLoop();
      
      startButton.attribute('disabled', '');
      stopButton.removeAttribute('disabled');
      feedback.html("Recording in progress...");
    } catch (error) {
      console.error("Error starting recording:", error);
      feedback.html("Error starting recording: " + error.message);
    }
  });

  stopButton.mousePressed(async () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      await stopProcessingLoop();
      mediaStream.getTracks().forEach(track => track.stop());
      startButton.removeAttribute('disabled');
      stopButton.attribute('disabled', '');
      feedback.html("Recording stopped");
    }
  });

  stopButton.attribute('disabled', '');
}