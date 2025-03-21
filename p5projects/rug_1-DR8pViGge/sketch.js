let img;
let fluid;
let rugPixels = [];
let margin = 100;
let pixelSize = 4;
let meltStartTime;
let meltDuration = 5; // seconds
let isMelting = false;
let meltProgress = 0;
let lastMeltY = 0;

function preload() {
  img = loadImage('rug3.png');
}

function setup() {
  createCanvas(1080, 1080);
  pixelDensity(1);
  noSmooth();
  
  // Initialize fluid
   fluid = new Fluid(0.1, 0.0001, 0.8);  // Much higher viscosity
  
  
  resetMelt();
}

function resetMelt() {
  rugPixels = [];
  isMelting = true;
  meltStartTime = millis();
  
  // Resize image to fit within canvas margins
  let aspectRatio = img.width / img.height;
  let maxHeight = height - 2 * margin;
  let maxWidth = width - 2 * margin;
  let newHeight = maxHeight;
  let newWidth = maxHeight * aspectRatio;
  
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = maxWidth / aspectRatio;
  }
  
  // Calculate position to center the image
  let x = (width - newWidth) / 2;
  let y = margin;
  
  img.resize(newWidth, newHeight);
  img.loadPixels();
  
  // Store pixel information with fluid simulation coordinates
  for (let i = 0; i < img.width; i += pixelSize) {
    for (let j = 0; j < img.height; j += pixelSize) {
      let index = 4 * (j * img.width + i);
      if (img.pixels[index + 3] > 0) {
        let fluidX = floor(map(i, 0, img.width, 0, N));
        let fluidY = floor(map(j, 0, img.height, 0, N));
        rugPixels.push({
          x: x + i,
          y: y + j,
          origX: x + i,
          origY: y + j,
          fluidX: fluidX,
          fluidY: fluidY,
          r: img.pixels[index],
          g: img.pixels[index + 1],
          b: img.pixels[index + 2],
          a: img.pixels[index + 3],
        });
      }
    }
  }
}

function draw() {
  background(255);
  
  // Slowly increase melt progress
  meltProgress += 0.001;
  
  // Calculate current melt line
  let meltLine = height - margin -meltProgress * (height - 2 * margin);
  
  // Add density only at the current melt line
  for (let i = 1; i < N-1; i++) {
    if (random() < 0.1) {  // Randomly initiate melting points
      let y = floor(map(meltLine, 0, height, 0, N));
      fluid.addDensity(i, y, 50);
      fluid.addVelocity(i, y, random(-0.2, 0.2), 0.5);
    }
  }
  
  fluid.step();
  
  // Draw pixels with melting effect
  noStroke();
  rugPixels.forEach(p => {
    let y = p.origY;
    let x = p.origX;
    
    if (y > meltLine - 20) {  // Start affecting pixels near melt line
      let fluidX = floor(map(x, 0, width, 0, N));
      let fluidY = floor(map(y, 0, height, 0, N));
      let idx = IX(fluidX, fluidY);
      
      // Get fluid velocities with smoothing
      let vx = fluid.Vx[idx] * 0.5;
      let vy = fluid.Vy[idx] * 0.5;
      
      // Apply fluid movement with cohesion
      p.x += vx;
      p.y += vy;
      
      // Add cohesion by limiting distance from original position
      let dx = p.x - p.origX;
      let dy = p.y - p.origY;
      let dist = sqrt(dx * dx + dy * dy);
      if (dist > 30) {
        let angle = atan2(dy, dx);
        p.x = p.origX + cos(angle) * 30;
        p.y = p.origY + sin(angle) * 30;
      }
    }
    
    fill(p.r, p.g, p.b, p.a);
    rect(p.x, p.y, pixelSize, pixelSize);
  });
}