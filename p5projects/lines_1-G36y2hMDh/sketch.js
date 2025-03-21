let sets = [];
const numSets = 4;
const maxDist = 300;
const speed = 1;
let baseHue = 200;

function setup() {
  createCanvas(800, 800);
  for (let i = 0; i < numSets; i++) {
    sets.push({
      progress: i * (1/numSets)
    });
  }
  // colorMode(HSB)
}

function draw() {
  background(255);
  translate(width/2, height/2);

  
  
  // Center lines
  stroke(baseHue, 100,20);
  console.log(baseHue)
  strokeWeight(1);
  // baseHue = (baseHue + 10) % 360;
  
  line(0, -maxDist, 0, maxDist);
  line(-maxDist, 0, maxDist, 0);
  
  sets.forEach((set, idx) => {
    set.progress += speed/150;
    if (set.progress >= 1) {
      set.progress = 0;
    }
    
    let distance = set.progress * maxDist;
    let yPoints = [-maxDist, -(maxDist/4*3), -(maxDist/4*2), -(maxDist/4*1)].map(y => y * set.progress);
    let xPoints = [(maxDist/4*1), (maxDist/4*2), (maxDist/4*3), maxDist].map(x => x * set.progress);
    
    // Calculate opacity based on progress
    let opacity = set.progress >= 0.9 ? map(set.progress, 0.9, 1, 255, 0) : 255;
    
    for (let i = 0; i < yPoints.length; i++) {
      stroke(0, opacity);
      // Top left
      line(0, yPoints[i], -xPoints[i], 0);
      // Top right
      line(0, yPoints[i], xPoints[i], 0);
      // Bottom left
      line(0, -yPoints[i], -xPoints[i], 0);
      // Bottom right
      line(0, -yPoints[i], xPoints[i], 0);
    }
  });
}