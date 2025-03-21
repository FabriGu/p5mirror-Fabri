let capture;
const NUM_STAGES = 5; // Including original
let stageWidth, stageHeight;
const PADDING = 10; // Space between stages

// Thresholds from original code
const THRESHOLD_VVVLIGHT_GREY = 600;
const THRESHOLD_VVLIGHT_GREY = 500;
const THRESHOLD_VLIGHT_GREY = 400;
const THRESHOLD_LIGHT_GREY = 300;
const THRESHOLD_DARK_GREY = 200;

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.hide();
  
  calculateDimensions();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateDimensions();
}

function calculateDimensions() {
  // Calculate available width for all stages including padding
  const totalAvailableWidth = windowWidth - (PADDING * (NUM_STAGES + 1));
  
  // Calculate stage width maintaining 4:3 aspect ratio
  stageWidth = totalAvailableWidth / NUM_STAGES;
  stageHeight = stageWidth * (3/4);
  
  // If height is too tall, recalculate based on height
  if (stageHeight > windowHeight - PADDING * 2) {
    stageHeight = windowHeight - PADDING * 2;
    stageWidth = stageHeight * (4/3);
  }
  
  // Resize capture to match stage size
  capture.size(stageWidth, stageHeight);
}

function draw() {
  background(50);
  
  if (capture.loadedmetadata) {
    let img = capture.get();
    
    // Calculate starting X position to center all stages
    let totalWidth = (stageWidth * NUM_STAGES) + (PADDING * (NUM_STAGES - 1));
    let startX = (windowWidth - totalWidth) / 2;
    
    // Calculate Y position to center vertically
    let startY = (windowHeight - stageHeight) / 2;
    
    // Draw original
    image(img, startX, startY, stageWidth, stageHeight);
    drawLabel("Original", startX, stageWidth);
    
    // Draw each processing stage
    let x = startX + stageWidth + PADDING;
    
    // Stage 1: Dark Grey threshold only
    let stage1 = createStage(img, [THRESHOLD_DARK_GREY]);
    image(stage1, x, startY, stageWidth, stageHeight);
    drawLabel("Dark Grey", x, stageWidth);
    x += stageWidth + PADDING;
    
    // Stage 2: Add Light Grey pattern
    let stage2 = createStage(img, [THRESHOLD_DARK_GREY, THRESHOLD_LIGHT_GREY]);
    image(stage2, x, startY, stageWidth, stageHeight);
    drawLabel("+ Light Grey", x, stageWidth);
    x += stageWidth + PADDING;
    
    // Stage 3: Add Very Light Grey pattern
    let stage3 = createStage(img, [THRESHOLD_DARK_GREY, THRESHOLD_LIGHT_GREY, THRESHOLD_VLIGHT_GREY]);
    image(stage3, x, startY, stageWidth, stageHeight);
    drawLabel("+ Very Light", x, stageWidth);
    x += stageWidth + PADDING;
    
    // Stage 4: Final with all patterns
    let stage4 = createStage(img, [THRESHOLD_DARK_GREY, THRESHOLD_LIGHT_GREY, THRESHOLD_VLIGHT_GREY, THRESHOLD_VVLIGHT_GREY]);
    image(stage4, x, startY, stageWidth, stageHeight);
    drawLabel("Final", x, stageWidth);
  }
}

function createStage(img, thresholds) {
  let stage = createImage(img.width, img.height);
  stage.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
  stage.loadPixels();
  
  for (let y = 0; y < stage.height; y++) {
    for (let x = 0; x < stage.width; x++) {
      let loc = (x + y * stage.width) * 4;
      let r = stage.pixels[loc];
      let g = stage.pixels[loc + 1];
      let b = stage.pixels[loc + 2];
      let rgb = Math.floor(r + g + b);
      
      let pixelValue = 255;
      
      // Apply thresholds in order
      for (let threshold of thresholds) {
        if (threshold === THRESHOLD_DARK_GREY && rgb < THRESHOLD_DARK_GREY) {
          pixelValue = 0;
        } else if (threshold === THRESHOLD_LIGHT_GREY && 
                   rgb < THRESHOLD_LIGHT_GREY &&
                   ((x % 4 === 0 && y % 4 === 0) || (x % 4 === 2 && y % 4 === 2))) {
          pixelValue = 0;
        } else if (threshold === THRESHOLD_VLIGHT_GREY && 
                   rgb < THRESHOLD_VLIGHT_GREY &&
                   ((x % 5 === 0 && y % 5 === 0) || (x % 5 === 3 && y % 5 === 3))) {
          pixelValue = 0;
        } else if (threshold === THRESHOLD_VVLIGHT_GREY && 
                   rgb < THRESHOLD_VVLIGHT_GREY &&
                   ((x % 6 === 0 && y % 6 === 0) || (x % 6 === 3 && y % 6 === 3))) {
          pixelValue = 0;
        }
      }
      
      stage.pixels[loc] = pixelValue;
      stage.pixels[loc + 1] = pixelValue;
      stage.pixels[loc + 2] = pixelValue;
    }
  }
  
  stage.updatePixels();
  return stage;
}

function drawLabel(text, x, width) {
  fill(255);
  noStroke();
  textSize(16);
  textAlign(CENTER);
  // text(text, x + width/2, windowHeight - 20);
}