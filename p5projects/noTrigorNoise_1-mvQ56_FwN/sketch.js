let largeSquares = [];
let smallSquares = [];
let time = 0;
let baseHue = 0;

function createSquares(radius, array, steps) {
  let step = steps;
  for (let x = -radius; x <= radius; x += step) {
    for (let y = -radius; y <= radius; y += step) {
      let dx = x;
      let dy = y;
      let distance = sqrt(dx * dx + dy * dy);
      
      if (distance <= (radius + 1)) {
        let angle = 0;
        if (dx !== 0 || dy !== 0) {
          if (dx === 0) {
            angle = dy > 0 ? 0.5 : 1.5;
          } else {
            let slope = dy / dx;
            angle = (dx > 0) ? (slope / (4 + abs(slope))) : (2 + slope / (4 + abs(slope)));
          }
        }
        
        array.push({
          x: x,
          y: y,
          sizeC: steps, // Scale size relative to radius
          distance: distance,
          angle: angle,
          hueOffset: (distance / radius) * 90
        });
      }
    }
  }
}

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100);
  
  // Create large circle
  // rotate(HALF_PI)
  createSquares(width/2, largeSquares, 10);
  
  // Create small circle (half size)
  push()
  
  // createSquares(width/3, smallSquares, 10);
  pop()
  // createSquares(width/5, smallSquares, 20);
}

function draw() {
  background(0, 0.1);
  time += 0.008;
  
  // Slowly shift base hue over time
  baseHue = (time * 50) % 360;
  
  push();
  translate(width/2, height/2);
  
  // Draw large squares
  drawSquares(largeSquares, 1, baseHue);
  
  // Draw small squares with inverse rotation and colors
  drawSquares(smallSquares, -1, (baseHue + 20) % 360);
  
  pop();
}

function drawSquares(squares, direction, hue) {
  squares.forEach(square => {
    let rotatingLineAngle = (time % 2) * 2 * direction;
    
    let angleDiff = (square.angle - rotatingLineAngle);
    angleDiff = ((angleDiff % 2) + 2) % 2;
    
    let waveOffset = (1 - (angleDiff * angleDiff)) * 40;
    
    let sizeC = square.sizeC * (1 + 0.3 * (waveOffset / 40));
    
    let squareHue = (hue + square.hueOffset) % 360;
    let saturation = 80 - (waveOffset / 40) * 30;
    let brightness = 90 - (waveOffset / 40) * 20;
    
    push();
    translate(square.x, square.y);
    rotate(angleDiff);
    fill(squareHue, saturation, brightness);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, sizeC, sizeC);
    pop();
  });
}