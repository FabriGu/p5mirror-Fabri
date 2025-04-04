// P5.js sketch for image inpainting using transformers.js
// Requires P5.js and transformers.js libraries

// Import transformers (assume it's included in your HTML)
// const { pipeline } = require('@xenova/transformers');

let originalImg;
let maskedImg;
let maskImg;
let resultImg;
let inpaintingPipeline;
let statusText = "Loading...";
let isProcessing = false;

function preload() {
  // Load a sample image
  originalImg = loadImage('https://picsum.photos/600/400');
}

function setup() {
  createCanvas(600, 400);
  
  // Create a separate graphics buffer for the mask
  maskImg = createGraphics(600, 400);
  
  // Initialize transformers.js pipeline
  initTransformers();
  
  // Display initial image
  image(originalImg, 0, 0);
  
  // Create a random elliptical mask
  createRandomMask();
}

async function initTransformers() {
  try {
    statusText = "Loading model...";
    // Initialize the inpainting pipeline with the Stable Diffusion inpainting model
    inpaintingPipeline = await pipeline('image-to-image', 'stabilityai/stable-diffusion-2-inpainting');
    statusText = "Model loaded. Processing...";
    
    // Start inpainting process once model is loaded
    runInpainting();
  } catch (error) {
    console.error("Error loading transformers:", error);
    statusText = "Error loading model: " + error.message;
  }
}

function createRandomMask() {
  // Clear the mask
  maskImg.background(0);
  
  // Set drawing properties for the mask
  maskImg.fill(255);
  maskImg.noStroke();
  
  // Create a random ellipse
  let centerX = random(width * 0.3, width * 0.7);
  let centerY = random(height * 0.3, height * 0.7);
  let ellipseWidth = random(50, 150);
  let ellipseHeight = random(50, 150);
  
  // Draw the ellipse mask
  maskImg.ellipse(centerX, centerY, ellipseWidth, ellipseHeight);
  
  // Apply the mask to show the user what will be inpainted
  maskedImg = originalImg.get();
  maskedImg.mask(maskImg);
  
  // Display the masked image
  image(maskedImg, 0, 0);
  
  // Draw outline to show mask area
  stroke(255, 0, 0);
  strokeWeight(2);
  noFill();
  ellipse(centerX, centerY, ellipseWidth, ellipseHeight);
}

async function runInpainting() {
  if (isProcessing || !inpaintingPipeline) return;
  
  isProcessing = true;
  statusText = "Inpainting...";
  
  try {
    // Convert the images to the format expected by the pipeline
    // For simplicity, we're assuming transformers.js can work with p5 images
    // In a real implementation, you might need to convert to base64 or other formats
    
    // Run the inpainting process
    const result = await inpaintingPipeline({
      images: originalImg.canvas,
      mask_image: maskImg.canvas,
      prompt: "A realistic texture" // Guidance for the inpainting
    });
    
    // Convert result to p5 image and display it
    resultImg = loadImage(result, () => {
      image(resultImg, 0, 0);
      statusText = "Inpainting complete";
      isProcessing = false;
    });
  } catch (error) {
    console.error("Inpainting error:", error);
    statusText = "Error during inpainting: " + error.message;
    isProcessing = false;
  }
}

function draw() {
  // Display status text
  fill(0);
  noStroke();
  rect(0, height - 30, width, 30);
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(statusText, width/2, height - 15);
}

// Allow user to generate a new mask and run inpainting again
function mousePressed() {
  if (!isProcessing && inpaintingPipeline) {
    createRandomMask();
    runInpainting();
  }
}