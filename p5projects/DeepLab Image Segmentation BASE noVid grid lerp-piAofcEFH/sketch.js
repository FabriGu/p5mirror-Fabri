// Video Segmentation Demo - Tensorflow.js / DeepLabv3
// Machine Learning for Creative Coding - ITP
// https://github.com/shiffman/ML-for-Creative-Coding

// Variables for the model and result
let segmentationModel;
let segmentationImage;

// Video input
let video;

// Is the model loaded
let modelLoaded = false;

// Dom element to show labels
let legendLabel;

let prediction;
let c = 0;

async function setup() {
  createCanvas(640, 480);

  // Create video capture
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Create button to segment video
  createButton("Start Segmenting Video").mousePressed(segmentVideo);

  // Create div for the labels
  legendLabel = createDiv();
  legendLabel.style("font-weight", "bold");
  legendLabel.style("margin-top", "20px");

  // Load the model
  await loadDeepLabModel();
  pixelDensity(1)
  // frameRate(2);
  // console.log(height)
}
// Add these variables at the start of your code
let currentColors = [];
let targetColors = [];
let lerpAmount = 0;
const LERP_SPEED = 0.1;  // Adjust this value to control transition speed

function draw() {
  image(video, 0, 0, width, height);
  background(255);
  
  if (segmentationImage) {
    pixelDensity(1);
    segmentationImage.loadPixels();
    
    // Initialize color arrays if they're empty
    if (currentColors.length === 0) {
      initializeColorArrays();
    }
    
    // Update target colors with new segmentation data
    let index = 0;
    for (let y = 0; y < height; y += 20) {
      for (let x = 0; x < width; x += 20) {
        let i = (x + y * segmentationImage.width) * 4;
        targetColors[index] = {
          r: segmentationImage.pixels[i],
          g: segmentationImage.pixels[i + 1],
          b: segmentationImage.pixels[i + 2]
        };
        index++;
      }
    }
    
    // Draw rectangles with lerped colors
    index = 0;
    for (let y = 0; y < height; y += 20) {
      for (let x = 0; x < width; x += 20) {
        // Lerp each color component
        let lerpedR = lerp(currentColors[index].r, targetColors[index].r, lerpAmount);
        let lerpedG = lerp(currentColors[index].g, targetColors[index].g, lerpAmount);
        let lerpedB = lerp(currentColors[index].b, targetColors[index].b, lerpAmount);
        
        fill(lerpedR, lerpedG, lerpedB);
        noStroke();
        rect(x + 5, y + 5, 20, 20);
        index++;
      }
    }
    
    // Update lerp amount
    lerpAmount += LERP_SPEED;
    if (lerpAmount >= 1) {
      lerpAmount = 0;
      // Copy target colors to current colors
      currentColors = JSON.parse(JSON.stringify(targetColors));
    }
  }
}

function initializeColorArrays() {
  const totalRects = Math.floor(width / 20) * Math.floor(height / 20);
  
  for (let i = 0; i < totalRects; i++) {
    currentColors[i] = { r: 255, g: 255, b: 255 };  // Start with white
    targetColors[i] = { r: 255, g: 255, b: 255 };
  }
}

async function loadDeepLabModel() {
  // Load the model
  // Try different options, what changes?
  segmentationModel = await deeplab.load({
    base: "cityscapes", // Model type: "pascal" | "ade20k" | "cityscapes"
    quantizationBytes: 2, // Model size optimization: 1 | 2 | 4
    outputStride: 8, // Controls segmentation resolution: 8 | 16 | 32
    inputResolution: 257, // Model input size: 257 | 321 | 513
  });
  modelLoaded = true;
  console.log("Model Loaded!");
}

async function segmentVideo() {
  if (!modelLoaded) return;
  // console.log(video.canvas)
//   hide(video)
  // video.hide()
  if (c == 0) {
    // Send the video frame into the model
    prediction = await segmentationModel.segment(video.canvas);
    // console.log(prediction);
    c++;
  // } else if (c == 5) {
    // Send the video frame into the model
    // prediction = await segmentationModel.segment(video.canvas);
    // console.log(prediction);
    // c=0;
  } else {
 
    
    // For subsequent passes, we need to convert the segmentation map to a canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = prediction.width;
    tempCanvas.height = prediction.height;
    const ctx = tempCanvas.getContext('2d');
    
    // Create ImageData from the segmentation map
    const imageData = new ImageData(
      new Uint8ClampedArray(prediction.segmentationMap.buffer), 
      prediction.width, 
      prediction.height
    );
    ctx.putImageData(imageData, 0, 0);
    
    // Now we can feed this canvas to the model
    prediction = await segmentationModel.segment(tempCanvas);
    c++;
  }
  
 

  // Pull out the variables from the prediction object
  let { legend, width: w, height: h, segmentationMap } = prediction;

  // Make a p5.js image
  segmentationImage = createImage(w, h);
  segmentationImage.loadPixels();
  // Copy the segmentation data
  for (let i = 0; i < segmentationMap.length; i++) {
    segmentationImage.pixels[i] = segmentationMap[i];
  }
  
  segmentationImage.updatePixels();

  // Make DOM elements for the labels
  // legendLabel.html("");
  // let labels = Object.keys(legend);
  // for (let label of labels) {
  //   const [r, g, b] = legend[label];
  //   let span = createSpan(label);
  //   span.style("background-color", `rgb(${r}, ${g}, ${b})`);
  //   span.style("padding", "10px");
  //   span.style("margin-right", "5px");
  //   span.style("color", "#ffffff");
  //   span.parent(legendLabel);
  // }
  
  segmentVideo();
}

function mousePressed() {
  console.log(segmentationImage);
}

if (video) {
  const videoEl = document.querySelector("main");
  videoEl.style.visibility = "none";
}

