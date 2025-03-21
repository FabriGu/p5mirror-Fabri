// Size configuration
const TRIANGLE_MIN_SIZE = 60;  // Change this to adjust minimum triangle size
const TRIANGLE_MAX_SIZE = 80;  // Change this to adjust maximum triangle size

class Triangle {
  constructor(x, y, size) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.size = size || random(TRIANGLE_MIN_SIZE, TRIANGLE_MAX_SIZE);
    this.angle = random(TWO_PI);
    this.angularVel = 0;
    this.angularAcc = 0;
    this.mass = this.size * this.size;
    this.momentOfInertia = this.mass * this.size * this.size / 6;
    this.color = color(random(360), random(20, 40), random(60, 80), 0.7);
    
    // Physics parameters - adjusted for better behavior
    this.baseAttractionStrength = 70.0;  // Base attraction force
    this.attractionStrength = this.baseAttractionStrength * (this.size / TRIANGLE_MIN_SIZE); // Scales with size
    this.maxSpeed = 155;  // Increased for faster movement
    this.friction = 0.96;  // Reduced friction for smoother movement
    this.angularFriction = 0.99;  // Reduced angular friction
    this.isLocked = false;
    this.stationaryFrames = 0;  // Counter for frames without movement
    this.stationaryThreshold = 10;  // Frames required to consider truly stopped
  }

  calculateVertices() {
    let r = this.size * 0.9;  // Increased from 0.8 to reduce gaps
    return [
      createVector(
        this.pos.x + cos(this.angle) * r,
        this.pos.y + sin(this.angle) * r
      ),
      createVector(
        this.pos.x + cos(this.angle + TWO_PI/3) * r,
        this.pos.y + sin(this.angle + TWO_PI/3) * r
      ),
      createVector(
        this.pos.x + cos(this.angle + 2*TWO_PI/3) * r,
        this.pos.y + sin(this.angle + 2*TWO_PI/3) * r
      )
    ];
  }

  findContactPoints(other) {
    let vertices1 = this.calculateVertices();
    let vertices2 = other.calculateVertices();
    let contacts = [];
    let minDist = this.size * 0.01;  // Reduced from 0.1 for tighter packing

    // Check each vertex against each edge
    for (let i = 0; i < 3; i++) {
      let edge1Start = vertices1[i];
      let edge1End = vertices1[(i + 1) % 3];

      for (let j = 0; j < 3; j++) {
        let point = vertices2[j];
        let distToEdge = this.pointToLineDistance(point, edge1Start, edge1End);
        
        if (distToEdge < minDist) {
          let normal = this.calculateEdgeNormal(edge1Start, edge1End);
          contacts.push({
            point: point,
            normal: normal,
            depth: minDist - distToEdge
          });
        }
      }

      // Check vertices1 against edges2
      let point = vertices1[i];
      for (let j = 0; j < 3; j++) {
        let edge2Start = vertices2[j];
        let edge2End = vertices2[(j + 1) % 3];
        let distToEdge = this.pointToLineDistance(point, edge2Start, edge2End);

        if (distToEdge < minDist) {
          let normal = this.calculateEdgeNormal(edge2Start, edge2End).mult(-1);
          contacts.push({
            point: point,
            normal: normal,
            depth: minDist - distToEdge
          });
        }
      }
    }

    return contacts;
  }

  calculateEdgeNormal(start, end) {
    let edge = p5.Vector.sub(end, start);
    let normal = createVector(-edge.y, edge.x).normalize();
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

  resolveContact(other, contacts) {
    if (this.isLocked && other.isLocked) return;
    
    for (let contact of contacts) {
      // Calculate relative velocity at contact point
      let r1 = p5.Vector.sub(contact.point, this.pos);
      let r2 = p5.Vector.sub(contact.point, other.pos);
      
      let v1 = p5.Vector.add(this.vel, 
        createVector(-r1.y * this.angularVel, r1.x * this.angularVel));
      let v2 = p5.Vector.add(other.vel,
        createVector(-r2.y * other.angularVel, r2.x * other.angularVel));
      
      let relativeVel = p5.Vector.sub(v1, v2);
      let normalVel = p5.Vector.dot(relativeVel, contact.normal);
      
      // Apply sliding force
      let tangent = createVector(-contact.normal.y, contact.normal.x);
      let tangentVel = p5.Vector.dot(relativeVel, tangent);
      
      // Calculate cross products for torque
      let cross1 = r1.x * contact.normal.y - r1.y * contact.normal.x;
      let cross2 = r2.x * contact.normal.y - r2.y * contact.normal.x;
      
      let torqueCoeff1 = cross1 * cross1 / this.momentOfInertia;
      let torqueCoeff2 = cross2 * cross2 / other.momentOfInertia;
      
      let j = -(1 + 0.1) * normalVel / 
              (1/this.mass + 1/other.mass + torqueCoeff1 + torqueCoeff2);
      
      if (!this.isLocked) {
        this.vel.add(p5.Vector.mult(contact.normal, j/this.mass));
        let torque1 = r1.x * contact.normal.y * j - r1.y * contact.normal.x * j;
        this.angularVel += torque1 / this.momentOfInertia;
      }
      
      if (!other.isLocked) {
        other.vel.sub(p5.Vector.mult(contact.normal, j/other.mass));
        let torque2 = r2.x * contact.normal.y * j - r2.y * contact.normal.x * j;
        other.angularVel -= torque2 / other.momentOfInertia;
      }
      
      // Apply position correction
      let correction = contact.depth * 0.8;
      if (!this.isLocked) this.pos.add(p5.Vector.mult(contact.normal, correction * 0.5));
      if (!other.isLocked) other.pos.sub(p5.Vector.mult(contact.normal, correction * 0.5));
    }
  }

  attract(center) {
    if (this.isLocked) return createVector(0, 0);
    
    let force = p5.Vector.sub(center.pos, this.pos);
    let distance = force.mag();
    force.normalize();
    let strength = this.attractionStrength * (distance / 100);
    // Add minimum force to prevent stalling at spawn
    strength = max(strength, this.attractionStrength * 0.2);
    force.mult(strength);
    return force;
  }

  update() {
    if (this.isLocked) return;
    
    // Update linear motion
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.vel.mult(this.friction);
    
    // Update angular motion
    this.angularVel += this.angularAcc;
    this.angularVel *= this.angularFriction;
    this.angle += this.angularVel;
    
    this.acc.mult(0);
    this.angularAcc = 0;
    
    // Improved settling detection
    if (this.vel.mag() < 0.05 && abs(this.angularVel) < 0.008) {
      this.stationaryFrames++;
      if (this.stationaryFrames > this.stationaryThreshold) {
        // Only lock if near other triangles
        let nearOthers = false;
        for (let other of triangles) {
          if (other !== this) {
            let dist = p5.Vector.dist(this.pos, other.pos);
            if (dist < (this.size + other.size) * 1.2) {
              nearOthers = true;
              break;
            }
          }
        }
        if (nearOthers) {
          this.isLocked = true;
        }
      }
    } else {
      this.stationaryFrames = 0;
    }
  }

  applyForce(force) {
    if (this.isLocked) return;
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
let canSpawnNew = true;

function setup() {
  frameRate(120);
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  background(255);
  
  // Create center triangle using same size range
  centerTriangle = new Triangle(width/2, height/2, random(TRIANGLE_MIN_SIZE, TRIANGLE_MAX_SIZE));
  centerTriangle.isLocked = true;
  triangles.push(centerTriangle);
}

function draw() {
  background(255);
  
  // Check if we can spawn a new triangle
  let allSettled = triangles.every(t => t.isLocked);
  
  if (allSettled && triangles.length < 50 && canSpawnNew) {
    let angle = random(TWO_PI);
    let radius = max(width, height) * 0.6;
    let x = width/2 + cos(angle) * radius;
    let y = height/2 + sin(angle) * radius;
    triangles.push(new Triangle(x, y));
    canSpawnNew = false;
  }
  
  // Update triangles
  for (let i = 0; i < triangles.length; i++) {
    let t1 = triangles[i];
    
    if (!t1.isLocked) {
      // Apply attraction to center
      let force = t1.attract(centerTriangle);
      t1.applyForce(force);
      
      // Check contacts with other triangles
      for (let j = 0; j < triangles.length; j++) {
        if (i !== j) {
          let t2 = triangles[j];
          let contacts = t1.findContactPoints(t2);
          if (contacts.length > 0) {
            t1.resolveContact(t2, contacts);
          }
        }
      }
    }
    
    t1.update();
    
    // Check if settled
    if (t1.isLocked && !canSpawnNew) {
      canSpawnNew = true;
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