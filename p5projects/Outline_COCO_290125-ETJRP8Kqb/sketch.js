// Variables to store model and video
let cocoModel;
let video;
let detectedObjects = [];

async function setup() {
  createCanvas(640, 480);
  // Initialize video capture but hide the actual feed
  video = createCapture(VIDEO, detectObjects);
  video.size(640, 480);
  video.hide();
  
  // Load COCO-SSD model
  cocoModel = await cocoSsd.load();
  console.log("COCO-SSD Model Loaded!");
}

function draw() {
  // White background instead of video feed
  background(255);
  
  // Draw simplified outlines for each detected object
  for (let i = 0; i < detectedObjects.length; i++) {
    let { bbox, class: label } = detectedObjects[i];
    let [x, y, w, h] = bbox;
    
    // Draw different outline styles based on object class
    stroke(0);
    noFill();
    strokeWeight(2);
    
    // Simplified shape drawing based on object type
    switch(label) {
      case 'person':
        // Draw simplified human figure
        drawHumanoid(x + w/2, y + h/2, h);
        break;
      case 'chair':
        // Simple chair outline
        drawChair(x, y, w, h);
        break;
      case 'laptop':
      case 'tv':
        // Simple rectangle with screen
        drawScreen(x, y, w, h);
        break;
      default:
        // Default to simple geometric outline
        drawSimpleOutline(x, y, w, h);
    }
  }
}

function drawHumanoid(centerX, centerY, height) {
  // Head
  ellipse(centerX, centerY - height/3, height/6);
  // Body
  line(centerX, centerY - height/4, centerX, centerY + height/4);
  // Arms
  line(centerX - height/4, centerY, centerX + height/4, centerY);
  // Legs
  line(centerX, centerY + height/4, centerX - height/6, centerY + height/2);
  line(centerX, centerY + height/4, centerX + height/6, centerY + height/2);
}

function drawChair(x, y, w, h) {
  // Back
  rect(x + w/4, y, w/2, h/2);
  // Seat
  rect(x, y + h/2, w, h/4);
  // Legs
  line(x, y + h*3/4, x, y + h);
  line(x + w, y + h*3/4, x + w, y + h);
}

function drawScreen(x, y, w, h) {
  rect(x, y, w, h);
  // Screen detail
  rect(x + w/10, y + h/10, w*8/10, h*8/10);
}

function drawSimpleOutline(x, y, w, h) {
  // Simple geometric representation
  beginShape();
  vertex(x, y + h/2);
  vertex(x + w/3, y);
  vertex(x + w*2/3, y);
  vertex(x + w, y + h/2);
  vertex(x + w*2/3, y + h);
  vertex(x + w/3, y + h);
  endShape(CLOSE);
}

async function detectObjects() {
  detectedObjects = await cocoModel.detect(video.elt);
  await tf.nextFrame();
  // Continue detection
  detectObjects();
}