let states = ['Noise', 'Muscle', 'Focus', 'Clear', 'Meditate'];
let stateColors = {
  'Noise': '#FF6B6B',    // Coral red
  'Muscle': '#4ECDC4',   // Turquoise
  'Focus': '#45B7D1',    // Sky blue
  'Clear': '#96CEB4',    // Sage green
  'Meditate': '#9B89B6'  // Lavender
};

let orbRadius = 100;
let lineLength = 150;
let numParticles = 50;
let particles = [];

function setup() {
  createCanvas(800, 800);
  
  // Initialize particles for each state
  states.forEach((state, index) => {
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        state: state,
        angle: random(TWO_PI),
        speed: random(0.01, 0.02),
        radius: random(orbRadius + 20, orbRadius + lineLength),
        alpha: random(100, 255)
      });
    }
  });
}

function draw() {
  background(20);
  
  // Draw central orb
  push();
  translate(width/2, height/2);
  
  // Draw glowing effect for orb
  for (let i = 10; i > 0; i--) {
    fill(255, 255, 255, 5);
    noStroke();
    circle(0, 0, orbRadius * 2 + i * 4);
  }
  
  // Draw solid orb
  fill(255);
  noStroke();
  circle(0, 0, orbRadius * 2);
  
  // Draw particles
  particles.forEach(particle => {
    let x = cos(particle.angle) * particle.radius;
    let y = sin(particle.angle) * particle.radius;
    
    // Draw line segment
    stroke(color(stateColors[particle.state] + hex(particle.alpha, 2)));
    strokeWeight(2);
    let lineStart = particle.radius - 10;
    let lineEnd = particle.radius + 10;
    line(
      cos(particle.angle) * lineStart,
      sin(particle.angle) * lineStart,
      cos(particle.angle) * lineEnd,
      sin(particle.angle) * lineEnd
    );
    
    // Update particle position
    particle.angle += particle.speed;
  });
  
  // Draw legend
  drawLegend();
  pop();
}

function drawLegend() {
  let legendX = -width/2 + 30;
  let legendY = -height/2 + 30;
  let spacing = 25;
  
  states.forEach((state, index) => {
    fill(stateColors[state]);
    noStroke();
    rect(legendX, legendY + index * spacing, 20, 3);
    
    fill(255);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(14);
    text(state, legendX + 30, legendY + index * spacing);
  });
}

// Simulate changing states (in real implementation, this would be driven by EEG data)
function getRandomState() {
  return states[floor(random(states.length))];
}

// Function to update visualization based on real EEG data
function updateStates(newStates) {
  // This function would be called with real EEG data
  // For now, we're just using the animation defined in draw()
}