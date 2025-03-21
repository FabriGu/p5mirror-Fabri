let colors;
let phase = 0;
let lineCount = 0;
let maxLines = 40;
let rotationAngle = 0;
let patternSize = 200;

function setup() {
  createCanvas(1080, 1080);
  
  colors = {
    primary: color(80, 0, 255),
    secondary: color(255, 0, 200),
    background: color(240)
  };
  
  background(colors.background);
  strokeWeight(1);
  
  translate(width/2, height/2);
}

function draw() {
  translate(width/2, height/2);
  
  // Draw multiple lines per frame for smoother animation
  for(let i = 0; i < 3; i++) {
    if (lineCount < maxLines) {
      drawNextLines();
    }
  }
  
  // Reset and start new pattern with rotation when complete
  if (lineCount >= maxLines) {
    if (phase < 3) {
      phase++;
      lineCount = 0;
    } else {
      phase = 0;
      lineCount = 0;
      rotationAngle += PI/4;
      if (rotationAngle >= TWO_PI) {
        rotationAngle = 0;
        background(colors.background);
      }
    }
  }
}

function drawNextLines() {
  push();
  rotate(rotationAngle);
  
  let progress = lineCount / maxLines;
  let t = progress * PI/2;
  
  switch(phase) {
    case 0:
      drawCurveStitchStar(t, colors.primary);
      break;
    case 1:
      drawCurveStitchDiamond(t, colors.secondary);
      break;
    case 2:
      drawCurveStitchHyperbola(t, colors.primary);
      break;
    case 3:
      drawCurveStitchSpiral(t, colors.secondary);
      break;
  }
  
  pop();
  lineCount++;
}

function drawCurveStitchStar(t, lineColor) {
  stroke(lineColor);
  let points = 6;
  for(let i = 0; i < points; i++) {
    let angle = (TWO_PI / points) * i;
    let x1 = cos(angle) * patternSize;
    let y1 = sin(angle) * patternSize;
    let x2 = cos(angle + t) * (patternSize * 0.2);
    let y2 = sin(angle + t) * (patternSize * 0.2);
    line(x1, y1, x2, y2);
  }
}

function drawCurveStitchDiamond(t, lineColor) {
  stroke(lineColor);
  let size = patternSize * 0.7;
  
  // Draw lines from corners to create diamond illusion
  for(let i = 0; i <= maxLines; i++) {
    let progress = i / maxLines;
    if(progress <= t) {
      let x1 = lerp(-size, 0, progress);
      let y1 = -size;
      let x2 = size;
      let y2 = lerp(-size, 0, progress);
      line(x1, y1, x2, y2);
      
      // Mirror the lines for symmetry
      line(-x1, y1, -x2, y2);
      line(x1, -y1, x2, -y2);
      line(-x1, -y1, -x2, -y2);
    }
  }
}

function drawCurveStitchHyperbola(t, lineColor) {
  stroke(lineColor);
  let size = patternSize * 0.8;
  
  for(let i = 0; i <= maxLines; i++) {
    let progress = i / maxLines;
    if(progress <= t) {
      let x = lerp(-size/2, size/2, progress);
      let y1 = -size;
      let y2 = size;
      
      // Create curved effect through line intersections
      let curve = size * 0.3 * sin(progress * PI);
      line(x - curve, y1, x + curve, y2);
      line(-x - curve, y1, -x + curve, y2);
    }
  }
}

function drawCurveStitchSpiral(t, lineColor) {
  stroke(lineColor);
  let size = patternSize * 0.6;
  
  for(let i = 0; i <= maxLines; i++) {
    let progress = i / maxLines;
    if(progress <= t) {
      let angle = progress * TWO_PI * 2;
      let radius = size * progress;
      let x1 = cos(angle) * radius;
      let y1 = sin(angle) * radius;
      let x2 = cos(angle + PI) * radius;
      let y2 = sin(angle + PI) * radius;
      
      line(x1, y1, x2, y2);
      
      // Add crossing lines for more complexity
      let crossAngle = angle + PI/2;
      let x3 = cos(crossAngle) * radius * 0.8;
      let y3 = sin(crossAngle) * radius * 0.8;
      let x4 = cos(crossAngle + PI) * radius * 0.8;
      let y4 = sin(crossAngle + PI) * radius * 0.8;
      line(x3, y3, x4, y4);
    }
  }
}

function mousePressed() {
  // Reset pattern on click
  background(colors.background);
  phase = 0;
  lineCount = 0;
  rotationAngle = 0;
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('curve_stitch_pattern', 'png');
  }
}