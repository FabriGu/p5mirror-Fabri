let angle = 0, baseSize = 200;
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 1);
  ortho(-width/2, width/2, -height/2, height/2, -2000, 2000);
  orbitControl(4, 4);
}
function draw() {
  orbitControl(4, 4);
  background(0);
  // rotateX(PI/4);
  // rotateZ(angle);
  for(let i = 0; i < 4; i++) {
    push();
    rotateY(i * PI/2);
    translate(100, 0, 0);
    drawFibonacciSystem();
    pop();
  }
  angle += 0.01;
}
function drawFibonacciSystem() {
  let fib = [1, 1, 2, 3, 5, 8, 13, 21];
  let pos = {x: 0, y: 0}, size = baseSize;
  noFill();
  stroke(255, 50);
  drawSpiral(0, 0, size);
  strokeWeight(1);
  for(let i = 0; i < fib.length - 1; i++) {
    rect(pos.x, pos.y, fib[i] * size/21, fib[i] * size/21);
    if(i % 2 === 0) pos.x += fib[i] * size/21;
    else pos.y += fib[i] * size/21;
  }
}
function drawSpiral(x, y, size) {
  let points = [], turns = 7;
  for(let a = 0; a < turns * PI/2; a += 0.1) {
    let r = pow(1.618, a) * size/50;
    points.push({
      x: x + cos(a) * r,
      y: y + sin(a) * r,
      z: a * 10
    });
  }
  strokeWeight(2);
  beginShape();
  points.forEach((p, i) => {
    stroke(i * 2, 80, 100, 0.6);
    vertex(p.x, p.y, p.z);
  });
  endShape();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ortho(-width/2, width/2, -height/2, height/2, -2000, 2000);
}