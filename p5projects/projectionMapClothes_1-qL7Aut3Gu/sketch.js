let bodySegmentation;
let video;
let segmentation;
let overlayLayer;

// Target colors from BodyPix segmentation
const targetParts = [
  // [110, 64, 170], //left face
  // [143, 61, 178], // right face
  [178, 60, 178], // left_upper_arm_front
  [210, 62, 167], // left_upper_arm_back
  [238, 67, 149], // right_upper_arm_front
  [255, 78, 125], // right_upper_arm_back
  [255, 94, 99],  // left_lower_arm_front
  [255, 115, 75], // left_lower_arm_back
  [255, 140, 56], // right_lower_arm_front
  [239, 167, 47], // right_lower_arm_back
  // [217, 194, 49], // left_hand
  // [194, 219, 64], // right_hand
  [175, 240, 91], // torso_front
  [135, 245, 87], // torso_back
  [96, 247, 96],  // left_upper_leg_front
  [64, 243, 115], // left_upper_leg_back
  [40, 234, 141], // right_upper_leg_front
  [28, 219, 169], // right_upper_leg_back
  [26, 199, 194], // left_lower_leg_front
  [33, 176, 213], // left_lower_leg_back
  [47, 150, 224], // right_lower_leg_front
  [65, 125, 224], // right_lower_leg_back
  [84, 101, 214], // left_foot
  [99, 81, 195]   // right_foot
];

let options = {
  maskType: "parts",
  architecture: "ResNet50",
  outputStride: 32
};

function preload() {
  bodySegmentation = ml5.bodySegmentation("BodyPix", options);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped:true});
  video.size(640, 480);
  video.hide();
  
  overlayLayer = createGraphics(width, height);
  drawPattern(overlayLayer);
  
  bodySegmentation.detectStart(video, gotResults);
}

function draw() {
  background(0);
  image(video, 0, 0);
  
  if (segmentation) {
    // Get the filtered mask
    let maskCanvas = segmentation.mask.canvas;
    let maskContext = segmentation.mask.drawingContext;
    
    // Create a new canvas for the filtered mask
    let filteredMask = document.createElement('canvas');
    filteredMask.width = maskCanvas.width;
    filteredMask.height = maskCanvas.height;
    let filteredContext = filteredMask.getContext('2d');
    
    // Copy and flip the mask
    filteredContext.translate(filteredMask.width, 0);
    filteredContext.scale(-1, 1);
    filteredContext.drawImage(maskCanvas, 0, 0);
    
    // Get image data
    let imageData = filteredContext.getImageData(0, 0, filteredMask.width, filteredMask.height);
    let data = imageData.data;
    
    // Filter the pixels - we only want to show pattern in colored areas
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      // Check if this pixel matches any target colors
      let isTargetColor = targetParts.some(color => 
        r === color[0] && g === color[1] && b === color[2]
      );
      
      // Make all pixels transparent except target colors
      if (!isTargetColor || (r === 255 && g === 255 && b === 255)) {
        data[i + 3] = 0;  // Full transparency
      } else {
        // Keep colored areas visible
        data[i + 3] = 255;  // Full opacity
      }
    }
    
    // Update the filtered mask
    filteredContext.putImageData(imageData, 0, 0);
    
    // Draw the pattern
    image(overlayLayer, 0, 0);
    
    // Use the filtered mask to show pattern only in colored areas
    drawingContext.globalCompositeOperation = 'destination-in';
    drawingContext.drawImage(filteredMask, 0, 0);
    drawingContext.globalCompositeOperation = 'source-over';
  }
}

function drawPattern(pg) {
  pg.background(0, 0);  // Transparent background
  let size = 30;  // Size of pattern elements
  
  let col1 = pg.color(255, 0, 0);  // Red
  let col2 = pg.color(140, 0, 0);  // Blue
  
  for (let y = 0; y < pg.height + size; y += size/2) {
    for (let x = 0; x < pg.width + size; x += size) {
      if ((Math.floor(x/size) + Math.floor(y/(size/2))) % 2 === 0) {
        pg.fill(col1);
      } else {
        pg.fill(col2);
      }
      pg.noStroke();
      
      // Draw diamond
      pg.quad(
        x - size/2, y,
        x, y - size/4,
        x + size/2, y,
        x, y + size/4
      );
    }
  }
}

function gotResults(result) {
  segmentation = result;
}