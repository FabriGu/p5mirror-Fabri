class Triangle {
  constructor(x, y, size) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.acc = createVector(0, 0);
    this.size = size || random(20, 40);
    this.angle = random(TWO_PI);
    this.angularVel = 0;
    this.mass = this.size * this.size;
    this.color = color(random(360), random(20, 40), random(60, 80), 0.7);
    this.settled = false;
    
    // Physics parameters
    this.maxSpeed = 4;
    this.maxForce = 0.5;
    this.springStrength = 0.03;
    this.dampening = 0.98;
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

  checkCollision(other) {
    // Quick distance check first
    let minDist = this.size + other.size;
    if (p5.Vector.dist(this.pos, other.pos) > minDist) {
      return false;
    }

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

  resolveCollision(other) {
    // Push triangles apart
    let away = p5.Vector.sub(this.pos, other.pos);
    let dist = away.mag();
    let minDist = (this.size + other.size);
    
    if (dist < minDist) {
      away.normalize();
      let pushForce = away.copy();
      pushForce.mult((minDist - dist) * 0.5);
      
      if (!this.settled) this.pos.add(pushForce);
      if (!other.settled) other.pos.sub(pushForce);
      
      // Reduce velocity in collision direction
      let relativeVel = p5.Vector.sub(this.vel, other.vel);
      let normalVel = p5.Vector.dot(relativeVel, away);
      
      if (normalVel > 0) {
        let restitution = 0.5;
        let j = -(1 + restitution) * normalVel;
        j /= 1/this.mass + 1/other.mass;
        
        let impulse = away.copy().mult(j);
        if (!this.settled) this.vel.add(p5.Vector.div(impulse, this.mass));
        if (!other.settled) other.vel.sub(p5.Vector.div(impulse, other.mass));
      }
    }
  }

  update() {
    if (this.settled) return;

    // Update velocity and position
    this.vel.add(this.acc);
    this.vel.mult(this.dampening);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    
    // Reset acceleration
    this.acc.mult(0);
  }

  applyForce(force) {
    this.acc.add(p5.Vector.div(force, this.mass));
  }

  moveTowardCenter(center) {
    if (this.settled) return;

    let toCenter = p5.Vector.sub(center.pos, this.pos);
    let dist = toCenter.mag();
    
    if (dist < this.size) {
      this.settled = true;
      this.vel.mult(0);
      return;
    }

    // Spring force toward center
    toCenter.normalize();
    toCenter.mult(dist * this.springStrength);
    this.applyForce(toCenter);

    // Dampen movement when close to target
    if (dist < this.size * 3) {
      this.vel.mult(0.95);
    }
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
  
  centerTriangle = new Triangle(width/2, height/2, 40);
  centerTriangle.settled = true;
  triangles.push(centerTriangle);
}

function draw() {
  background(255);
  
  // Add new triangles periodically
  if (frameCount % 60 === 0 && triangles.length < 50) {
    let angle = random(TWO_PI);
    let radius = max(width, height) * 0.6;
    let x = width/2 + cos(angle) * radius;
    let y = height/2 + sin(angle) * radius;
    triangles.push(new Triangle(x, y));
  }
  
  // Update and check collisions
  for (let i = 0; i < triangles.length; i++) {
    let t1 = triangles[i];
    if (!t1.settled) {
      t1.moveTowardCenter(centerTriangle);
      
      // Check and resolve collisions
      for (let j = 0; j < triangles.length; j++) {
        if (i !== j) {
          let t2 = triangles[j];
          if (t1.checkCollision(t2)) {
            t1.resolveCollision(t2);
          }
        }
      }
      
      t1.update();
    }
  }
  
  // Draw all triangles
  for (let triangle of triangles) {
    triangle.show();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}