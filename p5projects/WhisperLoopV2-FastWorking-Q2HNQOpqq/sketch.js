const replicateProxy = "https://replicate-api-proxy.glitch.me";
let img;
let feedback;

function setup() {
  createElement("br");
  feedback = createP("");
  createElement("br");
  feedback.position(10, 90);
  let canvas = createCanvas(512, 512);
  canvas.position(0, 120);
  setupAudio();
}

function draw() {
  if (img) image(img, 0, 0);
}

async function askWithAudio(audio) {
  try {
    document.body.style.cursor = "progress";
    const b64Audio = await convertBlobToBase64(audio);
    feedback.html("Waiting for reply from Replicate Audio...");
    
    // Create the data object with the base64 audio
    let data = {
      fieldToConvertBase64ToURL: "audio",
      fileFormat: "wav",
      version: "3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
      input: {
        task: "transcribe",
        audio: b64Audio,  // Use the base64 encoded audio here
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
    const openAI_json = await response.json();
    console.log(openAI_json)
    console.log("audio_response", openAI_json.output.text);
    feedback.html(openAI_json.output.text);
  } catch (error) {
    console.error("Error processing audio:", error);
    feedback.html("Error processing audio: " + error.message);
  } finally {
    document.body.style.cursor = "auto";
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

  // Create and set up buttons
  const startButton = document.createElement("button");
  startButton.id = "start-recording";
  startButton.textContent = "Start Recording";
  startButton.style.position = "absolute";
  startButton.style.top = "50px";
  startButton.style.left = "10px";
  document.body.appendChild(startButton);

  const stopButton = document.createElement("button");
  stopButton.style.position = "absolute";
  stopButton.style.top = "50px";
  stopButton.style.left = "160px";
  stopButton.id = "stop-recording";
  stopButton.textContent = "Stop Recording";
  document.body.appendChild(stopButton);

  // Set up audio recording handlers
  startButton.addEventListener("click", async function () {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mrChunks = [];
      
      // Configure MediaRecorder to record in WAV format
      mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm'  // Browser records in WebM, we'll convert it later
      });

      mediaRecorder.addEventListener("dataavailable", (event) => {
        mrChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", async (event) => {
        const recordedData = new Blob(mrChunks, { type: "audio/webm" });
        console.log("Recording stopped", recordedData);

        // Create audio preview
        let av = document.createElement("AUDIO"); // Changed to AUDIO element
        var audioURL = window.URL.createObjectURL(recordedData);
        av.src = audioURL;
        av.controls = true; // Add controls to the audio element
        document.body.appendChild(av);

        // Process the audio
        await askWithAudio(recordedData);
      });

      mediaRecorder.start();
      console.log("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      feedback.html("Error starting recording: " + error.message);
    }
  });

  stopButton.addEventListener("click", function () {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      mediaStream.getTracks().forEach(track => track.stop());
    }
  });
}