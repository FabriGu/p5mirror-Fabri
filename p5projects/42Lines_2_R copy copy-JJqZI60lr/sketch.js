
let angle = 0, direction = 1, baseHue;
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 0.5);
  baseHue = random(360);
  // frameRate(10)
}
function draw() {
  background(0);
  // rotateX(PI/4);
  // translate(0,-100,0);
  // rotateZ(angle);
  for (let i = 0; i < 4; i++) {
    push();
      rotate(PI/2 + (PI/2 * i))
    // rotateY(i * PI/2);
//     translate(50, 0, 0); // default 100, 0,0
      drawFibSystem(0, 0, 0, 0.7,0.5, 2);
    
    pop();
  }
  angle += 0.01;
}
function drawFibSystem(x, y, z, size, depth, rotation) {
  if (size > 100 || size < 1) direction *= -1;
  if (depth > 20) return;
  push();
  // translate(x, y, z);
  translate(x,y,rotation);
  rotateZ(rotation);
  baseHue = (frameCount) % 360 
  const hue = (baseHue + depth *8 ) % 360;
  stroke(hue, 80, 90);
  strokeWeight(3);
  noFill();
//   rect(0, 0, size * 20, size * 20);
  const nextSize = size * 1.2 * direction;
  const displacement = size /15; // default size * 20
  drawFibSystem(displacement, 0, z + size * 5, nextSize, depth + 1, rotation ); // first variable == displacement usually and roation + PI/2
  beginShape();
  for (let a = 0; a < PI/2; a += 0.1) { // a < PI/2
    const r = size * 20;
    const px = cos(a) * r; // cos(a) * r
    const py = sin(a) * r; //sin(a) * r
    vertex(px, py, sin(a + angle * 2) * size * 10);
  }
  endShape();
  
  pop();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}