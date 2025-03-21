// Configuration
const NUM_LEVELS = 8;  // Easy to change number of levels
const BASE_SIZE = 200; // Size of bottom level
const LEVEL_HEIGHT = 40;
const LEVEL_SIZE_DECREASE = 40; // How much each level shrinks
const INITIAL_BALL_HEIGHT = -400; // Starting height for ball

let ball;
let pyramid;
let camera;

function createPyramid() {
  let levels = [];
  for (let i = 0; i < NUM_LEVELS; i++) {
    // Start from bottom (i=0) to top (i=NUM_LEVELS-1)
    levels.push({
      size: BASE_SIZE - ((NUM_LEVELS - 1 - i) * LEVEL_SIZE_DECREASE), // Largest at bottom
      height: LEVEL_HEIGHT,
      y: i * LEVEL_HEIGHT, // Build up from 0
      color: color(0, 0, 50), // More clearly gray
      isHit: false
    });
  }
  return levels;
}

function setup() {
  createCanvas(800, 600, WEBGL);
  colorMode(HSB);
  noStroke();
  
  // Initialize camera at 45 degrees above horizon
  camera = createCamera();
  camera.camera(0, -300, 300, 0, 0, 0, 0, 1, 0);
  
  // Create ball with physics properties
  ball = {
    pos: createVector(0, INITIAL_BALL_HEIGHT, 0),
    vel: createVector(0, 0, 0),
    acc: createVector(0, 0.5, 0), // gravity
    radius: 20,
    bounceEnergy: 0.7,
    isColliding: false
  };
  
  // Create initial pyramid
  pyramid = createPyramid();
}

function draw() {
  background(20);
  
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
      pyramid.splice(i, 1);
      continue;
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
      
      // Change color and mark as hit
      level.color = color(random(360), 80, 80);
      level.isHit = true;
    }
    
    // Draw level
    push();
    translate(0, level.y, 0);
    fill(level.color);
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
  
  // Reset ball if it falls below the bottom
  if (ball.pos.y > 400) {
    ball.pos.y = INITIAL_BALL_HEIGHT;
    ball.vel.y = 0;
    
    // Reset pyramid if all levels are gone
    if (pyramid.length === 0) {
      pyramid = createPyramid();
    }
  }
}