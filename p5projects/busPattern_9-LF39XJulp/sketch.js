let colors;
let lineCount = 0;
let maxLines = 60; // Increased for more detail
let tileSize = 360;
let tiles = [];

// At the top with other global variables
let globalProgress = 0;
let globalPhase = 0;
let pauseTimer = 0;
let pauseDuration = 180; // Number of frames to pause (60 frames = 1 second)


// Alpha values for each layer (0-255)
let alphas = {
  starPattern: 10,
  hyperPattern: 30,
  spiralPattern: 140,
  crossPattern: 100
};

// Geometric parameters
let params = {
  starPoints: 8,
  divisions: 16,
  innerRatio: 0.382, // Golden ratio reciprocal
  layers: 4
};

function setup() {
  createCanvas(1080, 1080);
  
  colors = {
    primary: {
      rgb: color(80, 0, 255),
      alpha: alphas.starPattern
    },
    secondary: {
      rgb: color(255, 0, 200),
      alpha: alphas.hyperPattern
    },
    accent: {
      rgb: color(0, 200, 255),
      alpha: alphas.spiralPattern
    },
    background: color(0)
  };
  
  background(colors.background);
  strokeWeight(1);
  initializeTiles();
}

function getColorWithAlpha(colorObj) {
  let c = colorObj.rgb;
  return color(red(c), green(c), blue(c), colorObj.alpha);
}

function initializeTiles() {
  tiles = [];
  for(let y = 0; y < height/tileSize + 1; y++) {
    for(let x = 0; x < width/tileSize + 1; x++) {
      tiles.push({
        x: x * tileSize,
        y: y * tileSize,
        progress: 0,
        phase: 0
      });
    }
  }
}

// Replace the tile drawing logic in draw() with:
function draw() {
  background(colors.background);
  
  // Update colors with current alpha values
  colors.primary.alpha = alphas.starPattern;
  colors.secondary.alpha = alphas.hyperPattern;
  colors.accent.alpha = alphas.spiralPattern;
  
  // Draw all tiles using global progress
  for(let tile of tiles) {
    push();
    translate(tile.x + tileSize/2, tile.y + tileSize/2);
    
    // Draw completed phases
    for(let p = 0; p < globalPhase; p++) {
      drawPattern(p, 1);
    }
    
    // Draw current generating phase
    if(globalPhase < 4) {
      drawPattern(globalPhase, globalProgress);
    }
    
    pop();
  }
  
  // Update global progress
  if(globalPhase < 4) {
    globalProgress += 0.02;
    if(globalProgress >= 1) {
      globalProgress = 0;
      globalPhase++;
    }
  } else if(pauseTimer < pauseDuration) {
    pauseTimer++;
  } else {
    // Reset everything
    globalPhase = 0;
    globalProgress = 0;
    pauseTimer = 0;
  }
}

function drawPattern(phase, progress) {
  let numLines = floor(maxLines * progress);
  
  switch(phase) {
    case 0:
      drawGeometricStar(numLines, getColorWithAlpha(colors.primary));
      break;
    case 1:
      drawSymmetricGrid(numLines, getColorWithAlpha(colors.secondary));
      break;
    case 2:
      drawMandala(numLines, getColorWithAlpha(colors.accent));
      break;
    case 3:
      let crossColor = color(red(colors.primary.rgb), 
                           green(colors.primary.rgb), 
                           blue(colors.primary.rgb), 
                           alphas.crossPattern);
      drawGeometricWeave(numLines, crossColor);
      break;
      case 4:
      drawMandala(numLines*0.5, getColorWithAlpha(colors.accent));
  }
}

function drawGeometricStar(numLines, lineColor) {
  stroke(lineColor);
  let radius = tileSize * 0.2;
  
  for(let i = 0; i < numLines; i++) {
    let angle = (TWO_PI / params.divisions) * i;
    for(let p = 0; p < params.starPoints; p++) {
      let pointAngle = (TWO_PI / params.starPoints) * p;
      let x1 = cos(angle + pointAngle) * radius;
      let y1 = sin(angle + pointAngle) * radius;
      let x2 = cos(angle + pointAngle + PI/params.starPoints) * (radius * params.innerRatio);
      let y2 = sin(angle + pointAngle + PI/params.starPoints) * (radius * params.innerRatio);
      line(x1, y1, x2, y2);
    }
  }
}

function drawSymmetricGrid(numLines, lineColor) {
  stroke(lineColor);
  let size = tileSize * 0.7;
  
  for(let i = 0; i < numLines; i++) {
    let t = i / maxLines;
    for(let layer = 0; layer < params.layers; layer++) {
      let angle = (PI / params.layers) * layer;
      push();
      rotate(angle);
      line(-size * t, -size, size * t, size);
      line(-size * t, size, size * t, -size);
      pop();
    }
  }
}

function drawMandala(numLines, lineColor) {
  stroke(lineColor);
  let radius = tileSize * 0.35;
  
  // Draw logarithmic spiral pattern
  for(let i = 0; i < numLines; i++) {
    let t = i / maxLines;
    let angle = t * TWO_PI * 3; // Multiple rotations
    let r1 = radius * pow(params.innerRatio, t);
    
    // Create multiple spiral arms
    for(let arm = 0; arm < params.starPoints; arm++) {
      let armAngle = angle + (TWO_PI / params.starPoints) * arm;
      let x1 = cos(armAngle) * r1;
      let y1 = sin(armAngle) * r1;
      
      // Create connecting lines between arms
      let nextArm = (arm + 1) % params.starPoints;
      let nextArmAngle = angle + (TWO_PI / params.starPoints) * nextArm;
      let x2 = cos(nextArmAngle) * r1;
      let y2 = sin(nextArmAngle) * r1;
      
      line(x1, y1, x2, y2);
      
      // Add perpendicular lines for texture
      if(i % 3 === 0) {
        let perpAngle = armAngle + PI/2;
        let perpLength = r1 * 0.2;
        let px = cos(perpAngle) * perpLength;
        let py = sin(perpAngle) * perpLength;
        line(x1, y1, x1 + px, y1 + py);
      }
    }
  }
}

function drawGeometricWeave(numLines, lineColor) {
  stroke(lineColor);
  let size = tileSize * 0.40;
  
  // Create curve stitch illusion using straight lines
  let points = 20; // Number of points on each side
  let spacing = size * 2 / points;
  
  // Draw lines from left side to bottom
  for(let i = 0; i < numLines; i++) {
    let progress = i / maxLines * points;
    if(progress < points) {
      let x1 = -size + (progress * spacing);
      let y1 = -size;
      let x2 = size;
      let y2 = -size + (progress * spacing);
      line(x1, y1, x2, y2);
    }
  }
  
  // Draw lines from top to right side
  for(let i = 0; i < numLines; i++) {
    let progress = i / maxLines * points;
    if(progress < points) {
      let x1 = size - (progress * spacing);
      let y1 = size;
      let x2 = -size;
      let y2 = size - (progress * spacing);
      line(x1, y1, x2, y2);
    }
  }
  
  // Add crossing lines for depth
  for(let i = 0; i < numLines; i++) {
    let progress = i / maxLines * points;
    if(progress < points) {
      let x1 = -size + (progress * spacing);
      let y1 = size;
      let x2 = -size;
      let y2 = size - (progress * spacing);
      line(x1, y1, x2, y2);
      
      let x3 = size - (progress * spacing);
      let y3 = -size;
      let x4 = size;
      let y4 = -size + (progress * spacing);
      line(x3, y3, x4, y4);
    }
  }
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('geometric_pattern', 'png');
  }
  
  // Alpha control keys remain the same
  if (key === '1') {
    alphas.starPattern = constrain(alphas.starPattern + 20, 0, 255);
  } else if (key === '!') {
    alphas.starPattern = constrain(alphas.starPattern - 20, 0, 255);
  }
  
  if (key === '2') {
    alphas.hyperPattern = constrain(alphas.hyperPattern + 20, 0, 255);
  } else if (key === '@') {
    alphas.hyperPattern = constrain(alphas.hyperPattern - 20, 0, 255);
  }
  
  if (key === '3') {
    alphas.spiralPattern = constrain(alphas.spiralPattern + 20, 0, 255);
  } else if (key === '#') {
    alphas.spiralPattern = constrain(alphas.spiralPattern - 20, 0, 255);
  }
  
  if (key === '4') {
    alphas.crossPattern = constrain(alphas.crossPattern + 20, 0, 255);
  } else if (key === '$') {
    alphas.crossPattern = constrain(alphas.crossPattern - 20, 0, 255);
  }
}

function mousePressed() {
  // Reset all tiles
  for(let tile of tiles) {
    tile.progress = 0;
    tile.phase = 0;
  }
}