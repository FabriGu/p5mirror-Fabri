let video;
let processedFrames = [];
const targetWidth = 32;
const targetHeight = 24;
let isProcessing = false;
let videoBuffer;
let videoDimensions = { width: 0, height: 0 };

function setup() {
  createCanvas(1200, 800);
  
  const fileInput = createFileInput(handleFile);
  fileInput.position(10, 10);
  
  const saveButton = createButton('Save Processed Data');
  saveButton.position(10, 40);
  saveButton.mousePressed(saveData);
  
  const debugButton = createButton('Toggle Debug View');
  debugButton.position(10, 70);
  pixelDensity(1)
}

function handleFile(file) {
  if (file.type === 'video') {
    processedFrames = [];
    currentFrame = 0;
    
    video = createVideo(file.data, () => {
      console.log('Video loaded');
      videoDimensions.width = video.width;
      videoDimensions.height = video.height;
      
      // Create buffer with same aspect ratio as target grid
      let bufferWidth = video.width;
      let bufferHeight = video.height;
      videoBuffer = createGraphics(bufferWidth, bufferHeight);
      
      video.hide();
      video.loop();
      isProcessing = true;
    });
  }
}

function draw() {
  background(20);
  
  if (isProcessing && video && videoBuffer) {
    // Draw video to buffer
    videoBuffer.clear();
    videoBuffer.image(video, 0, 0, videoBuffer.width, videoBuffer.height);
    videoBuffer.loadPixels();
    
    // Calculate centered crop region
    let videoAspect = videoBuffer.width / videoBuffer.height;
    let targetAspect = targetWidth / targetHeight;
    
    let cropWidth, cropHeight, startX, startY;
    if (videoAspect > targetAspect) {
      // Video is wider - crop width
      cropHeight = videoBuffer.height;
      cropWidth = cropHeight * targetAspect;
      startY = 0;
      startX = (videoBuffer.width - cropWidth) / 2;
    } else {
      // Video is taller - crop height
      cropWidth = videoBuffer.width;
      cropHeight = cropWidth / targetAspect;
      startX = 0;
      startY = (videoBuffer.height - cropHeight) / 2;
    }
    
    // Process frame
    let frameData = new Array(targetWidth * targetHeight);
    let cellWidth = cropWidth / targetWidth;
    let cellHeight = cropHeight / targetHeight;
    
    // Calculate frame brightness range for adaptive thresholding
    let minBrightness = 255;
    let maxBrightness = 0;
    
    // First pass - get brightness range
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        let pixelX = startX + x * cellWidth;
        let pixelY = startY + y * cellHeight;
        
        let brightness = sampleRegion(pixelX, pixelY, cellWidth, cellHeight);
        minBrightness = min(minBrightness, brightness);
        maxBrightness = max(maxBrightness, brightness);
      }
    }
    
    // Second pass - apply adaptive threshold
    let threshold = minBrightness + (maxBrightness - minBrightness) * 0.5;
    
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        let pixelX = startX + x * cellWidth;
        let pixelY = startY + y * cellHeight;
        
        let brightness = sampleRegion(pixelX, pixelY, cellWidth, cellHeight);
        frameData[x + y * targetWidth] = brightness < threshold ? 1 : 0;
      }
    }
    
    // Only save unique frames
    if (processedFrames.length === 0 || 
        !arraysEqual(frameData, processedFrames[processedFrames.length - 1])) {
      processedFrames.push(frameData);
    }
    
    // Debug visualization
    drawDebugView(frameData);
  }
}

function sampleRegion(startX, startY, width, height) {
  let brightness = 0;
  let samples = 0;
  
  // Sample a grid of points in the region
  let sampleCount = 5; // Take 5x5 samples per cell
  let stepX = width / sampleCount;
  let stepY = height / sampleCount;
  
  for (let sy = 0; sy < sampleCount; sy++) {
    for (let sx = 0; sx < sampleCount; sx++) {
      let px = Math.floor(startX + sx * stepX);
      let py = Math.floor(startY + sy * stepY);
      
      if (px >= 0 && px < videoBuffer.width && py >= 0 && py < videoBuffer.height) {
        let index = 4 * (py * videoBuffer.width + px);
        let r = videoBuffer.pixels[index];
        let g = videoBuffer.pixels[index + 1];
        let b = videoBuffer.pixels[index + 2];
        // Weight green channel more as it's better for skin tones
        brightness += (r * 0.299 + g * 0.587 + b * 0.114);
        samples++;
      }
    }
  }
  
  return brightness / samples;
}

function drawDebugView(frameData) {
  // Draw original video
  let vidWidth = 400;
  let vidHeight = (vidWidth * videoDimensions.height) / videoDimensions.width;
  image(video, 20, 100, vidWidth, vidHeight);
  
  // Draw processed preview
  let previewX = vidWidth + 60;
  let cellSize = min(20, (width - previewX - 20) / targetWidth);
  
  push();
  stroke(50);
  strokeWeight(1);
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      let index = x + y * targetWidth;
      fill(frameData[index] * 255);
      rect(previewX + x * cellSize, 100 + y * cellSize, 
           cellSize - 1, cellSize - 1);
    }
  }
  pop();
  
  // Draw info
  fill(255);
  noStroke();
  textSize(14);
  text('Original Video', 20, 90);
  text('Processed Preview (Grid: ' + targetWidth + 'x' + targetHeight + ')', previewX, 90);
  text('Video dimensions: ' + videoDimensions.width + 'x' + videoDimensions.height, 20, height - 40);
  text('Frames captured: ' + processedFrames.length, 20, height - 20);
}

function arraysEqual(a, b) {
  return a.length === b.length && 
         a.every((val, index) => val === b[index]);
}

function saveData() {
  if (processedFrames.length > 0) {
    let output = {
      width: targetWidth,
      height: targetHeight,
      frames: processedFrames
    };
    saveJSON(output, 'wave_animation_data.json');
    console.log('Saved ' + processedFrames.length + ' unique frames');
  }
}

function keyPressed() {
  if (key === ' ' && video) {
    if (video.isPlaying()) {
      video.pause();
      isProcessing = false;
    } else {
      video.play();
      isProcessing = true;
    }
  }
}