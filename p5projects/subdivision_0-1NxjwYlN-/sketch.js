let spheres = [];
const SEPARATION_THRESHOLD = 100;
const ATTRACTION_FORCE = 0.5;
const SPHERE_SIZE = 30;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(RGB);
  
  // Create initial water spheres
  spheres.push(new WaterSphere(0, -200, 0));
  spheres.push(new WaterSphere(50, -200, 0));
}

class WaterSphere {
  constructor(x, y, z) {
    this.pos = createVector(x, y, z);
    this.vel = createVector(0, 0, 0);
    this.acc = createVector(0, 0.5, 0); // Gravity
    this.size = SPHERE_SIZE;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    
    // Ground collision
    if (this.pos.y > height/2 - this.size) {
      this.pos.y = height/2 - this.size;
      this.vel.y *= -0.8; // Bounce with damping
    }
    
    // Apply drag
    this.vel.mult(0.99);
  }

  applyForce(force) {
    this.vel.add(force);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    
    // Create water-like appearance
    specularMaterial(0, 120, 255);
    shininess(100);
    sphere(this.size);
    pop();
  }
}

function updateSpheres() {
  // Apply attraction/separation forces between spheres
  for (let i = 0; i < spheres.length; i++) {
    for (let j = i + 1; j < spheres.length; j++) {
      const sphere1 = spheres[i];
      const sphere2 = spheres[j];
      
      let distance = p5.Vector.dist(sphere1.pos, sphere2.pos);
      
      if (distance < SEPARATION_THRESHOLD) {
        // Calculate attraction force
        let force = p5.Vector.sub(sphere2.pos, sphere1.pos);
        force.normalize();
        force.mult(ATTRACTION_FORCE * (1 - distance / SEPARATION_THRESHOLD));
        
        sphere1.applyForce(force.mult(-1));
        sphere2.applyForce(force);
      } else if (distance < SEPARATION_THRESHOLD * 1.5 && spheres.length < 20) {
        // If spheres are close but beyond threshold, consider subdivision
        subdivide(i, j);
      }
    }
  }
}

function subdivide(index1, index2) {
  const sphere1 = spheres[index1];
  const sphere2 = spheres[index2];
  
  if (sphere1.pos.y < height/2 - SPHERE_SIZE) {
    // Create new smaller sphere at midpoint
    let midpoint = p5.Vector.add(sphere1.pos, sphere2.pos).mult(0.5);
    spheres.push(new WaterSphere(midpoint.x, midpoint.y, midpoint.z));
  }
}

function draw() {
  background(20);
  
  // Set up lights
  pointLight(255, 255, 255, 0, -200, 200);
  ambientLight(100);
  
  // Set up camera
  orbitControl();
  
  // Draw ground plane
  push();
  translate(0, height/2, 0);
  rotateX(HALF_PI);
  fill(80);
  plane(1000, 1000);
  pop();
  
  // Update and display spheres
  updateSpheres();
  for (let sphere of spheres) {
    sphere.update();
    sphere.display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}