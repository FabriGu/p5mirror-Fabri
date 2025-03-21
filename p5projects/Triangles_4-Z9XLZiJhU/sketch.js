class Triangle {
  constructor(x, y, size) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.acc = createVector(0, 0);
    this.size = size || random(20, 40);
    this.angle = random(TWO_PI);
    this.angularVel = 0;
    this.mass = this.size * this.size;
    this.inertia = this.mass * this.size * this.size / 6;
    this.color = color(random(360), random(20, 40), random(60, 80), 0.7);
    this.restitution = 0.3; // Reduced bounciness for more stable collisions
    this.friction = 0.95;   // Increased friction to help settling
    
    // Attraction parameters
    this.attractionStrength = 20.0;  // Increased from 0.1
    this.maxSpeed = 8;             // Increased from 5
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

  findCollisionPoint(other) {
    let vertices1 = this.calculateVertices();
    let vertices2 = other.calculateVertices();
    let shortestDist = Infinity;
    let collisionPoint = null;
    let normal = null;

    // Check vertex-edge collisions for both triangles
    for (let i = 0; i < 3; i++) {
      let edge1 = {
        start: vertices1[i],
        end: vertices1[(i + 1) % 3]
      };
      
      // Check other triangle's vertices against this edge
      for (let j = 0; j < 3; j++) {
        let point = vertices2[j];
        let dist = this.pointToLineDistance(point, edge1.start, edge1.end);
        if (dist < shortestDist) {
          shortestDist = dist;
          collisionPoint = point;
          normal = this.calculateNormal(edge1.start, edge1.end, point);
        }
      }
    }

    // Check the other way around
    for (let i = 0; i < 3; i++) {
      let edge2 = {
        start: vertices2[i],
        end: vertices2[(i + 1) % 3]
      };
      
      for (let j = 0; j < 3; j++) {
        let point = vertices1[j];
        let dist = this.pointToLineDistance(point, edge2.start, edge2.end);
        if (dist < shortestDist) {
          shortestDist = dist;
          collisionPoint = point;
          normal = this.calculateNormal(edge2.start, edge2.end, point).mult(-1);
        }
      }
    }

    return {
      point: collisionPoint,
      normal: normal,
      depth: shortestDist
    };
  }

  calculateNormal(lineStart, lineEnd, point) {
    let edge = p5.Vector.sub(lineEnd, lineStart);
    let normal = createVector(-edge.y, edge.x).normalize();
    let toPoint = p5.Vector.sub(point, lineStart);
    
    if (p5.Vector.dot(normal, toPoint) < 0) {
      normal.mult(-1);
    }
    
    return normal;
  }

  pointToLineDistance(p, a, b) {
    let ab = p5.Vector.sub(b, a);
    let ap = p5.Vector.sub(p, a);
    let projection = p5.Vector.dot(ap, ab) / ab.magSq();
    
    if (projection >= 0 && projection <= 1) {
      let perpendicular = p5.Vector.sub(
        p,
        p5.Vector.add(a, p5.Vector.mult(ab, projection))
      );
      return perpendicular.mag();
    }
    
    return min(p5.Vector.dist(p, a), p5.Vector.dist(p, b));
  }

  resolveCollision(other) {
    let collision = this.findCollisionPoint(other);
    if (!collision.point || collision.depth > this.size * 0.1) return;

    let normal = collision.normal;
    let relativeVel = p5.Vector.sub(this.vel, other.vel);
    
    // Calculate impulse
    let velocityAlongNormal = p5.Vector.dot(relativeVel, normal);
    if (velocityAlongNormal > 0) return;
    
    let j = -(1 + this.restitution) * velocityAlongNormal;
    j /= 1/this.mass + 1/other.mass;
    
    // Apply impulse
    let impulse = p5.Vector.mult(normal, j);
    this.vel.add(p5.Vector.div(impulse, this.mass));
    other.vel.sub(p5.Vector.div(impulse, other.mass));
    
    // Apply friction
    let tangent = p5.Vector.sub(relativeVel, p5.Vector.mult(normal, velocityAlongNormal));
    if (tangent.mag() > 0) {
      tangent.normalize();
      let jt = -p5.Vector.dot(relativeVel, tangent);
      jt /= 1/this.mass + 1/other.mass;
      
      let frictionImpulse = p5.Vector.mult(tangent, jt * this.friction);
      this.vel.add(p5.Vector.div(frictionImpulse, this.mass));
      other.vel.sub(p5.Vector.div(frictionImpulse, other.mass));
    }
    
    // Prevent overlap
    let correction = max(collision.depth - 0.5, 0) * 0.8;
    let correctionVector = p5.Vector.mult(normal, correction);
    this.pos.add(correctionVector);
    other.pos.sub(correctionVector);
  }

  attract(center) {
    let force = p5.Vector.sub(center.pos, this.pos);
    let distance = force.mag();
    distance = constrain(distance, 5, 500);
    
    force.normalize();
    // Linear falloff instead of inverse square for stronger long-range attraction
    let strength = this.attractionStrength * (distance / 100);
    force.mult(strength);
    
    return force;
  }

  update() {
    // Update velocity and position
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    
    // Apply friction
    this.vel.mult(this.friction);
    
    // Update angle based on movement
    if (this.vel.mag() > 0.1) {
      let targetAngle = this.vel.heading();
      let angleDiff = targetAngle - this.angle;
      angleDiff = (angleDiff + PI) % TWO_PI - PI;
      this.angle += angleDiff * 0.1;
    }
    
    this.acc.mult(0);
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
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
  centerTriangle.vel = createVector(0, 0);
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
  
  // Update physics
  for (let i = 0; i < triangles.length; i++) {
    let t1 = triangles[i];
    if (t1 !== centerTriangle) {
      // Apply attraction to center
      let force = t1.attract(centerTriangle);
      t1.applyForce(force);
    }
    
    // Check collisions with all other triangles
    for (let j = i + 1; j < triangles.length; j++) {
      let t2 = triangles[j];
      t1.resolveCollision(t2);
    }
    
    t1.update();
  }
  
  // Draw all triangles
  for (let triangle of triangles) {
    triangle.show();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}