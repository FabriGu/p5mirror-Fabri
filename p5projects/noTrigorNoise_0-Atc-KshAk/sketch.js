let squares = [];
let time = 0;
let baseHue = 0;

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100);
  
  // Create a denser grid of smaller squares with more precise positioning
  let step = 25;
  for (let x = -width/2; x <= width/2; x += step) {
    for (let y = -height/2; y <= height/2; y += step) {
      // Calculate distance from center
      let dx = x;
      let dy = y;
      let distance = sqrt(dx * dx + dy * dy);
      
      // Only add squares within the canvas circle
      // Added small offset to prevent edge cases
      if (distance <= (width/2 + 1)) {
        // Calculate initial angle without trig
        let angle = 0;
        if (dx !== 0 || dy !== 0) {
          // Using atan2 equivalent without trig
          if (dx === 0) {
            angle = dy > 0 ? 0.5 : 1.5;
          } else {
            let slope = dy / dx;
            angle = (dx > 0) ? (slope / (4 + abs(slope))) : (2 + slope / (4 + abs(slope)));
          }
        }
        
        squares.push({
          x: x,
          y: y,
          sizeC: 60,
          distance: distance/20,
          angle: angle,
          hueOffset: (distance / width) * 90 // Hue varies based on distance from center
        });
      }
    }
  }
}

function draw() {
  background(0,0.2); // Light gray background
  time += 0.008;
  
  // Slowly shift base hue over time
  baseHue = (time * 50) % 360;
  
  // Translate to center
  push();
  translate(width/2, height/2);
  
  // Update and draw each square
  squares.forEach(square => {
    // Create wave motion based on angle difference from rotating line
    let rotatingLineAngle = (time % 2) * 2;
    
    // Calculate angle difference without trig
    let angleDiff = (square.angle - rotatingLineAngle);
    // Normalize angle difference to [0, 2]
    angleDiff = ((angleDiff % 2) + 2) % 2;
    
    // Smoother wave effect based on angle difference
    let waveOffset = (1 - (angleDiff * angleDiff)) * 40;
    
    // Size pulsing based on wave
    let sizeC = square.sizeC * (1 + 0.3 * (waveOffset / 40));
    
    // Calculate hue that stays within 60 degrees
    let hue = (baseHue + square.hueOffset) % 360;
    let saturation = 80 - (waveOffset / 40) * 30; // Vary saturation with wave
    let brightness = 90 - (waveOffset / 40) * 20; // Vary brightness with wave
    
    // Draw square
    push();
    translate(square.x, square.y);
    rotate(angleDiff);
    fill(hue, saturation, brightness);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, sizeC, sizeC);
    pop();
  });
  
  pop();
}