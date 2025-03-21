
const replicateProxy = "https://replicate-api-proxy.glitch.me";
let feedback;
let img;
let images = [];
let successfull = false;
let countAsks = 0;

// ---------------------- Whisper + 3D PoseNet ----------------------
let video;
let bodyPose;
let poses = [];

let words;
let wordsA = ["clothes", "clothing", "wearing", "garments", "attire", "garment", "outfit"];
let displayedText = "";
let interval;

// ---------------------- BodyPix ----------------------
let bodyPix;
let segmentation;
let overlayLayer; // Declare a 2D graphics layer
let draw3d = true;

// Global variable to store the filtered mask
let filteredMask;
let canvas;
let canv;
let processing = false;
const targetParts = [[255, 115, 75], [255, 94, 99], [210, 62, 167],
  [178, 60, 178], [239, 167, 47], [255, 140, 56],
  [255, 78, 125], [238, 67, 149], [135, 245, 87],
  [175, 240, 91], [96, 247, 96], [64, 243, 115],
  [40, 234, 141], [28, 219, 169], [26, 199, 194],
  [33, 176, 213], [47, 150, 224], [65, 125, 224]];
let segmentationResult;
// ----------------------- object detection -----------------------
let humanDetected = false;
let recording = false;

// ---------------------- Audio ----------------------
const audioContext = new AudioContext();
let mediaStream;
let mediaRecorder;
let time = 0;
let timer;
let pause = false;
let timeToTalk = 18;

//------------------------ displaying output of stable diffusion
let imageUrl;
let imgLoaded = false;

let displayGoing = true;

let options = {
  maskType: "parts",
};

function preload() {
  font = loadFont('Staatliches-Regular.ttf');
  bodyPose = ml5.bodyPose("BlazePose");
  bodyPix = ml5.bodySegmentation("BodyPix", options);
}

function setup() {
  canvas = createCanvas(640, 480);
  canvas.position(0, 120);
  //---------------------- Whisper + 3D PoseNet ----------------------
  textFont(font);
  textSize(32);
  canv = createCanvas(640, 480, WEBGL);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  
  video.hide();
  // ---------------------- BODY PIX ----------------------
  bodyPix.detectStart(video, gotResults);
  
  overlayLayer = createGraphics(width, height);
}

function modelLoaded() {
  console.log('Model Loaded!');
}

if (displayGoing) {
  function draw() {
    scale(-1, 1);
    // ----------------------
    background(0);
    texture(video);
    plane(width, height);

    if (time >= timeToTalk) {
      stopRecord();
      clearInterval(timer);
      clearInterval(interval);
    }
  
    if (imgLoaded && images.length > 0) {      
      push();
      scale(-1, 1);
      translate(-width / 2, -height / 2);
      image(img, 0, 0, width, height);
      pop();

    } else if (draw3d) {
        if (poses.length > 0) {
          let pose = poses[0];
          let nose = pose.nose;
          let leftShoulder = pose.left_shoulder;
          let rightShoulder = pose.right_shoulder;
          let leftElbow = pose.left_elbow;
          let rightElbow = pose.right_elbow;
          let leftWrist = pose.left_wrist;
          let rightWrist = pose.right_wrist;
          let leftHip = pose.left_hip;
          let rightHip = pose.right_hip;
          let leftKnee = pose.left_knee;
          let rightKnee = pose.right_knee;
          let leftAnkle = pose.left_ankle;
          let rightAnkle = pose.right_ankle;
          
          // Draw crude 3D model
          let headSize = dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y) / 2;
          let torsoD = dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y) /2;
          let upperArmSize = dist(leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y) / 2;
          let lowerArmSize = dist(leftElbow.x, leftElbow.y, leftWrist.x, leftWrist.y) / 2;
          let upperLegSize = dist(leftHip.x, leftHip.y, leftKnee.x, leftKnee.y) / 2;
          let lowerLegSize = dist(leftKnee.x, leftKnee.y, leftAnkle.x, leftAnkle.y) / 2;
          
          wordsT = createGraphics(torsoD*2, dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y)/2 )
          wordsT.scale(-1, 1);
          wordsT.translate(-wordsT.width, 0);

          wordsT.fill(255)
          wordsT.textAlign(CENTER)
          wordsT.text(displayedText, 30,20)
          
          noStroke()
          // Torso
          push();
          translate((leftShoulder.x + rightShoulder.x) / 2 - width/2, ((leftShoulder.y + rightShoulder.y) / 2) + ((leftHip.y + rightHip.y)/2)/2.8 - (height/2), 0);
          rotateY(radians(-55));
          texture(wordsT)
          cylinder(torsoD, dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y));
          pop();

          wordsUA = createGraphics(upperArmSize*2, dist(leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y)/2 )
          wordsUA.scale(-1, 1);
          wordsUA.translate(-wordsUA.width, 0);
          wordsUA.fill(255)
          wordsUA.textAlign(CENTER)
          wordsUA.text(displayedText, 0,20)

          wordsLA = createGraphics(lowerArmSize*2, dist(leftElbow.x, leftElbow.y, leftWrist.x, leftWrist.y)/2 )
          wordsLA.scale(-1, 1);
          wordsLA.translate(-wordsLA.width, 0);
          wordsLA.fill(255)
          wordsLA.textAlign(CENTER)
          wordsLA.text(displayedText, 0,20)

          // Left upper arm
          push();
          translate(leftShoulder.x - width / 2, leftShoulder.y - height / 2, 0 );
          scale(0.80, 0.80, 0.80)
          rotateZ(atan2(leftElbow.y - leftShoulder.y, leftElbow.x - leftShoulder.x));
          rotateZ(80)
          rotateY(radians(-60));

          fill(0, 0, 255); // Left arm color
          texture(wordsUA)
          cylinder(upperArmSize, dist(leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y));
          pop();

          // Left lower arm
          push();
          translate(leftElbow.x - width / 2, leftElbow.y - height / 2, 0);
          rotateZ(atan2(leftWrist.y - leftElbow.y, leftWrist.x - leftElbow.x));
          rotateZ(80)
          rotateY(radians(-60));
          fill(0, 0, 255); // Left arm color
          texture(wordsLA)
          cylinder(lowerArmSize, dist(leftElbow.x, leftElbow.y, leftWrist.x, leftWrist.y));
          pop();

          // Right upper arm
          push();
          translate(rightShoulder.x - width / 2, rightShoulder.y - height / 2, 0);
          scale(0.80, 0.80, 0.80)
          rotateZ(atan2(rightElbow.y - rightShoulder.y, rightElbow.x - rightShoulder.x));
          rotateZ(80)
          rotateY(radians(-60));
          fill(0, 0, 255); // Right arm color
          texture(wordsUA)
          cylinder(upperArmSize, dist(rightShoulder.x, rightShoulder.y, rightElbow.x, rightElbow.y));
          pop();

          // Right lower arm
          push();
          translate(rightElbow.x - width / 2, rightElbow.y - height / 2, 0);
          rotateZ(atan2(rightWrist.y - rightElbow.y, rightWrist.x - rightElbow.x));
          rotateZ(80)
          rotateY(radians(-60));
          fill(0, 0, 255); // Right arm color
          texture(wordsLA)
          cylinder(lowerArmSize, dist(rightElbow.x, rightElbow.y, rightWrist.x, rightWrist.y));
          pop();

          wordsUL = createGraphics(upperLegSize*2, dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y)/2 )
          wordsUL.scale(-1, 1);
          wordsUL.translate(-wordsUL.width, 0);
          wordsUL.fill(255)
          wordsUL.textAlign(CENTER)
          wordsUL.text(displayedText, 150,50)

          wordsLL = createGraphics(lowerLegSize*2, dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y)/2 )
          wordsLL.scale(-1, 1);
          wordsLL.translate(-wordsLL.width, 0);
          wordsLL.fill(255)
          wordsLL.textAlign(CENTER)
          wordsLL.text(displayedText, 150,50)

          // Left upper leg
          push();
          
          translate(leftHip.x - width / 2, leftHip.y - height / 2, 0);
          rotateZ(atan2(leftKnee.y - leftHip.y, leftKnee.x - leftHip.x));
          scale(0.80, 0.80, 0.80)
          rotateZ(80)
          fill(255); // Left leg color
          texture(wordsUL)
          cylinder(upperLegSize, dist(leftHip.x, leftHip.y, leftKnee.x, leftKnee.y));
          pop();

          // Left lower leg
          push();
          translate(leftKnee.x - width / 2, leftKnee.y - height / 2, 0);
          rotateZ(atan2(leftAnkle.y - leftKnee.y, leftAnkle.x - leftKnee.x));
          scale(0.80, 0.80, 0.80)
          rotateZ(80)
          fill(255); // Left leg color
          texture(wordsLL)
          cylinder(lowerLegSize, dist(leftKnee.x, leftKnee.y, leftAnkle.x, leftAnkle.y));
          pop();

          // Right upper leg
          push();
          translate(rightHip.x - width / 2, rightHip.y - height / 2, 0);
          rotateZ(atan2(rightKnee.y - rightHip.y, rightKnee.x - rightHip.x));
          scale(0.80, 0.80, 0.80)
          rotateZ(80)
          fill(255); // Right leg color
          texture(wordsUL)
          cylinder(upperLegSize, dist(rightHip.x, rightHip.y, rightKnee.x, rightKnee.y));
          pop();

          // Right lower leg
          push();
          translate(rightKnee.x - width / 2, rightKnee.y - height / 2, 0);
          rotateZ(atan2(rightAnkle.y - rightKnee.y, rightAnkle.x - rightKnee.x));
          scale(0.80, 0.80, 0.80)
          rotateZ(80)
          fill(255); // Right leg color
          texture(wordsLL)
          cylinder(lowerLegSize, dist(rightKnee.x, rightKnee.y, rightAnkle.x, rightAnkle.y));
          pop();
        }
      
    }
  }
}
// ------------------------------------------------
async function askWithAudio(audio) {
  document.body.style.cursor = "progress";

  const b64Audio = await convertBlobToBase64(audio);
  // feedback.html("Waiting for reply from Replicate Audio...\n Time remaining:" + (timeToTalk - time) + " seconds");
  let data = {
    version: "4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2",
    input: {
      audio: b64Audio,
    },
  };
  const url = replicateProxy + "/askReplicateAudio/";
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
  console.log("audio_response", openAI_json.output.transcription);


  // feedback.html(openAI_json.output.transcription);
  displayedText += openAI_json.output.transcription + displayedText + "\n";

  feedbackSplit = openAI_json.output.transcription.trim().split(" ");
  wordsA.push(feedbackSplit);
  document.body.style.cursor = "auto";
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
async function stopRecord() {
  if (countAsks <= 5) {
    countAsks++;
    mediaRecorder.stop();

    img = video.get();
    processing = true;
    ask();
    pause = true;
  }
};
async function beginRecord() {
  recording = true;
  // Request access to the user's microphone
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  let mrChunks = [];

  // Create a media recorder and start recording
  mediaRecorder = new MediaRecorder(mediaStream);
  mediaRecorder.addEventListener("dataavailable", (event) => {
    mrChunks.push(event.data);
  });
  mediaRecorder.addEventListener("stop", (event) => {
    const recordedData = new Blob(mrChunks, { type: "audio/webm" });
    console.log("Recording stopped", recordedData);

    let av = document.createElement("VIDEO");
    var audioURL = window.URL.createObjectURL(recordedData);
    av.src = audioURL;
    av.width = 100;
    av.height = 1;
    document.body.appendChild(av);

    askWithAudio(recordedData);
  });
  mediaRecorder.start();

  console.log("Recording started");

  let textTime = document.querySelector("span");
  timer = setInterval (function() {
    time++;
    textTime.innerHTML = timeToTalk - time;
  }, 1000)

  // Stop and start the recording every 5 seconds if human present
  interval = setInterval(() => {
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mrChunks = [];
      mediaRecorder.start();
      console.log("Recording restarted");
    }
  }, 5000);
};
// ---------------------- Whisper + 3D PoseNet ----------------------
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
  if (results.length > 0) {
    humanDetected = true;
    if (!recording) {
      beginRecord();
    }
  }
  else {humanDetected = false;}
}

// ---------------------- BODY PIX ----------------------
// callback function for body segmentation
function gotResults(result) {
  segmentationResult = result;
  if (!processing) {
    segmentation = result.mask;
  } 
}
// ---------------------- NEW CODE ----------------------
function filterMask(result, targetParts) {
  // Get the canvas and drawing context from result.mask
  let maskCanvas = result.mask.canvas;
  let maskContext = result.mask.drawingContext;

  // Create a new canvas element to use for the filtered mask
  let filteredMask = document.createElement('canvas');
  filteredMask.width = maskCanvas.width;
  filteredMask.height = maskCanvas.height;
  let filteredContext = filteredMask.getContext('2d');

  // flipping fix
  filteredContext.translate(filteredMask.width, 0);
  filteredContext.scale(-1, 1);

  // Copy the contents of maskCanvas to filteredMask
  filteredContext.drawImage(maskCanvas, 0, 0);

  // Get the image data from the filtered mask canvas
  let imageData = filteredContext.getImageData(0, 0, filteredMask.width, filteredMask.height);
  let data = imageData.data;

  // Loop through the pixels and apply the color filter
  for (let i = 0; i < data.length; i += 4) {
      // Extract RGB values
      let red = data[i];
      let green = data[i + 1];
      let blue = data[i + 2];
      let alpha = data[i + 3];

      // Check if the pixel color is white (R, G, B all equal to 255)
      if (red === 255 && green === 255 && blue === 255) {
        // Set alpha to zero for full transparency
        data[i + 3] = 0;
      } else {
        // only color parts of the body with colors corresponding to arrays in targetParts
        let found = false;
        for (let j = 0; j < targetParts.length; j++) {
          if (red === targetParts[j][0] && green === targetParts[j][1] && blue === targetParts[j][2]) {
            found = true;
            break;
          }
        }
        if (found) {
          // change pixel to fully white 
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else {
          // Set alpha to zero for full transparency
          data[i + 3] = 0;
        }
      }
  }
  // Update the filtered mask canvas with the modified image data
  filteredContext.putImageData(imageData, 0, 0);
  
  drawCanvasRenderingContext2D(filteredContext)
  // filteredContext is the mask 
  let maskBase64 = filteredMask.toDataURL();
  // Return the base64 URL of the filtered mask
  return maskBase64;
}

// Function to draw the CanvasRenderingContext2D on p5.js canvas
function drawCanvasRenderingContext2D(context2d) {
  // Create a temporary canvas using createGraphics
  let tempCanvas = createGraphics(context2d.canvas.width, context2d.canvas.height);

  // Draw the context2d onto the temporary canvas
  tempCanvas.drawingContext.drawImage(context2d.canvas, 0, 0);
}

// Use the filtered mask in the ask function
async function ask() {

  let maskBase64 = filterMask(segmentationResult, targetParts);

  canv.loadPixels();
  imgBase64 = canv.elt.toDataURL();

  // concatenate the words in wordsA into one string separated with spaces
  let prompt = wordsA.join(" ");

  let postData = {
    version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    input: {
      prompt: prompt,
      prompt_strength: 1.0,
      num_inference_steps: 20,
      guidance_scale: 7.5,
      image: imgBase64,
      mask: maskBase64,
    },
  };

  let url = replicateProxy + "/create_n_get";
  const options = {
    headers: {
      "Content-Type": `application/json`,
    },
    method: "POST",
    body: JSON.stringify(postData), //p)
  };

  const response = await fetch(url, options);
  const result = await response.json();

  // Handle the response
  if (!result.error) {
    if (!successfull) {
      loadImage(result.output[0], function (newImage) {
        console.log(result.output[0])
        imageUrl = result.output[0];

        if (!localStorage.getItem('images')) {
          // initialize counter variable 
          localStorage.setItem('counter', 0);
          // Initialize an empty array and save it in local storage as a JSON string
          localStorage.setItem('images', JSON.stringify([]));
        }

        imageURLToBase64(imageUrl)
          .then(base64String => {
              console.log('Base64-encoded string:', base64String);
              let imagesArray = getImagesArray();
              let counter = parseInt(localStorage.getItem('counter'));
              imagesArray.push(counter.toString())

              localStorage.setItem(counter.toString(), base64String);
              updateImagesArray(imagesArray);
              counter++
              localStorage.setItem('counter', counter.toString());
          })
          .catch(error => {
              console.error('Error converting image URL to base64:', error);
          });

        // If the image has not been loaded yet, try to load it
        loadImage(imageUrl, (loadedImg) => {
          images.push(loadedImg);
          imgLoaded = true;
          img = images[0];

        });
        endTimer = setTimeout(() => {
          
          displayGoing = false;
          showAllPics();
        }, 2000);
      });
      successfull = true;
    }
  } else {
    console.log("Error", result.error);
  }
}

const imageURLToBase64 = (imageURL) => {
  return fetch(imageURL)
      .then(response => response.ok ? response.blob() : Promise.reject(`HTTP error! status: ${response.status}`))
      .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
      }));
};

function getImagesArray() {
  const imagesJSON = localStorage.getItem('images');
  return JSON.parse(imagesJSON);
}

function updateImagesArray(images) {
  // Convert the array to a JSON string and save it in local storage
  localStorage.setItem('images', JSON.stringify(images));
}
