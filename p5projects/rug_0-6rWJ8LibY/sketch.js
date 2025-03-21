let img;
let fluid;
let rugPixels = [];
let margin = 100;
let pixelSize = 4;
let meltStartTime;
let meltDuration = 5; // seconds
let isMelting = false;

function preload() {
  img = loadImage('rug3.png');
}

function setup() {
  createCanvas(1080, 1080);
  pixelDensity(1);
  noSmooth();
  
  // Initialize fluid
  fluid = new Fluid(0.1, 0, 0.0000001);
  
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
  
  let progress = (millis() - meltStartTime) / (meltDuration * 1000);
  
  // Add gentle downward force to fluid
  let cy = floor(N/2);
  for (let i = 1; i < N-1; i++) {
    fluid.addVelocity(i, cy, 0, 0.1);
  }
  
  fluid.step();
  
  // Draw pixels affected by fluid
  noStroke();
  rugPixels.forEach(p => {
    if (p.y > height/2) {  // Only affect pixels below halfway point
      // Get fluid velocities
      let index = IX(p.fluidX, p.fluidY);
      let vx = fluid.Vx[index];
      let vy = fluid.Vy[index];
      
      // Apply velocities to pixel positions
      p.x += vx * 2;
      p.y += vy * 2 + progress * 0.5;
    }
    
    fill(p.r, p.g, p.b, p.a);
    rect(p.x, p.y, pixelSize, pixelSize);
  });
  
  // Optional: add some random fluid motion
  if (frameCount % 20 === 0) {
    let rx = floor(random(1, N-1));
    fluid.addVelocity(rx, cy, random(-0.1, 0.1), 0);
  }
}