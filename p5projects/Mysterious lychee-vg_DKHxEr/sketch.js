let capture;
const CANVAS_WIDTH = 1084;
const CANVAS_HEIGHT = 384;
const NUM_STAGES = 5;
const STAGE_WIDTH = CANVAS_WIDTH / NUM_STAGES;

// Thresholds from original code
const THRESHOLD_VVVLIGHT_GREY = 600;
const THRESHOLD_VVLIGHT_GREY = 500;
const THRESHOLD_VLIGHT_GREY = 400;
const THRESHOLD_LIGHT_GREY = 300;
const THRESHOLD_DARK_GREY = 200;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  capture = createCapture(VIDEO);
  capture.size(STAGE_WIDTH, CANVAS_HEIGHT);
  capture.hide();
}

function draw() {
  background(255);
  
  if (capture.loadedmetadata) {
    // Get the video feed
    let img = capture.get();
    
    // Draw original video
    image(img, 0, 0);
    drawLabel("Original", 0);
    
    // Stage 1: Dark Grey threshold only
    let stage1 = createStage(img, [THRESHOLD_DARK_GREY]);
    image(stage1, STAGE_WIDTH, 0);
    drawLabel("Dark Grey", STAGE_WIDTH);
    
    // Stage 2: Add Light Grey pattern
    let stage2 = createStage(img, [THRESHOLD_DARK_GREY, THRESHOLD_LIGHT_GREY]);
    image(stage2, STAGE_WIDTH * 2, 0);
    drawLabel("+ Light Grey", STAGE_WIDTH * 2);
    
    // Stage 3: Add Very Light Grey pattern
    let stage3 = createStage(img, [THRESHOLD_DARK_GREY, THRESHOLD_LIGHT_GREY, THRESHOLD_VLIGHT_GREY]);
    image(stage3, STAGE_WIDTH * 3, 0);
    drawLabel("+ Very Light", STAGE_WIDTH * 3);
    
    // Stage 4: Final with all patterns
    let stage4 = createStage(img, [THRESHOLD_DARK_GREY, THRESHOLD_LIGHT_GREY, THRESHOLD_VLIGHT_GREY, THRESHOLD_VVLIGHT_GREY]);
    image(stage4, STAGE_WIDTH * 4, 0);
    drawLabel("Final", STAGE_WIDTH * 4);
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
      
      let pixelValue = 255; // White by default
      
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
      
      // Set the pixel value
      stage.pixels[loc] = pixelValue;
      stage.pixels[loc + 1] = pixelValue;
      stage.pixels[loc + 2] = pixelValue;
    }
  }
  
  stage.updatePixels();
  return stage;
}

function drawLabel(text, x) {
  fill(0);
  noStroke();
  textSize(16);
  textAlign(CENTER);
  // text(text, x + STAGE_WIDTH/2, height - 20);
}