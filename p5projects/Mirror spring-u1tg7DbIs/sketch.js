let x = 100;
let y = 100;
let r = 100, g = 255, b = 150;
let rectSize = 100;

// vector
let posX, posY;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  // background(100,200,100);
  // background(200);
  // in class
  fill(r,g,b);
  stroke(100,255,10);
  rect(x,y, rectSize, rectSize);
  
  x = x+1
  if (x > width) {
    x =- 100;
  }
  
  rectSize = rectSize+1;
  if (rectSize > 150) {
    rectSize = 0;
  }
  // in class
  // internet
    push();
  // translate to where you want the center of the ellipse to be
  translate(width/2, height/2);
  // rotate using the frameCount (increases by one on each frame)
  rotate(frameCount * 0.025);
  // draw the ellipse at the origin
  ellipse(0, 0, 350, 150);
  pop();
  // internet
  for (let i = 0; i < 256; i++) {
    r++;
    g++;
    b++;
  }
  
  let horizontal = createVector(0, 400);
  let vertical = createVector()
  let v = p5.Vector.reflect()
  

  // line(50, 0, 50, 100);
  let n = createVector(1, 0);

  let v0 = createVector(width/2, height/2);
  let v1 = createVector(30, 40);
  let v2 = p5.Vector.reflect(v1, n);

  n.setMag(30);
  drawArrow(v0, n, 'black');
  drawArrow(v0, v1, 'red');
  drawArrow(v0, v2, 'blue');

  describe('Three arrows extend from the center of a gray square with a vertical line down its middle. A black arrow points to the right, a blue arrow points to the bottom left, and a red arrow points to the bottom right.');
}

function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();

}