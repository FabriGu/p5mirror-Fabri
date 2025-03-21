let ball;
let pyramid;
let camera;
let goingDown = true;
let lastHitIndex = -1;
let originalLevels = [];

function setup() {
  createCanvas(800, 800, WEBGL);
  colorMode(RGB);
  
  camera = createCamera();
  camera.camera(0, -200, 600, 0, 0, 200, 0, 2, 0);
  
  ball = {
    pos: createVector(0, -500, 0),
    vel: createVector(0, 0, 0),
    acc: createVector(0, 0.5, 0),
    radius: 20,
    bounceEnergy: 0.9,
    isColliding: false
  };
  
  initializePyramid();
}

function initializePyramid() {
  pyramid = [];
  originalLevels = [];
  const levels = 10;
  const baseSize = 400;
  const height = 20;
  
  for (let i = 0; i < levels; i++) {
    const level = {
      size: baseSize - (i * 40),
      height: height,
      y: (levels - 1 - i) * height,
      r: 180,
      g: 180,
      b: 180,
      alpha: 1,
      isHit: false,
      fadeStart: 0,
      index: i
    };
    pyramid.push(level);
    originalLevels.push({...level}); // Store original configuration
  }
  lastHitIndex = -1;
  goingDown = true;
}

function draw() {
  background(255);
  noStroke();
  
  ambientLight(60);
  directionalLight(255, 255, 255, -1, 1, -1);
  
  if (!ball.isColliding) {
    ball.vel.add(ball.acc);
    ball.pos.add(ball.vel);
  }
  
  // Handle respawning of levels when going up
  if (!goingDown && lastHitIndex > 0) {
    const nextRespawnIndex = lastHitIndex - 1;
    const levelToRespawn = originalLevels[nextRespawnIndex];
    
    if (!pyramid.some(l => l.index === nextRespawnIndex)) {
      const newLevel = {
        ...levelToRespawn,
        alpha: 0,
        isRespawning: true,
        fadeStart: millis(),
        r: floor(random(255)),
        g: floor(random(255)),
        b: floor(random(255))
      };
      pyramid.push(newLevel);
    }
  }
  
  for (let i = pyramid.length - 1; i >= 0; i--) {
    let level = pyramid[i];
    
    if (level.isRespawning) {
      let fadeProgress = (millis() - level.fadeStart) / 500;
      level.alpha = min(1, fadeProgress);
      if (level.alpha >= 1) {
        level.isRespawning = false;
      }
    } else if (level.isHit) {
      let fadeProgress = (millis() - level.fadeStart) / (500/(pyramid.length-i));
      level.alpha = max(0, 1 - fadeProgress);
      
      if (level.alpha <= 0) {
        pyramid.splice(i, 1);
        continue;
      }
    }
    
    if (!level.isHit && !level.isRespawning &&
        ball.pos.y + ball.radius > level.y && 
        ball.pos.y - ball.radius < level.y + level.height &&
        abs(ball.pos.x) < level.size/2 &&
        abs(ball.pos.z) < level.size/2) {
      
      ball.pos.y = level.y - ball.radius;
      ball.vel.y = -ball.vel.y * ball.bounceEnergy;
      ball.isColliding = true;
      
      if (goingDown) {
        level.isHit = true;
        level.fadeStart = millis();
        level.r = floor(random(255));
        level.g = floor(random(255));
        level.b = floor(random(255));
        lastHitIndex = level.index;
        
        // Check if this is the last block
        if (pyramid.filter(l => !l.isHit).length === 0) {
          goingDown = false;
        }
      }
      
      // If we hit the top level while going up, reset to going down
      if (!goingDown && level.index === 0) {
        goingDown = true;
        ball.bounceEnergy = 0.9;
      }
    }
    
    push();
    translate(0, level.y, 0);
    if (level.isHit || level.isRespawning) {
      fill(`rgba(${level.r}, ${level.g}, ${level.b}, ${level.alpha})`);
    } else {
      fill('rgba(180, 180, 180, 1)');
    }
    box(level.size, level.height, level.size);
    pop();
  }
  
  if (ball.vel.y < 0) {
    ball.isColliding = false;
  }
  
  push();
  translate(ball.pos.x, ball.pos.y, ball.pos.z);
  fill(255);
  sphere(ball.radius);
  pop();
  
  // Reset if ball falls too low
  if (ball.pos.y > 400) {
    ball.pos.y = -500;
    ball.vel.y = 0;
    initializePyramid();
  }
}