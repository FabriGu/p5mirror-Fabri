let cols, rows;
const scl = 38;
let w = 1100;
let h = 700;
let flying = 0;
const boxSize = 38;

function setup() {
  createCanvas(800, 800, WEBGL);
  cols = w / scl;
  rows = h / scl*2;
  colorMode(HSB, 360, 100, 100);
  noStroke();
}

function draw() {
  background(254);
  
  ambientLight(60);
  directionalLight(255, 255, 255, 0.5, 1, -0.5);
  
  rotateX(PI/3);
  translate(-w/2, -h/2);
  
  flying -= 0.02;
  let yoff = flying;
  
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let height = map(noise(xoff, yoff), 0, 1, -110, 110);
      
      push();
      translate(x * scl, y * scl, height);
      
      let hue = map(height, -110, 110, 200, 180); // Dark blue to light blue
      let saturation = map(height, -100, 100, 70, 80);
      let brightness = map(height, -100, 100, 40, 100);
      specularMaterial(color(hue, saturation, brightness));
      
      let boxHeight = map(abs(height), 0, 100, boxSize/2, boxSize*2);
      box(boxSize, boxHeight, boxSize);
      
      pop();
      xoff += 0.2;
    }
    yoff += 0.2;
  }
}