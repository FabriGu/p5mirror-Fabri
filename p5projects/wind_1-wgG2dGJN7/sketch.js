let emitters = [];
const NUM_CANDLES = 7;  // Increased number of candles

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    let vx = randomGaussian(0, 0.3);
    let vy = randomGaussian(-1, 0.3);
    this.velocity = createVector(vx, vy);
    this.acceleration = createVector(0, 0);
    this.lifespan = 100.0;
    this.size = random(12, 20);  // Slightly smaller particles for denser look
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
    this.lifespan -= 1.5;  // Slower fade for denser smoke
    this.acceleration.mult(0);
  }

  show() {
    noStroke();
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
    // Add more particles per frame for denser smoke
    for (let i = 0; i < 2; i++) {  // Creates 2 particles at once
      let xOffset = randomGaussian(0, 2);
      this.particles.push(new Particle(this.origin.x + xOffset, this.origin.y));
    }
  }
}

function setup() {
  createCanvas(640, 360);
  
  // Create more naturally placed emitters
  let positions = [
    {x: width * 0.2, y: height - 50},
    {x: width * 0.35, y: height - 85},
    {x: width * 0.45, y: height - 40},
    {x: width * 0.5, y: height - 90},
    {x: width * 0.65, y: height - 45},
    {x: width * 0.75, y: height - 75},
    {x: width * 0.85, y: height - 55}
  ];
  
  for (let pos of positions) {
    emitters.push(new Emitter(pos.x, pos.y));
  }
}

function draw() {
  clear();
  background(0);
  
  let timeElapsed = frameCount * 0.01;
  let windStrength = noise(timeElapsed) * 0.3;
  let gust = noise(timeElapsed * 0.5) > 0.7 ? noise(timeElapsed * 2) * 0.4 : 0;
  let totalWind = windStrength + gust;
  
  let wind = createVector(totalWind, 0);
  
  // Draw debug wind vector
  drawVector(wind, createVector(50, 50), 500);
  
  blendMode(ADD);
  for (let emitter of emitters) {
    emitter.applyForce(wind);
    emitter.run();
    emitter.addParticle();
  }
  blendMode(BLEND);
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