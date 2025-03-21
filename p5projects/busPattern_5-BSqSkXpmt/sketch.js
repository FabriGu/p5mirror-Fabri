let colors;
let lineCount = 0;
let maxLines = 40;
let tileSize = 200;
let phase = 0;
let tiles = [];

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
  
  // Create tile grid
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
      drawStarPattern(numLines, colors.primary);
      break;
  }
}

function drawStarPattern(numLines, lineColor) {
  stroke(lineColor);
  let points = 8; // Increased number of points
  let innerRadius = tileSize * 0.1;
  let outerRadius = tileSize * 0.4;
  
  for(let i = 0; i < numLines; i++) {
    let angle1 = (TWO_PI / points) * (i % points);
    let angle2 = (TWO_PI / points) * ((i + 2) % points);
    
    let x1 = cos(angle1) * outerRadius;
    let y1 = sin(angle1) * outerRadius;
    let x2 = cos(angle2) * innerRadius;
    let y2 = sin(angle2) * innerRadius;
    
    line(x1, y1, x2, y2);
  }
}

function drawHyperboloidPattern(numLines, lineColor) {
  stroke(lineColor);
  
  for(let i = 0; i < numLines; i++) {
    let t = i / maxLines;
    let angle = t * TWO_PI;
    
    // Create multiple curved surfaces
    let radius = tileSize * 0.35;
    let x1 = cos(angle) * radius;
    let y1 = sin(angle) * radius;
    let x2 = -cos(angle) * radius;
    let y2 = -sin(angle) * radius;
    
    // Add wave effect
    let wave = sin(angle * 3) * 20;
    line(x1 + wave, y1, x2 - wave, y2);
  }
}

function drawSpiralPattern(numLines, lineColor) {
  stroke(lineColor);
  
  for(let i = 0; i < numLines; i++) {
    let t = i / maxLines;
    let angle = t * TWO_PI * 2;
    let radius = tileSize * 0.3 * t;
    
    let x1 = cos(angle) * radius;
    let y1 = sin(angle) * radius;
    let x2 = cos(angle + PI) * radius;
    let y2 = sin(angle + PI) * radius;
    
    // Add crossing lines
    line(x1, y1, x2, y2);
    
    // Add perpendicular lines for more complexity
    let perpAngle = angle + PI/2;
    let x3 = cos(perpAngle) * radius * 0.5;
    let y3 = sin(perpAngle) * radius * 0.5;
    let x4 = cos(perpAngle + PI) * radius * 0.5;
    let y4 = sin(perpAngle + PI) * radius * 0.5;
    line(x3, y3, x4, y4);
  }
}

function drawCrossingPattern(numLines, lineColor) {
  stroke(lineColor);
  
  for(let i = 0; i < numLines; i++) {
    let t = i / maxLines;
    let size = tileSize * 0.4;
    
    // Create diamond grid effect
    let x = lerp(-size, size, t);
    let curve = size * sin(t * PI);
    
    line(x - curve/2, -size, x + curve/2, size);
    line(-x - curve/2, -size, -x + curve/2, size);
    
    // Add intersecting lines
    let y = lerp(-size, size, t);
    line(-size, y - curve/2, size, y + curve/2);
    line(-size, -y - curve/2, size, -y + curve/2);
  }
}

function mousePressed() {
  // Reset all tiles
  for(let tile of tiles) {
    tile.progress = 0;
    tile.phase = 0;
  }
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('curve_stitch_tiles', 'png');
  }
}