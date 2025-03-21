let cols, rows;
const scl = 38;  // Increased scale for boxes
let w = 800;
let h = 600;
let flying = 0;
const boxSize = 34;  // Size of each cube

function setup() {
  createCanvas(800, 600, WEBGL);
  cols = w / scl;
  rows = h / scl*2;
  // colorMode(HSB)
}

function draw() {
  background(0);
  
  // Lighting
  ambientLight(60);
  directionalLight(200, 200, 200, 0.5, 1, -0.5);
  
  // Camera setup
  rotateX(PI/2.8);
  translate(-w/2, -h/2);
  
  // Update and draw terrain
  flying -= 0.028;
  let yoff = flying;
  
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      // Calculate height using Perlin noise
      let height = map(noise(xoff, yoff), 0, 1, -100, 100);
      
      push();
      translate(x * scl, y * scl, height);
      
      // Color based on height
      let c = map(height, -100, 100, 0, 255);
      specularMaterial(c, 20, 250);
      
      // Scale box height based on terrain height
      let boxHeight = map(abs(height), 0, 100, boxSize/2, boxSize*2);
      box(boxSize, boxHeight, boxSize);
      
      pop();
      xoff += 0.2;
    }
    yoff += 0.2;
  }
}