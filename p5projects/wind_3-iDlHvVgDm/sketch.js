let emitters = [];
const INNER_CANDLES = 3;
const OUTER_CANDLES = 3;  // More candles in outer ring

class Particle {
  constructor(x, y, baseHue) {
    this.position = createVector(x, y);
    let vx = randomGaussian(0, 0.3);
    let vy = randomGaussian(-1, 0.3);
    this.velocity = createVector(vx, vy);
    this.acceleration = createVector(0, 0);
    this.lifespan = 100.0;
    this.size = random(12, 20);
    this.baseHue = baseHue;
    this.hueOffset = random(-10, 10);
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
    this.lifespan -= 1.5;
    this.acceleration.mult(0);
  }

  show() {
    noStroke();
    colorMode(HSB, 360, 100, 100, 100);
    let numLayers = 3;
    for (let i = 0; i < numLayers; i++) {
      let alpha = this.lifespan * (1 - i/numLayers) / 100 * 70;
      let hue = (this.baseHue + this.hueOffset) % 360;
      fill(hue, 80, 100, alpha);
      let currentSize = this.size * (1 - i * 0.2);
      circle(this.position.x, this.position.y, currentSize);
    }
    colorMode(RGB);
  }

  isDead() {
    return this.lifespan < 0.0;
  }
}

class Emitter {
  constructor(centerX, centerY, radius, angleOffset) {
    this.particles = [];
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.angleOffset = angleOffset;
    this.origin = createVector(0, 0);
    this.updatePosition(0);
  }

  updatePosition(timeElapsed) {
    let angle = timeElapsed * 0.5 + this.angleOffset;
    this.origin.x = this.centerX + cos(angle) * this.radius;
    this.origin.y = this.centerY + sin(angle) * this.radius;
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

  addParticle(currentHue) {
    for (let i = 0; i < 2; i++) {
      let xOffset = randomGaussian(0, 2);
      this.particles.push(new Particle(
        this.origin.x + xOffset, 
        this.origin.y,
        currentHue
      ));
    }
  }
}

function setup() {
  createCanvas(1080, 1080);
  
  // Center point for both circles
  let centerX = width/2;
  let centerY = height/2;  // Moved to vertical center
  
  // Inner circle of emitters
  let innerRadius = 40;
  for (let i = 0; i < INNER_CANDLES; i++) {
    let angleOffset = (TWO_PI / INNER_CANDLES) * i;
    let radius = innerRadius + random(-5, 5);
    emitters.push(new Emitter(centerX, centerY, radius, angleOffset));
  }
  
  // Outer circle of emitters
  let outerRadius = 200;  // Larger radius for outer circle
  for (let i = 0; i < OUTER_CANDLES; i++) {
    let angleOffset = (TWO_PI / OUTER_CANDLES) * i;
    let radius = outerRadius + random(-5, 5);
    emitters.push(new Emitter(centerX, centerY, radius, angleOffset));
  }
}

function draw() {
  clear();
  background(0);
  
  let timeElapsed = frameCount * 0.01;
  
  // Color cycling between purple (270) and red (360)
  let currentHue = map(sin(timeElapsed), -1, 1, 270, 360);
  
  let windStrength = noise(timeElapsed) * 0.3;
  let gust = noise(timeElapsed * 0.5) > 0.7 ? noise(timeElapsed * 2) * 0.4 : 0;
  let totalWind = windStrength + gust;
  
  let wind = createVector(totalWind, 0);
  
  // Update emitter positions
  for (let emitter of emitters) {
    emitter.updatePosition(timeElapsed);
  }
  
  blendMode(ADD);
  for (let emitter of emitters) {
    emitter.applyForce(wind);
    emitter.run();
    emitter.addParticle(currentHue);
  }
  blendMode(BLEND);
}