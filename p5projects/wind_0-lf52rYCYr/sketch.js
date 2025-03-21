let emitters = [];
const NUM_CANDLES = 3;

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    // Upward motion with slight randomness like original
    let vx = randomGaussian(0, 0.3);
    let vy = randomGaussian(-1, 0.3);
    this.velocity = createVector(vx, vy);
    this.acceleration = createVector(0, 0);
    this.lifespan = 100.0;
    this.size = random(15, 25);
  }

  run() {
    this.update();
    this.show();
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.lifespan -= 2;
    this.acceleration.mult(0);
  }

  show() {
    // Create soft, smoke-like particles
    noStroke();
    
    // Draw multiple overlapping circles for soft edge effect
    let numLayers = 3;
    for (let i = 0; i < numLayers; i++) {
      let alpha = this.lifespan * (1 - i/numLayers);
      fill(255, alpha);
      let currentSize = this.size * (1 - i * 0.2);
      circle(this.position.x, this.position.y, currentSize);
    }
  }

  isDead() {
    return this.lifespan < 0.0;
  }
}

class Emitter {
  constructor(x, y) {
    this.particles = [];
    this.origin = createVector(x, y);
  }

  run() {
    for (let particle of this.particles) {
      particle.run();
    }
    this.particles = this.particles.filter(particle => !particle.isDead());
  }

  applyForce(force) {
    for (let particle of this.particles) {
      particle.applyForce(force);
    }
  }

  addParticle() {
    // Add slight horizontal variation for flame-like effect
    let xOffset = randomGaussian(0, 2);
    this.particles.push(new Particle(this.origin.x + xOffset, this.origin.y));
  }
}

function setup() {
  createCanvas(640, 360);
  
  // Create multiple candle emitters in a row
  let spacing = 60;  // Space between candles
  let centerX = width / 2;
  let startX = centerX - ((NUM_CANDLES - 1) * spacing) / 2;
  
  for (let i = 0; i < NUM_CANDLES; i++) {
    emitters.push(new Emitter(startX + i * spacing, height - 75));
  }
}

function draw() {
  clear();  // Clear the canvas
  background(0);  // Set black background
  
  // Create wind gusts that affect all candles
  let timeElapsed = frameCount * 0.01;  // Changed variable name
  // Main wind force
  let windStrength = noise(timeElapsed) * 0.3;
  // Add occasional stronger gusts
  let gust = noise(timeElapsed * 0.5) > 0.7 ? noise(timeElapsed * 2) * 0.4 : 0;
  let totalWind = windStrength + gust;
  
  let wind = createVector(totalWind, 0);
  
  // Draw debug wind vector
  drawVector(wind, createVector(50, 50), 500);
  
  // Draw candle bases
  fill(200);
  noStroke();
  for (let emitter of emitters) {
    rect(emitter.origin.x - 5, emitter.origin.y, 10, 20);
  }
  
  blendMode(ADD);  // Set additive blending for particles
  for (let emitter of emitters) {
    emitter.applyForce(wind);
    emitter.run();
    emitter.addParticle();
  }
  blendMode(BLEND);  // Reset blend mode
}

function drawVector(v, pos, scale) {
  push();
  let arrowSize = 4;
  translate(pos.x, pos.y);
  stroke(255);
  rotate(v.heading());
  let len = v.mag() * scale;
  line(0, 0, len, 0);
  line(len, 0, len - arrowSize, +arrowSize / 2);
  line(len, 0, len - arrowSize, -arrowSize / 2);
  pop();
}