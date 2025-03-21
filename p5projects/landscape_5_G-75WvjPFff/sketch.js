let cols, rows;
const scl = 38;
let w = 1100;
let h = 700;
let flying = 0;
const boxSize = 38;
let colorOffset = 0;

function setup() {
  createCanvas(800, 800, WEBGL);
  cols = w / scl;
  rows = h / scl*2;
  colorMode(HSB, 360, 100, 100);
  noStroke();
}

function draw() {
  background(254);
  colorOffset = (colorOffset - 0.5); // Removed modulo, slowed speed
  
  ambientLight(60);
  directionalLight(255, 255, 255, 0.5, 1, -0.5);
  
  rotateX(PI/3);
  translate(-w/2, -h/2);
  
  flying -= 0.02;
  let yoff = flying;
  
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    // Use floor to maintain smooth transitions and wrap around 270-360 range
    let rowHue = 10 + ((floor(y * 10 + colorOffset) % 90 + 90) % 90);
    
    for (let x = 0; x < cols; x++) {
      let height = map(noise(xoff, yoff), 0, 1, -110, 110);
      
      push();
      translate(x * scl, y * scl, height);
      
      let saturation = map(height, -100, 100, 20, 255);
      let brightness = map(height, -100, 100, 30, 255);
      specularMaterial(color(rowHue, saturation, brightness));
      
      let boxHeight = map(abs(height), 0, 100, boxSize/2, boxSize*2);
      box(boxSize, boxHeight, boxSize);
      
      pop();
      xoff += 0.2;
    }
    yoff += 0.2;
  }
}