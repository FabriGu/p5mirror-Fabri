let colors;
let lineCount = 0;
let maxLines = 60; // Increased for more detail
let tileSize = 360;
let tiles = [];

// Alpha values for each layer (0-255)
let alphas = {
  starPattern: 150,
  hyperPattern: 10,
  spiralPattern: 140,
  crossPattern: 0.5
};

// Geometric parameters
let params = {
  starPoints: 8,
  divisions: 16,
  innerRatio: 0.382, // Golden ratio reciprocal
  layers: 5
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
    background: color(240)
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

function draw() {
  background(colors.background);
  
  // Update colors with current alpha values
  colors.primary.alpha = alphas.starPattern;
  colors.secondary.alpha = alphas.hyperPattern;
  colors.accent.alpha = alphas.spiralPattern;
  
  // Draw all tiles
  for(let tile of tiles) {
    push();
    translate(tile.x + tileSize/2, tile.y + tileSize/2);
    
    // Draw completed phases
    for(let p = 0; p < tile.phase; p++) {
      drawPattern(p, 1);
    }
    
    // Draw current generating phase
    if(tile.progress < 1) {
      drawPattern(tile.phase, tile.progress);
      tile.progress += 0.02;
      
      if(tile.progress >= 1) {
        tile.progress = 0;
        tile.phase++;
        if(tile.phase > 3) {
          tile.phase = 0;
        }
      }
    }
    
    pop();
  }
}

function drawPattern(phase, progress) {
  let numLines = floor(maxLines * progress);
  
  switch(phase) {
    case 0:
      
       let crossColor = color(red(colors.primary.rgb), 
                           green(colors.primary.rgb), 
                           blue(colors.primary.rgb), 
                           alphas.crossPattern);
            drawGeometricWeave(numLines, crossColor);

      
      break;
    case 1:
      drawSymmetricGrid(numLines, getColorWithAlpha(colors.secondary));
      break;
    case 2:
      // drawMandala(numLines, getColorWithAlpha(colors.accent));
     drawGeometricStar(numLines, getColorWithAlpha(colors.primary));
      break;
    // case 3:
    //   let crossColor = color(red(colors.primary.rgb), 
    //                        green(colors.primary.rgb), 
    //                        blue(colors.primary.rgb), 
    //                        alphas.crossPattern);
    //   break;
  }
}

function drawGeometricStar(numLines, lineColor) {
  stroke(lineColor);
  let radius = tileSize * 0.5;
  
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
  let size = tileSize * 0.55;
  
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
  let radius = tileSize * 0.6;
  
  for(let i = 0; i < numLines; i++) {
    let angle = (TWO_PI / params.divisions) * i;
    for(let j = 0; j < params.layers; j++) {
      let r1 = radius * (j / params.layers);
      let r2 = radius * ((j + 1) / params.layers);
      let x1 = cos(angle) * r1;
      let y1 = sin(angle) * r1;
      let x2 = cos(angle) * r2;
      let y2 = sin(angle) * r2;
      line(x1, y1, x2, y2);
      
      // Connect concentric layers
      if(i % 2 === 0) {
        let nextAngle = angle + TWO_PI / params.divisions;
        let x3 = cos(nextAngle) * r1;
        let y3 = sin(nextAngle) * r1;
        line(x1, y1, x3, y3);
      }
    }
  }
}

function drawGeometricWeave(numLines, lineColor) {
  stroke(lineColor);
  let size = tileSize * 0.55;
  
  for(let i = 0; i < numLines; i++) {
    let t = i / maxLines;
    let spacing = size / params.divisions;
    
    for(let j = 0; j < params.divisions; j++) {
      let pos = -size + j * spacing * 2;
      // Horizontal lines
      line(-size, pos * t, size, pos * t);
      // Vertical lines
      line(pos * t, -size, pos * t, size);
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