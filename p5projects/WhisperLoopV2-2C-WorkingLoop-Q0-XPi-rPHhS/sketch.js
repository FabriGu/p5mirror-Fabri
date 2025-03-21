const replicateProxy = "https://replicate-api-proxy.glitch.me";
let img;
let feedback;
let mediaRecorder;
let mediaStream;
let currentQuestionIndex = 0;
let questionResponses = [];
let isProcessing = false;

// Questions array
const questions = [
  "Do you often feel misunderstood by the people closest to you?",
  "Have you ever regretted words left unspoken?",
  "Do you believe that pain is necessary for growth?",
  "Have you ever felt completely at peace, even if just for a moment?",
  "Do you carry guilt over something you cannot change?",
  "Have you ever been afraid to show someone your true self?",
  "Do you believe you are worthy of unconditional love?",
  "Have you ever let go of something important to you, knowing it was for the best?",
  "Do you sometimes feel weighed down by memories of the past?",
  "Have you ever longed for a version of yourself that no longer exists?"
];

// Initialize response array for each question
for (let i = 0; i < questions.length; i++) {
  questionResponses[i] = [];
}

function setup() {
  createElement("br");
  
  // Create container for centering content
  const container = createDiv();
  container.style('display', 'flex');
  container.style('flex-direction', 'column');
  container.style('align-items', 'center');
  container.style('justify-content', 'center');
  container.style('min-height', '100vh');
  container.style('padding', '20px');
  container.style('text-align', 'center');
  
  // Create question display
  const questionDiv = createDiv();
  questionDiv.id('questionDisplay');
  questionDiv.style('font-size', '24px');
  questionDiv.style('margin-bottom', '40px');
  questionDiv.style('max-width', '600px');
  questionDiv.style('line-height', '1.5');
  questionDiv.parent(container);
  
  // Create feedback display
  feedback = createP("Status: Ready to record");
  feedback.style('margin', '20px 0');
  feedback.parent(container);
  
  // Create button container
  const buttonContainer = createDiv();
  buttonContainer.style('display', 'flex');
  buttonContainer.style('gap', '10px');
  buttonContainer.style('margin-bottom', '20px');
  buttonContainer.parent(container);
  
  // Create recording controls
  const startButton = createButton("Start Recording");
  startButton.parent(buttonContainer);
  startButton.class('button');
  
  const stopButton = createButton("Stop Recording");
  stopButton.parent(buttonContainer);
  stopButton.class('button');
  
  // Create navigation buttons
  const navContainer = createDiv();
  navContainer.style('display', 'flex');
  navContainer.style('gap', '10px');
  navContainer.parent(container);
  
  const prevButton = createButton("Previous Question");
  prevButton.parent(navContainer);
  prevButton.class('button');
  
  const nextButton = createButton("Next Question");
  nextButton.parent(navContainer);
  nextButton.class('button');
  
  // Style all buttons
  const allButtons = selectAll('.button');
  allButtons.forEach(button => {
    button.style('padding', '12px 24px');
    button.style('font-size', '16px');
    button.style('border', 'none');
    button.style('border-radius', '5px');
    button.style('cursor', 'pointer');
    button.style('background-color', '#4CAF50');
    button.style('color', 'white');
    button.style('transition', 'background-color 0.3s');
  });
  
  // Add hover effect
  allButtons.forEach(button => {
    button.mouseOver(() => button.style('background-color', '#45a049'));
    button.mouseOut(() => button.style('background-color', '#4CAF50'));
  });
  
  // Initialize with first question
  updateQuestionDisplay();
  
  // Button event handlers
  startButton.mousePressed(async () => {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let currentChunks = [];
      
      mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm'
      });

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          currentChunks.push(event.data);
        }
      });

      mediaRecorder.addEventListener("stop", async () => {
        if (currentChunks.length > 0) {
          const chunk = new Blob(currentChunks, { type: "audio/webm" });
          await processAudioChunk(chunk);
          currentChunks = [];
        }
      });

      mediaRecorder.start();
      isProcessing = true;
      
      const recordingInterval = setInterval(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          if (isProcessing) {
            mediaRecorder.start();
          } else {
            clearInterval(recordingInterval);
          }
        }
      }, 4000);
      
      startButton.attribute('disabled', '');
      stopButton.removeAttribute('disabled');
      feedback.html("Recording in progress...");
    } catch (error) {
      console.error("Error starting recording:", error);
      feedback.html("Error starting recording: " + error.message);
    }
  });

  stopButton.mousePressed(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      isProcessing = false;
      mediaRecorder.stop();
      mediaStream.getTracks().forEach(track => track.stop());
      startButton.removeAttribute('disabled');
      stopButton.attribute('disabled', '');
      feedback.html("Recording stopped");
    }
  });

  prevButton.mousePressed(() => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      updateQuestionDisplay();
      if (mediaRecorder && mediaRecorder.state === "recording") {
        stopButton.elt.click();
      }
    }
  });

  nextButton.mousePressed(() => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      updateQuestionDisplay();
      if (mediaRecorder && mediaRecorder.state === "recording") {
        stopButton.elt.click();
      }
    }
  });

  stopButton.attribute('disabled', '');
}

function updateQuestionDisplay() {
  const questionDiv = select('#questionDisplay');
  questionDiv.html(`Question ${currentQuestionIndex + 1}/${questions.length}<br><br>${questions[currentQuestionIndex]}`);
  
  // Update feedback to show current response
  const currentResponses = questionResponses[currentQuestionIndex];
  if (currentResponses.length > 0) {
    feedback.html(`Previous response: ${currentResponses.join(" ")}`);
  } else {
    feedback.html("Status: Ready to record");
  }
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
        // Store response in the array for the current question
        questionResponses[currentQuestionIndex].push(transcribedText);
        // Update feedback to show current response
        feedback.html(`Response: ${questionResponses[currentQuestionIndex].join(" ")}`);
      }
    }
  } catch (error) {
    console.error("Error processing audio chunk:", error);
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