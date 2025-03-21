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
  frameRate(2);
}

function draw() {
  // tint(0);
  image(video, 0, 0, width, height);
  background(255)
  
   // Only draw the segmentation mask
  if (segmentationImage) {
    // Remove transparency by changing tint alpha to 255
    // console.log(segmentationImage)
    // tint(255, 180);
    pixelDensity(1)
    segmentationImage.loadPixels();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let i = (x + y * width) * 4;
        // let i = ((x/10) + (y/10) * (width)) * 4;
        // i *= 10;
        // pixels[index + 0] = x;
        // pixels[index + 1] = random(255);
        // pixels[index + 2] = y;
        // pixels[index + 3] = 255;
        if ()
        
        
        fill(segmentationImage.pixels[i], segmentationImage.pixels[i+1], segmentationImage.pixels[i+2])
        noStroke()
        ellipse(x+5, y+5, 10, 10)
      }
    }
    segmentationImage.updatePixels()
    
    // image(segmentationImage, 0, 0, width, height);
    // console.log(segmentationImage);
  } else {
    // Optional: Clear the background when no segmentation is available
    // background(0);
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
  } else if (c == 5) {
    // Send the video frame into the model
    prediction = await segmentationModel.segment(video.canvas);
    // console.log(prediction);
    c=0;
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

