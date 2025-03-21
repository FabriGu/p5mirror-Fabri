let ball;
let pyramid;
let camera;
function setup() {
  createCanvas(800, 800, WEBGL);
  colorMode(RGB);
  
  // Initialize camera at 45 degrees above horizon
  camera = createCamera();
  camera.camera(0, -200, 600, 0, 0, 200, 0, 2, 0);
  
  // Create ball with physics properties
  ball = {
    pos: createVector(0, -500, 0),
    vel: createVector(0, 0, 0),
    acc: createVector(0, 0.5, 0), // gravity
    radius: 20,
    bounceEnergy: 0.85, // energy loss on bounce
    isColliding: false
  };
  
  // Create pyramid levels
  pyramid = [];
  const levels = 10;
  const baseSize = 400;
  const height = 20;
  
  for (let i = 0; i < levels; i++) {
    pyramid.push({
      size: baseSize - (i * 40),
      height: height,
      y: (levels - 1 - i) * height,
      r: 180,
      g: 180,
      b: 180,
      alpha: 1,
      isHit: false,
      fadeStart: 0
    });
  }
}
function draw() {
  background(255);
  noStroke();
  
  // Lighting
  ambientLight(60);
  directionalLight(255, 255, 255, -1, 1, -1);
  
  // Update ball physics
  if (!ball.isColliding) {
    ball.vel.add(ball.acc);
    ball.pos.add(ball.vel);
  }
  
  // Draw and check collisions for each pyramid level
  for (let i = pyramid.length - 1; i >= 0; i--) {
    let level = pyramid[i];
    
    if (level.isHit) {
      // Fade out hit levels
      let fadeProgress = (millis() - level.fadeStart) / (500/(pyramid.length-i));
      level.alpha = max(0, 1 - fadeProgress);
      
      if (level.alpha <= 0) {
        pyramid.splice(i, 1);
        continue;
      }
    }
    
    // Check collision
    if (!level.isHit && 
        ball.pos.y + ball.radius > level.y && 
        ball.pos.y - ball.radius < level.y + level.height &&
        abs(ball.pos.x) < level.size/2 &&
        abs(ball.pos.z) < level.size/2) {
      
      // Collision response
      ball.pos.y = level.y - ball.radius;
      ball.vel.y = -ball.vel.y * ball.bounceEnergy;
      ball.isColliding = true;
      
      // Mark level as hit and set random RGB color
      level.isHit = true;
      level.fadeStart = millis();
      level.r = floor(random(255));
      level.g = floor(random(255));
      level.b = floor(random(255));
    }
    
    // Draw level
    push();
    translate(0, level.y, 0);
    if (level.isHit) {
      fill(`rgba(${level.r}, ${level.g}, ${level.b}, ${level.alpha})`);
    } else {
      fill('rgba(180, 180, 180, 1)');
    }
    box(level.size, level.height, level.size);
    pop();
  }
  
  // Reset collision flag if ball is moving up
  if (ball.vel.y < 0) {
    ball.isColliding = false;
  }
  
  // Draw ball
  push();
  translate(ball.pos.x, ball.pos.y, ball.pos.z);
  fill(255);
  sphere(ball.radius);
  pop();
}