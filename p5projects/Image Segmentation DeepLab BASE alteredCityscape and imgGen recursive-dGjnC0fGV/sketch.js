let segmentationModel;
let segmentationImage;
let img;
let modelLoaded = false;
let legendLabel;
let generatedImage;
let isProcessing = false;
let iterationCount = 0;
let statusDiv;
const replicateProxy = "https://replicate-api-proxy.glitch.me";

function preload() {
  img = loadImage("NYCStreet.jpg");
}

async function setup() {
  // Create a canvas that matches the model's expected input size
  let canvas = createCanvas(512, 512);
  pixelDensity(1);
  
  // Create UI elements
  legendLabel = createDiv();
  legendLabel.style("font-weight", "bold");
  legendLabel.style("margin-top", "20px");
  
  let startButton = createButton("Start Recursive Generation");
  startButton.position(10, height + 20);
  startButton.mousePressed(startRecursiveGeneration);
  
  let stopButton = createButton("Stop");
  stopButton.position(200, height + 20);
  stopButton.mousePressed(() => { isProcessing = false; });
  
  // Add status display
  statusDiv = createDiv('');
  statusDiv.position(10, height + 50);
  
  // Load the segmentation model
  await loadDeepLabModel();
  await segmentImage();
}

function draw() {
  // Calculate scaling to maintain aspect ratio
  let scale = Math.min(width / img.width, height / img.height);
  let newWidth = img.width * scale;
  let newHeight = img.height * scale;
  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;
  
  background(0);
  
  // Draw current image
  tint(255);
  image(img, x, y, newWidth, newHeight);
  
  // Draw segmentation overlay
  if (segmentationImage) {
    tint(255, 100);
    image(segmentationImage, x, y, newWidth, newHeight);
  }
}

async function loadDeepLabModel() {
  segmentationModel = await deeplab.load({
    base: "ade20k",
    quantizationBytes: 2,
    outputStride: 2,
    inputResolution: 217,
  });
  modelLoaded = true;
  console.log("Model Loaded!");
}

async function segmentImage() {
  let prediction = await segmentationModel.segment(img.canvas);
  let { legend, width: w, height: h, segmentationMap } = prediction;
  
  // Create segmentation visualization
  segmentationImage = createImage(w, h);
  segmentationImage.loadPixels();
  for (let i = 0; i < segmentationMap.length; i++) {
    segmentationImage.pixels[i] = segmentationMap[i];
  }
  segmentationImage.updatePixels();
  
  // Update legend display
  updateLegend(legend);
  
  return prediction;
}

function updateLegend(legend) {
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

async function startRecursiveGeneration() {
  if (isProcessing) {
    console.log("Already processing, please wait or stop current process");
    return;
  }
  
  isProcessing = true;
  iterationCount = 0;
  await recursiveGenerateStep();
}

async function recursiveGenerateStep() {
  if (!isProcessing) {
    statusDiv.html(`Stopped at iteration ${iterationCount}`);
    return;
  }
  
  iterationCount++;
  statusDiv.html(`Processing iteration ${iterationCount}...`);
  
  try {
    console.log(`Starting segmentation for iteration ${iterationCount}...`);
    
    // Run segmentation on current image
    const prediction = await segmentationModel.segment(img.canvas);
    console.log(`Segmentation complete for iteration ${iterationCount}`, prediction);
    
    // Update segmentation visualization
    await segmentImage();
    console.log(`Segmentation visualization updated for iteration ${iterationCount}`); // This updates segmentationImage for display
    
    // Create prompt from NEW segmentation data
    let prompt = constructPromptFromSegmentation(prediction);
    console.log(`Iteration ${iterationCount} prompt:`, prompt);
    
    // Generate new image
    await askForInpainting(prompt);
    
    // Wait for the new image to load before continuing
    await new Promise(resolve => {
      loadImage(generatedImage.canvas.toDataURL(), (newImg) => {
        img = newImg;  // Update main image
        resolve();
      });
    });
    
    // Wait a bit to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Continue the loop if still processing
    if (isProcessing) {
      recursiveGenerateStep();
    }
  } catch (error) {
    console.error("Error in recursive generation:", error);
    isProcessing = false;
    statusDiv.html(`Error at iteration ${iterationCount}: ${error.message}`);
  }
}

function constructPromptFromSegmentation(prediction) {
  const { legend, segmentationMap } = prediction;
  
  // Create a mapping of segment values to labels
  let valueToLabel = {};
  for (let label in legend) {
    let value = legend[label][0];
    valueToLabel[value] = label;
  }
  
  // Count the percentage of each segment type
  let segmentCounts = {};
  let total = segmentationMap.length;
  
  for (let i = 0; i < segmentationMap.length; i++) {
    let value = segmentationMap[i];
    let label = valueToLabel[value];
    if (label) {
      segmentCounts[label] = (segmentCounts[label] || 0) + 1;
    }
  }
  
  // Convert counts to percentages and create description
  let descriptions = [];
  for (let label in segmentCounts) {
    let percentage = (segmentCounts[label] / total * 100).toFixed(1);
    if (percentage > 5) {
      descriptions.push(`${percentage}% ${label}`);
    }
  }
  
  // Construct the final prompt with spatial information
  let prompt = "Recreate this urban scene maintaining exact spatial layout with " + 
               descriptions.join(", ") + ". Keep all elements in their original positions. " +
               "Style: photorealistic, detailed, natural lighting, precise spatial composition. " +
               `Iteration: ${iterationCount}`;
  
  return prompt;
}

async function askForInpainting(prompt) {
  // Create temporary canvases for image and mask at the correct size
  let tempCanvas = createGraphics(512, 512);
  let maskCanvas = createGraphics(512, 512);
  
  // Draw the current image onto the temp canvas
  tempCanvas.image(img, 0, 0, 512, 512);
  
  // Create the mask - white for areas to regenerate
  maskCanvas.background(255);
  // maskCanvas.image(segmentationImage, 0, 0, 512, 512);
  
  // Get base64 representations
  let imgBase64 = tempCanvas.elt.toDataURL();
  let maskBase64 = maskCanvas.elt.toDataURL();
  
  // Clean up temporary canvases
  tempCanvas.remove();
  maskCanvas.remove();
  
  let data = {
    version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    input: {
      prompt: prompt,
      image: imgBase64,
      mask: maskBase64,
      prompt_strength: 0.8,
      num_inference_steps: 50,
      guidance_scale: 7.5,
      seed: 42 + iterationCount // Change seed each iteration
    },
  };
  
  console.log(`Requesting inpainting for iteration ${iterationCount}...`);
  
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  
  try {
    const response = await fetch(replicateProxy + "/create_n_get/", options);
    const result = await response.json();
    
    if (result.output && result.output.length > 0) {
      // Return a promise that resolves when the new image is loaded
      return new Promise((resolve, reject) => {
        loadImage(result.output[0], (incomingImage) => {
          generatedImage = incomingImage;
          resolve(incomingImage);
        }, () => reject(new Error('Failed to load generated image')));
      });
    } else {
      throw new Error("Image generation failed: " + JSON.stringify(result));
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}