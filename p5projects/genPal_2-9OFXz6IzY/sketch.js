const replicateProxy = "https://replicate-api-proxy.glitch.me";
let feedback;
let webcam;
let captureButton;
let currentPalette = [];
let isProcessing = false;
let capturedImage;
let generatedPaletteImage;
let sceneDescription = "";

function setup() {
  createCanvas(1080, 1080);
  colorMode(HSB, 360, 100, 100);
  
  // Setup webcam with new dimensions (keeping 4:3 ratio)
  webcam = createCapture(VIDEO);
  webcam.size(480, 360);
  webcam.hide();
  
  captureButton = createButton('Generate Palette from Scene');
  captureButton.position(10, height - 40);
  captureButton.mousePressed(captureAndProcess);
  
  feedback = createP("");
  feedback.position(10, height - 60);
  
  // Initial empty palette
  currentPalette = Array(5).fill(color(0, 0, 100));
}

function draw() {
  background(0, 0, 95);
  
  // Draw grid lines
  stroke(0, 0, 80);
  strokeWeight(2);
  line(width/2, 0, width/2, height);
  line(0, height/2, width, height/2);
  
  // Step 1: Webcam Feed (Top Left)
  noStroke();
  fill(0);
  textSize(24);
  text("1. Camera Input", 20, 40);
  image(webcam, 20, 60, 480, 360);
  
  // Step 2: Captured Image (Top Right)
  text("2. Captured Frame", width/2 + 20, 40);
  if (capturedImage) {
    image(capturedImage, width/2 + 20, 60, 480, 360);
  } else {
    fill(0, 0, 90);
    rect(width/2 + 20, 60, 480, 360);
    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Click button to capture", width/2 + 260, 240);
    textAlign(LEFT, BASELINE);
  }
  
  // Step 3: Description (Bottom Left)
  textSize(24);
  text("3. AI Scene Description", 20, height/2 + 40);
  fill(0, 0, 100);
  rect(20, height/2 + 60, 480, 360);
  fill(0);
  textSize(16);
  textWrap(WORD);
  text(sceneDescription || "Description will appear here...", 30, height/2 + 80, 460);
  
  // Step 4: Generated Palette Image (Bottom Right)
  textSize(24);
  text("4. AI Generated Palette", width/2 + 20, height/2 + 40);
  if (generatedPaletteImage) {
    image(generatedPaletteImage, width/2 + 20, height/2 + 60, 480, 360);
  } else {
    fill(0, 0, 90);
    rect(width/2 + 20, height/2 + 60, 480, 360);
    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Palette image will appear here", width/2 + 260, height/2 + 240);
    textAlign(LEFT, BASELINE);
  }
  
  // Draw loading indicator if processing
  if (isProcessing) {
    push();
    translate(width/2, height/2);
    rotate(frameCount * 0.1);
    noFill();
    stroke(0);
    strokeWeight(4);
    arc(0, 0, 80, 80, 0, PI + PI/2);
    pop();
  }
  
  // Display extracted palette on the right edge
  drawPalette();
  displayColorInfo();
}

async function captureAndProcess() {
  if (isProcessing) return;
  isProcessing = true;
  feedback.html("Processing scene...");
  
  try {
    // Save the current frame as a base64 image
    const imageData = await saveCanvasToBase64();
    feedback.html("Image captured, getting description...");
    
    // Get scene description from LLaVA
    sceneDescription = await getSceneDescription(imageData);
    feedback.html("Got scene description: " + sceneDescription);
    
    // Generate palette image based on description
    await generatePaletteImage(sceneDescription);
    
  } catch (error) {
    console.error('Error in processing:', error);
    feedback.html("Error occurred: " + error.message);
  }
  
  isProcessing = false;
}

function saveCanvasToBase64() {
  return new Promise((resolve) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = webcam.width;
    tempCanvas.height = webcam.height;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(webcam.elt, 0, 0, webcam.width, webcam.height);
    const base64Data = tempCanvas.toDataURL('image/jpeg');
    capturedImage = loadImage(base64Data);
    resolve(base64Data);
  });
}

async function getSceneDescription(base64Image) {
  let data = {
    version: "80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb",
    input: {
      image: base64Image,
      top_p: 1,
      prompt: "Describe the main colors and mood of this scene.",
      max_tokens: 1024,
      temperature: 0.2
    }
  };
  
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  
  const url = replicateProxy + "/create_n_get/";
  const response = await fetch(url, options);
  const result = await response.json();
  
  if (!result.output) {
    throw new Error("No description generated");
  }
  
  return result.output;
}

async function generatePaletteImage(description) {
  feedback.html("Generating palette from description: " + description);
  
  let data = {
    version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    input: {
      prompt: `Abstract color palette based on: ${description}. Minimal, clean blocks of color representing the essence of the scene.`,
      negative_prompt: "text, words, letters, busy, detailed",
      num_inference_steps: 50,
      guidance_scale: 7.5,
      seed: Math.floor(Math.random() * 1000000),
    },
  };
  
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  
  const url = replicateProxy + "/create_n_get/";
  const picture_info = await fetch(url, options);
  const proxy_said = await picture_info.json();
  
  if (proxy_said.output.length == 0) {
    throw new Error("Failed to generate palette image");
  }
  
  loadImage(proxy_said.output[0], (incomingImage) => {
    generatedPaletteImage = incomingImage;
    currentPalette = extractPaletteFromImage(incomingImage);
    feedback.html("Palette generated!");
  });
}

function extractPaletteFromImage(img) {
  const colors = [];
  img.loadPixels();
  
  for (let i = 0; i < 5; i++) {
    const x = (img.width / 6) * (i + 1);
    const y = img.height / 2;
    const index = 4 * (Math.floor(y) * img.width + Math.floor(x));
    const r = img.pixels[index];
    const g = img.pixels[index + 1];
    const b = img.pixels[index + 2];
    colors.push(color(r, g, b));
  }
  
  return colors;
}

// Add this function right after the existing extractPaletteFromImage function
function extractPaletteFromImage(img) {
  const colors = [];
  img.loadPixels();
  
  // Collect all pixels
  const pixels = [];
  for (let y = 0; y < img.height; y += 2) { // Sample every other pixel for performance
    for (let x = 0; x < img.width; x += 2) {
      const index = 4 * (y * img.width + x);
      pixels.push([
        img.pixels[index],
        img.pixels[index + 1],
        img.pixels[index + 2]
      ]);
    }
  }
  
  // K-means clustering
  const k = 5; // Number of colors we want
  let centroids = initializeCentroids(pixels, k);
  const maxIterations = 10;
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Assign points to clusters
    const clusters = Array(k).fill().map(() => []);
    pixels.forEach(pixel => {
      let minDist = Infinity;
      let closestCentroid = 0;
      
      centroids.forEach((centroid, i) => {
        const dist = colorDistance(pixel, centroid);
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = i;
        }
      });
      
      clusters[closestCentroid].push(pixel);
    });
    
    // Update centroids
    const newCentroids = clusters.map(cluster => {
      if (cluster.length === 0) return [0, 0, 0];
      
      const sum = cluster.reduce((acc, pixel) => [
        acc[0] + pixel[0],
        acc[1] + pixel[1],
        acc[2] + pixel[2]
      ], [0, 0, 0]);
      
      return [
        Math.round(sum[0] / cluster.length),
        Math.round(sum[1] / cluster.length),
        Math.round(sum[2] / cluster.length)
      ];
    });
    
    // Check for convergence
    if (centroidsEqual(centroids, newCentroids)) break;
    centroids = newCentroids;
  }
  
  // Sort centroids by brightness for a nicer display
  centroids.sort((a, b) => {
    const brightnessA = (a[0] + a[1] + a[2]) / 3;
    const brightnessB = (b[0] + b[1] + b[2]) / 3;
    return brightnessB - brightnessA;
  });
  
  // Convert centroids to p5 colors
  centroids.forEach(centroid => {
    colors.push(color(centroid[0], centroid[1], centroid[2]));
  });
  
  return colors;
}

function initializeCentroids(pixels, k) {
  // Use k-means++ initialization
  const centroids = [];
  const first = pixels[Math.floor(Math.random() * pixels.length)];
  centroids.push([...first]);
  
  for (let i = 1; i < k; i++) {
    const distances = pixels.map(pixel => {
      return Math.min(...centroids.map(centroid => 
        colorDistance(pixel, centroid)
      ));
    });
    
    const sum = distances.reduce((a, b) => a + b, 0);
    let rand = Math.random() * sum;
    
    for (let j = 0; j < distances.length; j++) {
      rand -= distances[j];
      if (rand <= 0) {
        centroids.push([...pixels[j]]);
        break;
      }
    }
  }
  
  return centroids;
}

function colorDistance(a, b) {
  // Use weighted Euclidean distance in RGB space
  // Weights based on human perception
  const rWeight = 0.299;
  const gWeight = 0.587;
  const bWeight = 0.114;
  
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  
  return Math.sqrt(
    rWeight * dr * dr +
    gWeight * dg * dg +
    bWeight * db * db
  );
}

function centroidsEqual(a, b) {
  return a.every((centroid, i) => 
    colorDistance(centroid, b[i]) < 1
  );
}

function drawPalette() {
  const swatchSize = 120;
  const startX = width - (swatchSize + 20);
  const startY = 60;
  
  // Title for palette
  fill(0);
  noStroke();
  textSize(24);
  text("Extracted Colors", width - (swatchSize + 20), 40);
  
  currentPalette.forEach((col, i) => {
    fill(col);
    noStroke();
    rect(startX, startY + (i * (swatchSize + 10)), swatchSize, swatchSize);
    
    if (mouseX > startX && mouseX < startX + swatchSize &&
        mouseY > startY + (i * (swatchSize + 10)) && 
        mouseY < startY + (i * (swatchSize + 10)) + swatchSize) {
      stroke(0, 0, 0, 0.2);
      strokeWeight(4);
      rect(startX, startY + (i * (swatchSize + 10)), swatchSize, swatchSize);
    }
  });
}

function displayColorInfo() {
  currentPalette.forEach((col, i) => {
    const swatchSize = 120;
    const startX = width - (swatchSize + 20);
    const startY = 60;
    
    if (mouseX > startX && mouseX < startX + swatchSize &&
        mouseY > startY + (i * (swatchSize + 10)) && 
        mouseY < startY + (i * (swatchSize + 10)) + swatchSize) {
      
      const r = red(col);
      const g = green(col);
      const b = blue(col);
      
      fill(0);
      noStroke();
      textSize(14);
      text(`RGB: ${floor(r)}, ${floor(g)}, ${floor(b)}`, 
           startX - 160, startY + (i * (swatchSize + 10)) + swatchSize/2);
    }
  });
}