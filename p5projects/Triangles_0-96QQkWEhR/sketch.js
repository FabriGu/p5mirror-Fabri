class Triangle {
  constructor(x, y, size) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector(0, 0);
    this.size = size || random(20, 40);
    this.angle = random(TWO_PI);
    this.angularVel = 0;
    this.angularAcc = 0;
    this.mass = this.size * this.size;
    this.color = color(random(360), random(20, 40), random(60, 80), 0.7);
    this.settled = false;
  }

  calculateVertices() {
    return [
      createVector(
        this.pos.x + cos(this.angle) * this.size,
        this.pos.y + sin(this.angle) * this.size
      ),
      createVector(
        this.pos.x + cos(this.angle + TWO_PI/3) * this.size,
        this.pos.y + sin(this.angle + TWO_PI/3) * this.size
      ),
      createVector(
        this.pos.x + cos(this.angle + 2*TWO_PI/3) * this.size,
        this.pos.y + sin(this.angle + 2*TWO_PI/3) * this.size
      )
    ];
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
  }

  attract(other) {
    let force = p5.Vector.sub(this.pos, other.pos);
    let distance = force.mag();
    distance = constrain(distance, 5, 25);
    let strength = (this.mass * other.mass) / (distance * distance);
    force.setMag(strength);
    return force;
  }

  checkCollision(other) {
    let vertices1 = this.calculateVertices();
    let vertices2 = other.calculateVertices();
    
    // Check for intersection between any two line segments
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let a1 = vertices1[i];
        let a2 = vertices1[(i + 1) % 3];
        let b1 = vertices2[j];
        let b2 = vertices2[(j + 1) % 3];
        
        if (this.lineIntersection(a1, a2, b1, b2)) {
          return true;
        }
      }
    }
    return false;
  }

  lineIntersection(a1, a2, b1, b2) {
    let denominator = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
    if (denominator === 0) return false;
    
    let ua = ((b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x)) / denominator;
    let ub = ((a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x)) / denominator;
    
    return ua > 0 && ua < 1 && ub > 0 && ub < 1;
  }

  handleCollision(other) {
    // Push triangles apart
    let away = p5.Vector.sub(this.pos, other.pos);
    away.normalize();
    away.mult(0.5); // Reduced push force
    this.pos.add(away);
    other.pos.sub(away);
    
    // Transfer some angular momentum
    let angleChange = (this.angularVel - other.angularVel) * 0.1;
    this.angularVel -= angleChange;
    other.angularVel += angleChange;
    
    // Dampen velocities
    this.vel.mult(0.8);
    other.vel.mult(0.8);
  }

  update() {
    if (this.settled) return;

    this.vel.add(this.acc);
    this.vel.mult(0.99); // Drag
    this.pos.add(this.vel);
    
    this.angularVel += this.angularAcc;
    this.angularVel *= 0.99; // Angular drag
    this.angle += this.angularVel;
    
    this.acc.mult(0);
    this.angularAcc = 0;
  }

  show() {
    push();
    colorMode(HSB, 360, 100, 100, 1);
    stroke(0);
    strokeWeight(1);
    fill(this.color);
    
    beginShape();
    let vertices = this.calculateVertices();
    for (let v of vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
    pop();
  }
}

let triangles = [];
let centerTriangle;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  background(255);
  
  // Create center triangle
  centerTriangle = new Triangle(width/2, height/2, 40);
  centerTriangle.settled = true;
  triangles.push(centerTriangle);
}

function draw() {
  background(255);
  
  // Spawn new triangles
  if (frameCount % 30 === 0 && triangles.length < 50) {
    let angle = random(TWO_PI);
    let radius = max(width, height);
    let x = width/2 + cos(angle) * radius;
    let y = height/2 + sin(angle) * radius;
    triangles.push(new Triangle(x, y));
  }
  
  // Update and check collisions
  for (let i = 0; i < triangles.length; i++) {
    let t1 = triangles[i];
    
    // Apply gravitational force from center triangle
    if (!t1.settled) {
      let force = centerTriangle.attract(t1);
      t1.applyForce(force);
      
      // Check collisions with other triangles
      for (let j = 0; j < triangles.length; j++) {
        if (i !== j) {
          let t2 = triangles[j];
          if (t1.checkCollision(t2)) {
            t1.handleCollision(t2);
          }
        }
      }
      
      t1.update();
    }
    
    t1.show();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}