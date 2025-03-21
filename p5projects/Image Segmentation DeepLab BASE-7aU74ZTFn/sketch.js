// Image Segmentation Demo - Tensorflow.js / DeepLabv3
// Machine Learning for Creative Coding - ITP
// https://github.com/shiffman/ML-for-Creative-Coding

// Variables for the model and result
let segmentationModel;
let segmentationImage;

// Image to segment
let img;

// Is the model loaded
let modelLoaded = false;

// Dom element to show labels
let legendLabel;

function preload() {
  // Try different images
  img = loadImage("dog_cat.jpg");
  // img = loadImage("dan.jpg");
}

async function setup() {
  createCanvas(640, 480);
  
  // Create div for the labels
  legendLabel = createDiv();
  legendLabel.style("font-weight", "bold");
  legendLabel.style("margin-top", "20px");

  
  // Load the model
  await loadDeepLabModel();

  // Segment the image
  await segmentImage();
}

function draw() {
  tint(255);
  image(img, 0, 0, width, height);

  // Overlay the segmentation mask
  if (segmentationImage) {
    tint(255, 100);
    // Note the mask may be a different size than image
    // So this example is scaling them
    image(segmentationImage, 0, 0, width, height);
  }
}

async function loadDeepLabModel() {
  // Load the model
  // Try different options, what changes?
  segmentationModel = await deeplab.load({
    base: "pascal", // Model type: "pascal" | "ade20k" | "cityscapes"
    quantizationBytes: 2, // Model size optimization: 1 | 2 | 4
    outputStride: 16, // Controls segmentation resolution: 8 | 16 | 32
    inputResolution: 513, // Model input size: 257 | 321 | 513
  });
  modelLoaded = true;
  console.log("Model Loaded!");
}

async function segmentImage() {
  
  // Send the image into the model
  let prediction = await segmentationModel.segment(img.canvas);
  
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
  legendLabel.html("");
  let labels = Object.keys(legend);
  for (let label of labels) {
    const [r, g, b] = legend[label];
    let span = createSpan(label);
    span.style("background-color", `rgb(${r}, ${g}, ${b})`);
    span.style("padding", "10px");
    span.style("margin-right", "5px");
    span.style("color", "#ffffff");
    span.parent(legendLabel);
  }
}
