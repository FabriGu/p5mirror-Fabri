class Circle {
  constructor(x, y, radius, hue) {
    this.pos = createVector(x, y);
    this.oldPos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.radius = radius;
    this.mass = radius * radius;
    this.isDragged = false;
    this.hue = hue;
    this.baseHue = hue;
  }
  update() {
    if (!this.isDragged) {
      let temp = createVector(this.pos.x, this.pos.y);
      this.pos.add(p5.Vector.sub(this.pos, this.oldPos));
      this.pos.add(this.vel);
      this.oldPos = temp;
      this.vel.mult(0.999);
    }
    this.hue = (this.baseHue + frameCount) % 360;
  }
  draw() {
    fill(this.hue, 50, 255, 0.4);
    stroke(this.hue, 50);
    strokeWeight(0.5);
    ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }
  checkDrag(mouseX, mouseY) {
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    if (d < this.radius && mouseIsPressed) {
      this.isDragged = true;
      this.pos.x = mouseX;
      this.pos.y = mouseY;
      this.oldPos = this.pos.copy();
      this.vel.mult(0);
    } else {
      this.isDragged = false;
    }
  }
}
class Chain {
  constructor(numSegments, startRadius) {
    this.circles = [];
    let prevCircle = null;
    let startHue = 200;
    this.baseX = width/2;
    
    for (let i = 0; i < numSegments; i++) {
      if (i < numSegments/2) {
        let radius = startRadius * (1 - i * 0.15);
        let x = this.baseX + (i === 0 ? 100 : 0);
        let y = 100 + (i * radius * 2);
        let circle = new Circle(x, y, radius, startHue + (i * 10));
        this.circles.push(circle);
      } else {
        let radius = startRadius * (i * 0.15);
        let x = this.baseX + (i === 0 ? 100 : 0);
        let y = 100 + (i * radius * 2);
        let circle = new Circle(x, y, radius, startHue + (i * 10));
        this.circles.push(circle);
      }
    }
  }
  update(gravity) {
    // Calculate swinging motion
    let angle = sin(frameCount * 0.02) * 15 + random(-10, 10);
    this.circles[0].pos.x = this.baseX + cos(radians(angle)) * 50;
    this.circles[0].pos.y = 100 + sin(radians(angle)) * 50;
    
    this.circles.forEach(circle => {
      if (!circle.isDragged) {
        circle.vel.add(gravity);
      }
      circle.update();
    });
    for (let i = 0; i < 20; i++) {
      this.constrainAll();
    }
  }
  constrainAll() {
    for (let i = 1; i < this.circles.length; i++) {
      this.constrain(this.circles[i], this.circles[i-1]);
    }
  }
  constrain(circle1, circle2) {
    let dir = p5.Vector.sub(circle1.pos, circle2.pos);
    let currLen = dir.mag();
    let targetLen = circle1.radius + circle2.radius;
    let diff = targetLen - currLen;
    dir.normalize();
    
    let totalMass = circle1.mass + circle2.mass/3;
    let move1 = (circle2.mass / totalMass) * diff;
    let move2 = (circle1.mass / totalMass) * diff;
    
    if (!circle1.isDragged) circle1.pos.add(p5.Vector.mult(dir, move1));
    if (!circle2.isDragged) circle2.pos.sub(p5.Vector.mult(dir, move2));
  }
  draw() {
    for (let i = this.circles.length - 1; i >= 0; i--) {
      this.circles[i].draw();
      this.circles[i].checkDrag(mouseX, mouseY);
    }
  }
}
let chain;
let gravity;
function setup() {
  createCanvas(800, 600);
  gravity = createVector(0, 0.1);
  chain = new Chain(8, 40);
  colorMode(HSB);
}
function draw() {
  chain.update(gravity);
  chain.draw();
}