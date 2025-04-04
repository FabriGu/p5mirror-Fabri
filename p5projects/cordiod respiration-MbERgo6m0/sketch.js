let c = 0;           // Our coefficient that will increase over time
let divisions = 500; // Number of points around the circle
let radius = 300;    // Size of the circle
let speed = 0.0001;    // How fast c increases
let colorSpeed = 0.4; // How fast the colors change
let colorOffset = 200; // For cycling through colors

function setup() {
  createCanvas(800, 800);
  strokeWeight(0.3);
}

function draw() {
//   background(10, 10, 30, 0.1); // Slightly transparent background for trailing effect
    background(0, 0, 0, 100); // Slightly transparent background for trailing effect

  translate(width/2, height/2); // Center of the canvas
  
  // Calculate points around the circle
  let points = [];
  for (let i = 0; i < divisions; i++) {
    let angle = map(i, 0, divisions, 0, TWO_PI);
    let x = radius * cos(angle);
    let y = radius * sin(angle);
    points.push({x, y});
  }
  
  // Draw lines between points based on our formula y = (x*c) % divisions
  for (let i = 0; i < divisions; i++) {
    // Calculate the target point using the formula
    let j = floor((i * c) % divisions);
    
    // Use HSB color mode for smooth color transitions
    colorMode(HSB, 100);
    let hue = (i / divisions * 100 + colorOffset) % 0.1;
    stroke(hue, 80, 90, 70); // High saturation and brightness with some transparency
    
    // Draw the line
    line(points[i].x, points[i].y, points[j].x, points[j].y);
  }
  
  // Increase our coefficient for the next frame
  c += speed;
  
  // If c gets too large and causes performance issues, reset it
  // The pattern repeats when c is a multiple of divisions
  if (c > divisions * 10) {
    c = c % divisions;
  }
  
  // Update color offset for cycling colors
  colorOffset = (colorOffset + colorSpeed) % 100;
  
  // // Display the current c value
  colorMode(RGB);
  // fill(255);
  // noStroke();
  // textAlign(LEFT);
  // textSize(16);
  // text(`c = ${c.toFixed(2)}`, -width/2 + 20, -height/2 + 30);
}

// Add interactivity
function mouseWheel(event) {
  // Change speed based on mouse wheel
  speed += event.delta * 0.0001;
  // Keep speed within reasonable bounds
  speed = constrain(speed, 0.00001, 0.5);
  return false; // Prevent default scrolling
}

function mousePressed() {
  // Reset c value on mouse press
  c = 0;
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    // Save the canvas as an image when 's' is pressed
    saveCanvas('mandala', 'png');
  }
}