// Color configurations
const COLORS = {
  CONE: [255, 100, 100],    // Red
  SPHERE: [100, 255, 100],  // Green
  TORUS: [100, 100, 255],   // Blue
  TERRAIN: [50, 150, 200]   // Blue-ish
};

let cols, rows;
const scl = 40;
let w = 800;
let h = 600;
let flying = 0;
const boxSize = 38;

function setup() {
  createCanvas(800, 600, WEBGL);
  cols = w / scl;
  rows = h / scl*2;
}

function draw() {
  background(0);
  
  ambientLight(60);
  directionalLight(255, 255, 255, 0.5, 1, -0.5);
  
  rotateX(PI/2.5);
  translate(-w/2, -h/2);
  
  flying -= 0.03;
  let yoff = flying;
  
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let height = map(noise(xoff, yoff), 0, 1, -100, 100);
      
      push();
      translate(x * scl, y * scl, height);
      
      // Main terrain boxes
      specularMaterial(COLORS.TERRAIN);
      let boxHeight = map(abs(height), 0, 100, boxSize/2, boxSize*2);
      box(boxSize, boxHeight, boxSize);
      
      // Add additional shapes based on height and position
      if (height > 20 && noise(xoff * 2, yoff * 2) > 0.7) {
        push();
        translate(0, 0, boxHeight/2);
        specularMaterial(COLORS.CONE);
        cone(boxSize/4, boxSize/2);
        pop();
      }
      
      if (height < -20 && noise(xoff * 3, yoff * 3) > 0.8) {
        push();
        translate(0, 0, boxHeight/2);
        specularMaterial(COLORS.SPHERE);
        sphere(boxSize/4);
        pop();
      }
      
      if (abs(height) < 10 && noise(xoff * 4, yoff * 4) > 0.9) {
        push();
        translate(0, 0, boxHeight/2);
        specularMaterial(COLORS.TORUS);
        rotateX(PI/2);
        torus(boxSize/4, boxSize/8);
        pop();
      }
      
      pop();
      xoff += 0.2;
    }
    yoff += 0.2;
  }
}