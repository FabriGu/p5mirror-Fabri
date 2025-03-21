const replicateProxy = "https://replicate-api-proxy.glitch.me";
let mediaRecorder;
let mediaStream;
let currentQuestionIndex = 0;
let questionResponses = [];
let allResponses = "";
let isRecording = false;
let countdownInterval;
let transitionTimeout;

// chatGPT
let feedback;

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

// find main p5 dom element to use as container
// const container = document.querySelector("main");
// console.log(container.style.display)

// Serial 
const askForPort = true; //true first time to pick port, then change to false
const serial = new p5.WebSerial();
let portButton;
let inData; 
let outData; 

let MagnetOnBtn;
let MagnetOffBtn

let printBtn;

let avgBeats = [];
let R = false;

// // Initialize avgBeat array for each question
// for (let i = 0; i < questions.length; i++) {
//   avgBeats[i] = [];
// }

function setup() {
  createElement("br");
  
  // Create container for centering content
  // const container = createDiv();
  // const container = 
  const container = select("main")
  console.log(container)
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
  
  // Create timer display
  const timerDiv = createDiv();
  timerDiv.id('timerDisplay');
  timerDiv.style('font-size', '36px');
  timerDiv.style('margin', '20px 0');
  timerDiv.style('font-weight', 'bold');
  timerDiv.parent(container);
  
  // Create status display
  const statusDiv = createDiv();
  statusDiv.id('statusDisplay');
  statusDiv.style('font-size', '20px');
  statusDiv.style('margin', '20px 0');
  statusDiv.style('color', '#666');
  statusDiv.parent(container);
  
  // Create start button
  const startButton = createButton("Start Questionnaire");
  startButton.class('button');
  startButton.style('padding', '15px 30px');
  startButton.style('font-size', '20px');
  startButton.style('background-color', '#4CAF50');
  startButton.style('color', 'white');
  startButton.style('border', 'none');
  startButton.style('border-radius', '5px');
  startButton.style('cursor', 'pointer');
  startButton.parent(container);
  
  startButton.mouseOver(() => startButton.style('background-color', '#45a049'));
  startButton.mouseOut(() => startButton.style('background-color', '#4CAF50'));
  
  // Hide question and timer initially
  select('#questionDisplay').style('display', 'none');
  select('#timerDisplay').style('display', 'none');
  
  startButton.mousePressed(startQuestionnaire);
  
  
  // chat gpt
   feedback = createP("");
  
  // Serial
  createCanvas(windowWidth, windowHeight); // make the canvas
  if (!navigator.serial) {
    alert("WebSerial is not supported Try Chrome ");
  }
  //first time you connect create button to identify port
  if (askForPort ) {
     makePortButton();
  } else {
   serial.getPorts(); //skip the button use port from last time
  }
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);
  textSize(32);
  
  // create and position a ON button:
  MagnetOnBtn = createButton("Magnet On");
  MagnetOnBtn.position(100, 10);
  // give the port button a mousepressed handler:
  MagnetOnBtn.mousePressed(() =>serial.write('1'));
  
  // create and position a ON button:
  MagnetOffBtn = createButton("Magnet Off");
  MagnetOffBtn.position(100, 30);
  // give the port button a mousepressed handler:
  MagnetOffBtn.mousePressed(() =>serial.write('0'));
  
  // create and position a ON button:
  printBtn = createButton("Print");
  printBtn.position(100, 50);
  // give the port button a mousepressed handler:
  printBtn.mousePressed(() => {
//     serial.write('P')
//     // Generate QR code as a string
// // import QRCode from 'qrcode'; // Install qrcode library using npm or include in your project
//     const data = "https://surya.website/blog/using-brainwaves-for-creative-output"; // Data for QR code
//     QRCode.toString(data, { type: 'utf8' })
//   .then(qrString => sendQRCodeToArduino(qrString))
//   .catch(err => console.error(err));
//   });
    var QRId = "https://surya.website/blog/using-brainwaves-for-creative-output"
    var qrcode = new QRCode("qrcode", {
        text: QRId,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    // get the qr div, then find the canvas element inside it
    var canvas = document.getElementById('qrcode').querySelector('canvas');

    var dataURL = canvas.toDataURL();

    document.getElementById('result').innerHTML = dataURL;
    console.log(dataURL)
    
    // Strip the data URL prefix
    const base64Data = dataURL.split(',')[1];
    
    // Send the base64 encoded QR code data to Arduino
    sendQRCodeToArduino(base64Data);
  });
  
  // printBtn
}

function draw() {
  background(255);
  
  if (R == true) {
    serial.write('R');
    // avgBeats[currentQuestionIndex] = inData[1];
    avgBeats[currentQuestionIndex] = 50;
    R = false;
    console.log(avgBeats[currentQuestionIndex]);
  }
  
  if (inData) {
    let sensor1 = inData[0];
    let sensor2 = inData[1];
    let sensor3 = inData[2];

    text("Input " + sensor1 + ", " + sensor2 + ", " + sensor3, 100, 100);
  }
  
  
  //don't just stand there, put these variables to use in your code
}

async function startQuestionnaire() {
  // Hide start button
  select('.button').style('display', 'none');
  
  // Show question and timer
  select('#questionDisplay').style('display', 'block');
  select('#timerDisplay').style('display', 'block');
  
  // Start with first question
  showQuestion();
  
}

async function showQuestion() {
  
  if (currentQuestionIndex >= questions.length) {
    // setTimeout(endQuestionnaire, 5000);
    endQuestionnaire();
    return;
  }
  
  // Show transition message
  select('#questionDisplay').html("Generating next question...");
  select('#timerDisplay').html("");
  select('#statusDisplay').html("");
  
  // Wait 5 seconds before showing next question
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Display question
  select('#questionDisplay').html(`Question ${currentQuestionIndex + 1}/${questions.length}<br><br>${questions[currentQuestionIndex]}`);
  
  // continue
  // Serial.write('C');
  
  
  
  // Start recording
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });
    let audioChunks = [];
    
    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });
    
    mediaRecorder.addEventListener("stop", async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      await processAudioChunk(audioBlob);
      audioChunks = [];
    });
    
    mediaRecorder.start();
    isRecording = true;
    
    // Start 10 second countdown
    let timeLeft = 10;
    select('#timerDisplay').html(timeLeft);
    select('#statusDisplay').html("Recording your answer...");
    
    countdownInterval = setInterval(() => {
      timeLeft--;
      select('#timerDisplay').html(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        endRecordingAndContinue();
        // Serial.write('R');
        R = true;
        draw();
      }
    }, 1000);
    
  } catch (error) {
    console.error("Error starting recording:", error);
    select('#statusDisplay').html("Error: Could not access microphone");
  }
}

async function endRecordingAndContinue() {
  if (isRecording) {
    mediaRecorder.stop();
    mediaStream.getTracks().forEach(track => track.stop());
    isRecording = false;
  }
  
  select('#statusDisplay').html("Processing response...");
  
  currentQuestionIndex++;
  if (currentQuestionIndex >= questions.length) {
    setTimeout(endQuestionnaire, 5000);
    // endQuestionnaire();
    return;
  } else {
    // Show next question after a delay
    showQuestion();
  }
  // showQuestion();
 
}

function endQuestionnaire() {
  select('#questionDisplay').html("Thank you for sharing your thoughts.");
  select('#timerDisplay').style('display', 'none');
  select('#statusDisplay').html("Questionnaire complete");
  
  // Display all responses
  const responsesDiv = createDiv();
  responsesDiv.style('margin-top', '40px');
  responsesDiv.style('text-align', 'left');
  responsesDiv.style('max-width', '600px');
  responsesDiv.style('width', '100%');
  
  let responsesHtml = "<h2>Your Responses:</h2>";
  questions.forEach((question, index) => {
    responsesHtml += `${question}`;
    responsesHtml += `${questionResponses[index].join(" ") || "No response recorded"}`;
  });
  
  questions.forEach((question, index) => {
    allResponses += `${question}`;
    allResponses += `${questionResponses[index].join(" ") || "No response recorded"}`;
    allResponses += `, Avg heartbeat while question was asked: ${avgBeats[index]}.`;
  });
  
  askForWords(allResponses);
  console.log(allResponses);
  
  
  responsesDiv.html(responsesHtml);
}

async function processAudioChunk(chunk) {
  try {
    const b64Audio = await convertBlobToBase64(chunk);
    
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
        console.log(`Response for question ${currentQuestionIndex}:`, transcribedText);
        questionResponses[currentQuestionIndex - 1].push(transcribedText);
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


// CHAT GPT

async function askForWords(p_prompt) {
    document.body.style.cursor = "progress";
    feedback.html("Waiting for reply from API...");
    const data = {
        "version": "2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48",
        input: {
            prompt: "Analyze the emotional weight of the following text that contains questions and their corresponding answers as well as the average hearbeat during the period when the question was being asked. Use the following guidelines: Identify any emotions present based on these questions (e.g., anger, sadness, fear, joy, etc.). Assign a numerical weight to each detected emotion: Negative emotions (e.g., anger, sadness, fear, disgust): Contribute a positive weight between 0 (low intensity) and 1 (high intensity) based on their intensity. Positive emotions (e.g., joy, love, excitement): Contribute a weight of 0. Neutral emotions or absence of strong emotions: Contribute a weight of 0. Combine the weights of all detected emotions to calculate the total emotional weight of the text. Text with questions and corresponding responses to analyze: " + p_prompt+ " Expected Output: Detected emotions: [list of emotions and their intensities] Weights: [numerical values for each emotion] Total Emotional Weight: [single number representing the combined weight]",
            max_tokens: 100,
            max_length: 100,
        },
    };
    console.log("Asking for Words From Replicate via Proxy", data);
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: 'application/json',
        },
        body: JSON.stringify(data),
    };
    const url = replicateProxy + "/create_n_get/"
    console.log("words url", url, "words options", options);
    const words_response = await fetch(url, options);
    //turn it into json
    const proxy_said = await words_response.json();
    console.log("words_json", proxy_said);
    if (proxy_said.output.length == 0) {
        feedback.html("Something went wrong, try it again");
    } else {
        feedback.html("");
        console.log("proxy_said", proxy_said.output.join(""));
        let incomingText = proxy_said.output.join("");
        createP(incomingText);
        console.log(incomingText);
    }
    document.body.style.cursor = "auto";
}

// SERIAL 

/////////////////////////////
// A CALLBACK FUNCTION CALLED WHEN DATA COMES IN  ///  
/////////////////////////////

function serialEvent() {
  // read a string from the serial port
  // until you get carriage return and newline:
  let inString = serial.readStringUntil("\r\n");
  //check to see that there's actually a string there:
  if (inString) {
    inData = split(inString, ",");
  }
}

/////////////////////////////////////////////
// UTILITY FUNCTIONS TO MAKE CONNECTIONS  ///
/////////////////////////////////////////////


function openPort() {
  serial.open()
  if (portButton) portButton.hide();
}

// This is a convenience for picking from available serial ports:
function makePortButton() {
  // create and position a port chooser button:
  portButton = createButton("choose port");
  portButton.position(10, 10);
  // give the port button a mousepressed handler:
  portButton.mousePressed(() =>serial.requestPort());
}

async function sendQRCodeToArduino(qrData) {
  serial.write(qrData + '\n');
}

