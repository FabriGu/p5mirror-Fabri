let handpose;
let video;
let hands = [];
let towers = [];
let lastPinchY = 0;
let isPinching = false;
let incrementor = 10;

class Tower {
  constructor(x, z) {
    this.x = x;
    this.z = z;
    this.segments = [];
    this.targetHeight = 0;
    this.growing = false;
    this.baseHue = random(0,360);
    this.cylinderRadius = 10;
  }
  
  getHeight() {
    return this.segments.length * 15;
  }
  
  grow(amount) {
    if (this.segments.length < 30) {
      this.targetHeight += amount;
      this.growing = true;
    }
  }
  
  update() {
    if (this.growing) {
      if (this.segments.length * 15 < this.targetHeight) {
        this.segments.push({
          rotation: this.segments.length * 15,
          y: this.segments.length * 15
        });
      }
    }
  }
  
  display() {
    push();
    translate(this.x, 0, this.z);
    
    // Draw central cylinder
    if (this.segments.length > 0) {
      push();
      let totalHeight = this.segments.length * 15;
      translate(0, -totalHeight/2, 0);
      fill(this.baseHue, 100, 90);
      noStroke();
      cylinder(this.cylinderRadius, totalHeight);
      pop();
    }
    
    let c = 0;
    for (let segment of this.segments) {
      push();
      translate(0, -segment.y-10, 0);
      rotateY(radians(segment.rotation));
      fill(((this.baseHue + incrementor*c)%360), 100, 100);
      c++;
      noStroke();
      box(40, 15, 40);
      pop();
    }
    pop();
  }
}
function drawBridge(tower1, tower2) {
  let distance = dist(tower1.x, tower1.z, tower2.x, tower2.z);
  let connectHeight = min(tower1.getHeight(), tower2.getHeight());
  
  // Only draw bridge if towers are close enough
  if (distance < 200) {
    push();
    
    // Calculate angle between towers
    let dx = tower2.x - tower1.x;
    let dz = tower2.z - tower1.z;
    let angle = atan2(dx, dz);
    
    // Position at midpoint between towers
    let midX = (tower1.x + tower2.x) / 2;
    let midZ = (tower1.z + tower2.z) / 2;
    
    translate(midX, -connectHeight-15, midZ);
    rotateY(angle+HALF_PI);
    
    // Draw connecting cylinder
    noStroke();
    
    // Create gradient effect with multiple small cylinders
    let segments = 10;
    let segmentLength = distance / segments;
    
    for (let i = 0; i < segments; i++) {
      let t = i / segments;
      fill(lerpColor(
        color(tower1.baseHue, 100, 90),
        color(tower2.baseHue, 100, 90),
        t
      ));
      
      push();
      translate(-distance/2 + segmentLength * (i + 0.5), 0, 0);
      rotateZ(-HALF_PI);
      cylinder(tower1.cylinderRadius, segmentLength * 1.1); // Slight overlap
      pop();
    }
    
    pop();
  }
}

function connectNearbyTowers() {
  let maxDistance = 200; // Maximum distance for towers to be connected
  
  for (let i = 0; i < towers.length; i++) {
    for (let j = i + 1; j < towers.length; j++) {
      let distance = dist(towers[i].x, towers[i].z, towers[j].x, towers[j].z);
      if (distance < maxDistance && 
          towers[i].getHeight() > 30 && 
          towers[j].getHeight() > 30) {
        drawBridge(towers[i], towers[j]);
      }
    }
  }
}

function preload() {
  handpose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  handpose.detectStart(video, gotHands);
  colorMode(HSB);
}

function draw() {
  background(0);
  orbitControl();
  lights();
  
  // Draw floor grid
  push();
  rotateX(HALF_PI);
  stroke(100);
  noFill();
  for (let x = -400; x <= 400; x += 50) {
    line(x, -400, x, 400);
    line(-400, x, 400, x);
  }
  pop();
  
  // Process hand tracking
  if (hands.length > 0) {
    let finger = hands[0].index_finger_tip;
    let thumb = hands[0].thumb_tip;
    
    let centerX = (finger.x + thumb.x) / 2;
    let centerY = (finger.y + thumb.y) / 2;
    
    let floorX = map(centerX, 0, width, -400, 400);
    let floorZ = map(centerY, 0, height, -400, 400);
    
    let pinchDistance = dist(finger.x, finger.y, thumb.x, thumb.y);
    let newPinching = pinchDistance < 50;
    
    // Draw floor indicator
    push();
    translate(floorX, 0, floorZ);
    rotateX(HALF_PI);
    stroke(newPinching ? '#ff0000' : '#ffffff');
    fill(newPinching ? '#ff000044' : '#ffffff44');
    circle(0, 0, 50);
    pop();
    
    if (newPinching && !isPinching) {
      towers.push(new Tower(floorX, floorZ));
      lastPinchY = centerY;
    } else if (newPinching && isPinching) {
      let yDiff = lastPinchY - centerY;
      if (towers.length > 0) {
        towers[towers.length - 1].grow(yDiff * 0.5);
      }
      lastPinchY = centerY;
    }
    
    isPinching = newPinching;
  }
  
  // Update and display towers
  for (let tower of towers) {
    tower.update();
    tower.display();
  }
  
  // Draw connecting arches
  connectNearbyTowers();
}

function gotHands(results) {
  hands = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}