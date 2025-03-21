let sets = [];
const numSets = 4;
const maxDist = 90;
const speed = 1;

function setup() {
  createCanvas(800, 800);
  for (let i = 0; i < numSets; i++) {
    sets.push({
      progress: i * (1/numSets)
    });
  }
}

function draw() {
  background(255);
  translate(width/2, height/2);
  
  // Center lines
  stroke(0);
  strokeWeight(0.1);
  line(0, -maxDist, 0, maxDist);
  line(-maxDist, 0, maxDist, 0);
  
  sets.forEach((set, idx) => {
    set.progress += speed/150;
    if (set.progress >= 1) {
      set.progress = 0;
    }
    
    let dist = set.progress * maxDist;
    let yPoints = [-90, -70, -50, -20].map(y => y * set.progress);
    let xPoints = [20, 40, 60, 90].map(x => x * set.progress);
    
    for (let i = 0; i < yPoints.length; i++) {
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