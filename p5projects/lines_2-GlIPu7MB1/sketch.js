let sets = [];
const numSets = 4;
const maxDist = 350;
const speed = 1;
let baseHue = 0;

function setup() {
  createCanvas(800, 800);
  colorMode(HSB);
  for (let i = 0; i < numSets; i++) {
    sets.push({
      progress: i * (1/numSets),
      hue: (baseHue + (i * 60)) % 360
    });
  }
}

function draw() {
  background(0, 0.03);
  translate(width/2, height/2);
  
  // Center lines
  stroke(0, 0, 20);
  strokeWeight(5);
  // line(0, -maxDist, 0, maxDist);
  // line(-maxDist, 0, maxDist, 0);
  
  sets.forEach((set, idx) => {
    set.progress += speed/150;
    if (set.progress >= 1) {
      set.progress = 0;
      set.hue = (baseHue + 25) % 360;
      baseHue = set.hue;
    }
    
    let distance = set.progress * maxDist;
    let yPoints = [-maxDist, -(maxDist/4*3), -(maxDist/4*2), -(maxDist/4*1)].map(y => y * set.progress);
    let xPoints = [(maxDist/4*1), (maxDist/4*2), (maxDist/4*3), maxDist].map(x => x * set.progress);
    
    let opacity = set.progress >= 0.9 ? map(set.progress, 0.9, 1, 1, 0) : 1;
    
    for (let i = 0; i < yPoints.length; i++) {
      stroke(set.hue, 80, 70, opacity);
      line(0, yPoints[i], -xPoints[i], 0);
      line(0, yPoints[i], xPoints[i], 0);
      line(0, -yPoints[i], -xPoints[i], 0);
      line(0, -yPoints[i], xPoints[i], 0);
    }
  });
  
  push();
  
  sets.forEach((set, idx) => {
    rotate(QUARTER_PI)
    // set.progress += speed/150;
    if (set.progress >= 1) {
    //   set.progress = 0;
      set.hue = (baseHue + 25) % 360;
    //   baseHue = set.hue;
    }
    
    let distance = set.progress * maxDist;
    let yPoints = [-maxDist, -(maxDist/4*3), -(maxDist/4*2), -(maxDist/4*1)].map(y => y * set.progress);
    let xPoints = [(maxDist/4*1), (maxDist/4*2), (maxDist/4*3), maxDist].map(x => x * set.progress);
    
    let opacity = set.progress >= 0.9 ? map(set.progress, 0.9, 1, 1, 0) : 1;
    
    for (let i = 0; i < yPoints.length; i++) {
      stroke(set.hue, 80, 70, opacity);
      line(0, yPoints[i], -xPoints[i], 0);
      line(0, yPoints[i], xPoints[i], 0);
      line(0, -yPoints[i], -xPoints[i], 0);
      line(0, -yPoints[i], xPoints[i], 0);
    }
  });
  pop()
}