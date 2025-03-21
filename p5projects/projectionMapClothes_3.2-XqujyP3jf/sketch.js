let bodySegmentation;
let video;
let segmentation;
let overlayLayer;
let blackLayer;
let time = 0;
let videoWidth = 640;  // Base video capture size
let videoHeight = 480;
let scale = 1;

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
  outputStride: 32,
  flipped: true
};

function preload() {
  bodySegmentation = ml5.bodySegmentation("BodyPix", options);
}

function setup() {
  // Create canvas at window size
  createCanvas(windowWidth, windowHeight);
  
  // Calculate scale while maintaining aspect ratio
  const windowRatio = windowWidth / windowHeight;
  const videoRatio = videoWidth / videoHeight;
  
  if (windowRatio > videoRatio) {
    scale = windowHeight / videoHeight;
  } else {
    scale = windowWidth / videoWidth;
  }
  
  // Setup video capture at original resolution
  video = createCapture(VIDEO, {flipped: false});
  video.size(videoWidth, videoHeight);
  video.hide();
  
  // Create scaled graphics buffers
  overlayLayer = createGraphics(windowWidth, windowHeight);
  blackLayer = createGraphics(windowWidth, windowHeight);
  blackLayer.background(0);
  
  bodySegmentation.detectStart(video, gotResults);
}

function windowResized() {
  // Resize canvas and recalculate scale
  resizeCanvas(windowWidth, windowHeight);
  
  const windowRatio = windowWidth / windowHeight;
  const videoRatio = videoWidth / videoHeight;
  
  if (windowRatio > videoRatio) {
    scale = windowHeight / videoHeight;
  } else {
    scale = windowWidth / videoWidth;
  }
  
  // Resize graphics buffers
  overlayLayer = createGraphics(windowWidth, windowHeight);
  blackLayer = createGraphics(windowWidth, windowHeight);
  blackLayer.background(0);
}

function draw() {
  // Start with black background
  background(0);
  
  // Update pattern
  drawPattern(overlayLayer);
  
  if (segmentation) {
    // Get the filtered mask
    let maskCanvas = segmentation.mask.canvas;
    let maskContext = segmentation.mask.drawingContext;
    
    // Create a new canvas for the filtered mask
    let filteredMask = document.createElement('canvas');
    filteredMask.width = videoWidth;
    filteredMask.height = videoHeight;
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
    
    // Calculate centered position for scaled video
    const x = (windowWidth - videoWidth * scale) / 2;
    const y = (windowHeight - videoHeight * scale) / 2;
    
    // Use the filtered mask to show pattern only in colored areas
    drawingContext.globalCompositeOperation = 'destination-in';
    drawingContext.save();
    drawingContext.translate(x, y);
    drawingContext.scale(scale, scale);
    drawingContext.drawImage(filteredMask, 0, 0);
    drawingContext.restore();
    drawingContext.globalCompositeOperation = 'source-over';
  }
  
  // Update time for animation
  time += 1.1;
}

function drawPattern(pg) {
  pg.clear(); // Clear the graphics buffer
  const gridSize = 16;
  const cellWidth = pg.width / gridSize;
  const cellHeight = pg.height / gridSize;
  
  for (let i = 0; i < gridSize * gridSize; i++) {
    const x = i % gridSize;
    const y = Math.floor(i / gridSize);
    
    // Create wave-like movements
    const offsetX = Math.sin((time + x * 25) * Math.PI / 120) * 2;
    const offsetY = Math.cos((time + y * 25) * Math.PI / 120) * 2;
    
    // Create dynamic hue values
    const baseHue1 = (time) % 360;
    const baseHue2 = (baseHue1 + 80) % 360;
    
    // Calculate colors using HSL
    const sat = 70;
    const light1 = 50 + offsetX * 10;
    const light2 = 50 + offsetY * 10;
    
    // Convert HSL to RGB for color1
    const h1 = baseHue1 / 360;
    const s1 = sat / 100;
    const l1 = light1 / 100;
    const color1 = hslToRgb(h1, s1, l1);
    
    // Convert HSL to RGB for color2
    const h2 = baseHue2 / 360;
    const s2 = sat / 100;
    const l2 = light2 / 100;
    const color2 = hslToRgb(h2, s2, l2);
    
    // Draw rectangle with interpolated color
    const t = (Math.sin(time * 0.05 + x * 0.2 + y * 0.2) + 1) * 0.5;
    const r = lerp(color1[0], color2[0], t);
    const g = lerp(color1[1], color2[1], t);
    const b = lerp(color1[2], color2[2], t);
    
    pg.fill(r * 255, g * 255, b * 255);
    pg.noStroke();
    pg.rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
  }
}

// Helper function to convert HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r, g, b];
}

// Helper function for linear interpolation
function lerp(start, end, amt) {
  return start * (1 - amt) + end * amt;
}

function gotResults(result) {
  segmentation = result;
}