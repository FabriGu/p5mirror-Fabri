let segmentationModel;
let segmentationImage;
let img;
let modelLoaded = false;
let legendLabel;
let generatedImage;
let segmentationMask;
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
  
  let generateButton = createButton("Generate New Image from Segmentation");
  generateButton.position(10, height + 20);
  generateButton.mousePressed(generateFromSegmentation);
  
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
  
  // Draw original image
  tint(255);
  image(img, x, y, newWidth, newHeight);
  
  // Draw segmentation overlay
  if (segmentationImage) {
    tint(255, 100);
    image(segmentationImage, x, y, newWidth, newHeight);
  }
  
  // Draw generated image if available
  if (generatedImage) {
    tint(255, 200);
    image(generatedImage, x, y, newWidth, newHeight);
  }
}

async function loadDeepLabModel() {
  segmentationModel = await deeplab.load({
    base: "cityscapes",
    quantizationBytes: 2,
    outputStride: 16,
    inputResolution: 513,
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
  
  // Update legend display and store prediction data
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

async function generateFromSegmentation() {
  const prediction = await segmentationModel.segment(img.canvas);
  
  // Create prompt from segmentation data
  let prompt = constructPromptFromSegmentation(prediction);
  console.log("Generated prompt:", prompt);
  
  // Call the inpainting API
  try {
    await askForInpainting(prompt);
  } catch (error) {
    console.error("Error during inpainting:", error);
  }
}

function constructPromptFromSegmentation(prediction) {
  const { legend, segmentationMap } = prediction;
  
  // Create a mapping of segment values to labels
  let valueToLabel = {};
  for (let label in legend) {
    let value = legend[label][0]; // Use first value as identifier
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
    if (percentage > 5) { // Only include significant elements
      descriptions.push(`${percentage}% ${label}`);
    }
  }
  
  // Construct the final prompt with spatial information
  let prompt = "Recreate this urban scene maintaining exact spatial layout with " + 
               descriptions.join(", ") + ". Keep all elements in their original positions. " +
               "Style: photorealistic, detailed, natural lighting, precise spatial composition";
  
  console.log("Generated prompt:", prompt);
  return prompt;
}

async function askForInpainting(prompt) {
  // Create temporary canvases for image and mask at the correct size
  let tempCanvas = createGraphics(512, 512);
  let maskCanvas = createGraphics(512, 512);
  
  // Draw the original image onto the temp canvas
  tempCanvas.image(img, 0, 0, 512, 512);
  
  // Create the mask - white for areas to regenerate
  maskCanvas.background(255);
  
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
      
    },
  };
  
  console.log("Requesting inpainting...");
  
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
      loadImage(result.output[0], (incomingImage) => {
        generatedImage = incomingImage;
      });
    } else {
      console.error("Image generation failed:", result);
    }
  } catch (error) {
    console.error("Error generating image:", error);
  }
}