let circles = [];
let baseHue;
const CANVAS_SIZE = 800;
const MIN_SIZE = 40;
const MAX_SIZE = 120;
const SPIRAL_SEGMENTS = 12;
const SPIRAL_STEPS = 10;
const GRAVITY_STRENGTH = 0.15;  // Added gravity constant

class Circle {
  constructor(x, y, size, isCenter = false) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.radius = size / 2;
    this.rotation = 0;
    this.speed = isCenter ? 0.02 : random(0.015, 0.025);
    this.direction = isCenter ? 1 : (random() < 0.5 ? 1 : -1);
    this.moving = !isCenter;
    this.velocity = createVector(
      this.moving ? (random() < 0.5 ? -2 : 2) : 0,
      this.moving ? (random() < 0.5 ? -2 : 2) : 0
    );
    this.hue = baseHue + (random() < 0.5 ? 0 : 50);
    this.spiralPoints = this.calculateSpiralPoints();
  }

  calculateSpiralPoints() {
    let points = [];
    for (let i = 0; i < SPIRAL_SEGMENTS; i++) {
      let segmentPoints = [];
      let angle = TWO_PI * (i / SPIRAL_SEGMENTS);
      
      for (let r = 0; r <= this.radius; r += this.radius / SPIRAL_STEPS) {
        let x = r * cos(angle + (r * 0.03));
        let y = r * sin(angle + (r * 0.03));
        segmentPoints.push({x, y});
      }
      points.push(segmentPoints);
    }
    return points;
  }

  update() {
    if (this.moving) {
      // Apply gravity towards center
      let centerX = CANVAS_SIZE / 2;
      let centerY = CANVAS_SIZE / 2;
      let angleToCenter = atan2(centerY - this.y, centerX - this.x);
      let distToCenter = dist(this.x, this.y, centerX, centerY);
      
      // Gravity gets stronger as circles get further from center
      let gravityMultiplier = map(distToCenter, 0, CANVAS_SIZE, 0.5, 2);
      
      // Add gravity to velocity
      this.velocity.x += cos(angleToCenter) * GRAVITY_STRENGTH * gravityMultiplier;
      this.velocity.y += sin(angleToCenter) * GRAVITY_STRENGTH * gravityMultiplier;
      
      // Limit velocity to prevent excessive speed
      let speed = this.velocity.mag();
      if (speed > 4) {
        this.velocity.setMag(4);
      }
      
      // Apply velocity
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      
      // Bounce off canvas edges with some velocity loss
      if (this.x - this.radius < 0) {
        this.x = this.radius;
        this.velocity.x = abs(this.velocity.x) * 0.8;
      } else if (this.x + this.radius > CANVAS_SIZE) {
        this.x = CANVAS_SIZE - this.radius;
        this.velocity.x = -abs(this.velocity.x) * 0.8;
      }
      
      if (this.y - this.radius < 0) {
        this.y = this.radius;
        this.velocity.y = abs(this.velocity.y) * 0.8;
      } else if (this.y + this.radius > CANVAS_SIZE) {
        this.y = CANVAS_SIZE - this.radius;
        this.velocity.y = -abs(this.velocity.y) * 0.8;
      }
      
      // Add slight damping to prevent perpetual bouncing
      this.velocity.mult(0.995);
    }
    
    this.rotation += this.speed * this.direction;
  }

  checkCollision(other) {
    if (this === other || !this.moving) return false;
    
    let d = dist(this.x, this.y, other.x, other.y);
    let minDist = this.radius + other.radius;
    
    if (d < minDist) {
      // Calculate position adjustment
      let angle = atan2(this.y - other.y, this.x - other.x);
      this.x = other.x + cos(angle) * minDist;
      this.y = other.y + sin(angle) * minDist;
      
      this.direction = -other.direction;
      this.moving = false;
      this.velocity.set(0, 0);
      return true;
    }
    return false;
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    noFill();
    strokeWeight(2);
    
    for (let i = 0; i < SPIRAL_SEGMENTS; i++) {
      stroke(i % 2 === 0 ? this.hue : (this.hue + 50) % 360, 80, 90);
      beginShape();
      for (let point of this.spiralPoints[i]) {
        vertex(point.x, point.y);
      }
      endShape();
    }
    pop();
  }
}

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  colorMode(HSB, 360, 100, 100);
  baseHue = random(360);
  
  // Create center circle
  circles.push(new Circle(width/2, height/2, 100, true));
  
  // Add initial moving circles
  addNewCircle();
  addNewCircle();
}

function draw() {
  background(0, 0.1);
  
  // Update and check collisions
  for (let circle of circles) {
    circle.update();
    for (let other of circles) {
      circle.checkCollision(other);
    }
  }
  
  // Draw all circles
  for (let circle of circles) {
    circle.draw();
  }
  
  // Add new circle if there are no moving circles and we're under the limit
  if (!circles.some(c => c.moving) && circles.length < 20) {
    addNewCircle();
  }
}

function addNewCircle() {
  let size = random(MIN_SIZE, MAX_SIZE);
  let x, y;
  let side = floor(random(4));
  
  switch(side) {
    case 0: // Top
      x = random(CANVAS_SIZE);
      y = -size;
      break;
    case 1: // Right
      x = CANVAS_SIZE + size;
      y = random(CANVAS_SIZE);
      break;
    case 2: // Bottom
      x = random(CANVAS_SIZE);
      y = CANVAS_SIZE + size;
      break;
    case 3: // Left
      x = -size;
      y = random(CANVAS_SIZE);
      break;
  }
  
  circles.push(new Circle(x, y, size));
}

function mousePressed() {
  if (circles.length < 8) {
    addNewCircle();
  }
}