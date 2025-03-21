// Pattern configuration
const CONFIG = {
  // Base pattern properties
  baseRadius: 100,           // Base radius of the pattern
  rotationSpeed: 0.02,       // Speed of pattern rotation
  opacity: 1,             // Line opacity (0-1)
  strokeWeight: 3,          // Line thickness
  maxRotations: 50,        // Number of rotations before stopping
  
  // Pattern ratios (for creating stable, repeating patterns)
  innerRatio: 13/17,        // Ratio for inner rotation (use rational numbers)
  outerRatio: 19/23,        // Ratio for outer rotation
  
  // Color properties
  colorSpeed: 0.1,          // Speed of color change
  saturation: 255,           // Color saturation (0-100)
  brightness: 255,           // Color brightness (0-100)
  
  // Pattern modifiers
  frequency1: 40,            // Primary frequency multiplier
  frequency2: 8,            // Secondary frequency multiplier
  amplitude1: 200,           // Primary wave amplitude
  amplitude2: 100,           // Secondary wave amplitude
  
  patternType: 'loop'  // Options: 'flower', 'spiral', 'star', 'geometric', 'loop'
};

// Animation state
let time = 0;
let currentHue = 0;
let pattern = [];
let centerX, centerY;

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100, 1);
  centerX = width / 2;
  centerY = height / 2;
  background(0)
  
}

function draw() {
  // background(0, 0.01);
  translate(centerX, centerY);
  
  const points = generatePattern();
  drawPattern(points);
  
  // Update state
  pattern = points;
  currentHue = (currentHue + CONFIG.colorSpeed) % 360;
  time += CONFIG.rotationSpeed;
  
  // Stop after completing specified rotations
  if (time > TWO_PI * CONFIG.maxRotations) {
    noLoop();
  }
}

function generatePattern() {
  const points = [];
  
  // Calculate base rotations using ratios
  const innerRotation = time * CONFIG.innerRatio;
  const outerRotation = time * CONFIG.outerRatio;
  
  switch(CONFIG.patternType) {
    case 'geometric':
      generateGeometricPattern(points, innerRotation, outerRotation);
      break;
    case 'star':
      generateStarPattern(points, innerRotation, outerRotation);
      break;
    case 'flower':
      generateFlowerPattern(points, innerRotation, outerRotation);
      break;
    case 'loop':
      generateLoopPattern(points, innerRotation, outerRotation);
      break;
    case 'spiral':
      generateSpiralPattern(points, innerRotation, outerRotation);
      break;
  }
  
  return points;
}

function generateGeometricPattern(points, innerRot, outerRot) {
  const numPoints = 6;
  for(let i = 0; i < numPoints; i++) {
    const angle = (TWO_PI * i / numPoints) + innerRot;
    const radius = CONFIG.baseRadius + CONFIG.amplitude1 * sin(CONFIG.frequency1 * outerRot);
    
    const point = {
      x: radius * cos(angle) + CONFIG.amplitude2 * cos(CONFIG.frequency2 * outerRot),
      y: radius * sin(angle) + CONFIG.amplitude2 * sin(CONFIG.frequency2 * outerRot)
    };
    points.push(point);
  }
}

function generateStarPattern(points, innerRot, outerRot) {
  const numPoints = 6;
  for(let i = 0; i < numPoints; i++) {
    const radius1 = CONFIG.baseRadius + CONFIG.amplitude1 * sin(CONFIG.frequency1 * innerRot);
    const radius2 = CONFIG.baseRadius + CONFIG.amplitude1 * cos(CONFIG.frequency2 * outerRot);

    const point = {
      x: radius1 * cos(innerRot) + radius2 * cos(outerRot),
      y: radius1 * sin(innerRot) + radius2 * sin(outerRot)
    };
    points.push(point);
 }
}

function generateFlowerPattern(points, innerRot, outerRot) {
  const baseRadius = CONFIG.baseRadius * (1 + 0.3 * sin(CONFIG.frequency1 * innerRot));
  
  const point = {
    x: baseRadius * cos(outerRot) + CONFIG.amplitude2 * cos(CONFIG.frequency2 * innerRot),
    y: baseRadius * sin(outerRot) + CONFIG.amplitude2 * sin(CONFIG.frequency2 * innerRot)
  };
  points.push(point);
}

function generateSpiralPattern(points, innerRot, outerRot) {
  const spiral = 1 - 0.1 * (sin(innerRot) + 1) / 2; // Oscillates between 0.9 and 1
  const radius = CONFIG.baseRadius * spiral;
  
  const point = {
    x: radius * cos(CONFIG.frequency1 * outerRot),
    y: radius * sin(CONFIG.frequency1 * outerRot)
  };
  points.push(point);
}

function generateLoopPattern(points, innerRot, outerRot) {
  const radius = CONFIG.baseRadius * (1 + 0.2 * sin(CONFIG.frequency1 * innerRot));
  
  const point = {
    x: radius * cos(outerRot) + CONFIG.amplitude1 * cos(CONFIG.frequency2 * innerRot),
    y: radius * sin(outerRot) + CONFIG.amplitude1 * sin(CONFIG.frequency2 * innerRot)
  };
  points.push(point);
}

function drawPattern(points) {
  stroke(currentHue, CONFIG.saturation, CONFIG.brightness, CONFIG.opacity);
  strokeWeight(CONFIG.strokeWeight);
  
  for(let i = 0; i < points.length; i++) {
    if(pattern.length > i) {
      line(points[i].x, points[i].y, pattern[i].x, pattern[i].y);
    }
  }
}