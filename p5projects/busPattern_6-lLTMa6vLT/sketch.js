let colors;
let lineCount = 0;
let maxLines = 40;
let tileSize = 360; // Increased tile size
let tiles = [];
let randomParams = {};

function setup() {
  createCanvas(1080, 1080);
  
  colors = {
    primary: color(80, 0, 255),
    secondary: color(255, 0, 200),
    accent: color(0, 200, 255),
    background: color(240)
  };
  
  background(colors.background);
  strokeWeight(1);
  initializeTiles();
  generateRandomParameters();
}

function generateRandomParameters() {
  randomParams = {
    starPoints: floor(random(6, 12)),
    starTwist: random(1, 3),
    hyperCurve: random(0.5, 2),
    hyperWaves: floor(random(2, 6)),
    spiralDensity: random(1, 3),
    spiralArms: floor(random(3, 7)),
    crossDensity: random(0.5, 1.5),
    crossLayers: floor(random(2, 5))
  };
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
      
            drawCrossingPattern(numLines, colors.primary);

      break;
    case 1:
      drawHyperboloidPattern(numLines, colors.secondary);
      break;
    case 2:
      drawSpiralPattern(numLines, colors.accent);
      break;
    case 3:
      push()
      
      drawStarPattern(numLines, colors.primary);
      pop()
      break;
  }
}

function drawStarPattern(numLines, lineColor) {
  stroke(lineColor);
  let points = randomParams.starPoints;
  let radius = tileSize * 0.45; // Increased size
  
  for(let i = 0; i < numLines; i++) {
    let angle1 = (TWO_PI / points) * (i % points);
    let angle2 = (TWO_PI / points) * ((i + floor(randomParams.starTwist)) % points);
    
    let r1 = radius * (1 + sin(angle1 * 3) * 0.1);
    let r2 = radius * 0.2 * (1 + cos(angle2 * 2) * 0.1);
    
    let x1 = cos(angle1) * r1;
    let y1 = sin(angle1) * r1;
    let x2 = cos(angle2) * r2;
    let y2 = sin(angle2) * r2;
    
    line(x1, y1, x2, y2);
  }
}

function drawHyperboloidPattern(numLines, lineColor) {
  stroke(lineColor);
  let radius = tileSize * 0.45; // Increased size
  
  for(let i = 0; i < numLines; i++) {
    let t = i / maxLines;
    let angle = t * TWO_PI;
    
    let x1 = cos(angle) * radius;
    let y1 = sin(angle) * radius;
    let x2 = -cos(angle) * radius;
    let y2 = -sin(angle) * radius;
    
    let wave = sin(angle * randomParams.hyperWaves) * 
               (tileSize * 0.15) * randomParams.hyperCurve;
    
    line(x1 + wave, y1, x2 - wave, y2);
  }
}

function drawSpiralPattern(numLines, lineColor) {
  stroke(lineColor);
  let maxRadius = tileSize * 0.45; // Increased size
  
  for(let i = 0; i < numLines; i++) {
    let t = i / maxLines;
    let angle = t * TWO_PI * randomParams.spiralDensity;
    
    for(let arm = 0; arm < randomParams.spiralArms; arm++) {
      let armAngle = angle + (TWO_PI / randomParams.spiralArms) * arm;
      let radius = maxRadius * t;
      
      let x1 = cos(armAngle) * radius;
      let y1 = sin(armAngle) * radius;
      let x2 = cos(armAngle + PI) * radius;
      let y2 = sin(armAngle + PI) * radius;
      
      line(x1, y1, x2, y2);
      
      // Add crossing details
      if(i % 3 === 0) {
        let crossAngle = armAngle + PI/2;
        let crossRadius = radius * 0.5;
        let cx1 = cos(crossAngle) * crossRadius;
        let cy1 = sin(crossAngle) * crossRadius;
        let cx2 = cos(crossAngle + PI) * crossRadius;
        let cy2 = sin(crossAngle + PI) * crossRadius;
        line(cx1, cy1, cx2, cy2);
      }
    }
  }
}

function drawCrossingPattern(numLines, lineColor) {
  stroke(lineColor);
  let size = tileSize * 0.45; // Increased size
  
  for(let layer = 0; layer < randomParams.crossLayers; layer++) {
    let angleOffset = (TWO_PI / randomParams.crossLayers) * layer;
    
    for(let i = 0; i < numLines; i++) {
      let t = i / maxLines;
      let x = lerp(-size, size, t);
      let curve = size * sin(t * PI + angleOffset) * randomParams.crossDensity;
      
      line(x - curve/2, -size, x + curve/2, size);
      line(-size, x - curve/2, size, x + curve/2);
    }
  }
}

function mousePressed() {
  // Generate new random parameters
  generateRandomParameters();
  
  // Reset all tiles
  for(let tile of tiles) {
    tile.progress = 0;
    tile.phase = 0;
  }
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('random_curve_stitch_tiles', 'png');
  }
}