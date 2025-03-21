let cols, rows;
const scl = 38;
let w = 800;
let h = 600;
let flying = 0;
const boxSize = 34;

function setup() {
  createCanvas(800, 600, WEBGL);
  cols = w / scl;
  rows = h / scl*2;
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0);
  
  // Enhanced lighting
  ambientLight(150);
  pointLight(255, 255, 255, 0, -200, 500);
  directionalLight(200, 200, 200, -1, 1, -1);
  
  rotateX(PI/2.8);
  translate(-w/2, -h/2);
  
  flying -= 0.028;
  let yoff = flying;
  
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let height = map(noise(xoff, yoff), 0, 1, -100, 100);
      
      push();
      translate(x * scl, y * scl, height);
      
      let hue = 270;
      let saturation = map(height, -100, 100, 20, 90);
      let brightness = map(height, -100, 100, 30, 95);
      
      // Enhanced material properties
      shininess(5);
      specularMaterial(color(hue, saturation, brightness));
      
      let boxHeight = map(abs(height), 0, 100, boxSize/2, boxSize*2);
      box(boxSize, boxHeight, boxSize);
      
      pop();
      xoff += 0.2;
    }
    yoff += 0.2;
  }
}