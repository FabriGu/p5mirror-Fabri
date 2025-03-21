let spirals = [];
const PHI = (1 + Math.sqrt(5)) / 2;
const TOTAL_SPIRALS = 20;
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  for (let i = 0; i < TOTAL_SPIRALS; i++) {
    spirals.push({
      x: random(width),
      y: random(height),
      angle: random(TWO_PI),
      radius: random(2, 5),
      speed: random(0.01, 0.03),
      hue: random(360)
    });
  }
}
function draw() {
  // background(0, 0.05);
  translate(width/2, height/2);
  // let time = frameCount * 0.01;
  let time = frameCount * 10;
  spirals.forEach((spiral, i) => {
    let points = [];
    for (let angle = 0; angle < TWO_PI * 8; angle += 0.1) {
      let radius = spiral.radius * pow(PHI, angle);
      let x = cos(angle + spiral.angle + time * spiral.speed) * radius;
      let y = sin(angle + spiral.angle + time * spiral.speed) * radius;
      points.push({x, y});
    }
    beginShape();
    stroke(spiral.hue, 255, 255, 1);
    strokeWeight(2);
    noFill();
    for (let p of points) {
      let wobble = noise(p.x * 0.01, p.y * 0.01, time) * 20;
      vertex(p.x + wobble, p.y + wobble);
    }
    endShape();
    spiral.angle += spiral.speed;
    spiral.hue = (spiral.hue + 0.5) % 360;
    if (frameCount % 60 === 0) {
      let nearestSpiral = spirals[(i + 1) % TOTAL_SPIRALS];
      spiral.speed = lerp(spiral.speed, nearestSpiral.speed, 0.1);
    }
  });
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}