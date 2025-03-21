let handpose;
let video;
let hands = [];
let towers = [];
let lastPinchY = 0;
let isPinching = false;
let incrementor = 7;
let lastPinchToggleTime = 0;
const DEBOUNCE_DELAY = 500; // 500ms debounce

// Add smoothing variables
let smoothedX = 0;
let smoothedY = 0;
let smoothedPinch = 0;
const smoothingFactor = 0.3; // Adjust this value between 0 and 1

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
    
    if (this.segments.length > 0) {
      push();
      let totalHeight = this.segments.length * 15;
      translate(0, -totalHeight/2, 0);
      fill(this.baseHue, 40, 50);
      noStroke();
      cylinder(this.cylinderRadius, totalHeight);
      pop();
    }
    
    let c = 0;
    for (let segment of this.segments) {
      push();
      translate(0, -segment.y-10, 0);
      rotateY(radians(segment.rotation));
      fill(((this.baseHue + incrementor*c)%360), 40, 70);
      c++;
      noStroke();
      box(40, 12, 40);
      pop();
    }
    pop();
  }
}

function preload() {
  handpose = ml5.handPose();
}

function setup() {
  createCanvas(1080, 1080, WEBGL);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  handpose.detectStart(video, gotHands);
  colorMode(HSB);
}

function smoothValue(current, target, factor) {
  return current + (target - current) * factor;
}

function draw() {
  background(0);
  
  orbitControl();
  lights();
  
  push();
  rotateX(HALF_PI);
  stroke(100);
  noFill();
  for (let x = -400; x <= 400; x += 50) {
    line(x, -400, x, 400);
    line(-400, x, 400, x);
  }
  pop();
  
  if (hands.length > 0) {
    let finger = hands[0].index_finger_tip;
    let thumb = hands[0].thumb_tip;
    
    let centerX = (finger.x + thumb.x) / 2;
    let centerY = (finger.y + thumb.y) / 2;
    
    // Smooth the position values
    smoothedX = smoothValue(smoothedX, centerX, smoothingFactor);
    smoothedY = smoothValue(smoothedY, centerY, smoothingFactor);
    
    // Flip the X coordinate by subtracting from width
    let floorX = map(width - smoothedX, 0, width, -400, 400);
    let floorZ = map(smoothedY, 0, height, -400, 400);
    
    // Calculate and smooth pinch distance
    let pinchDistance = dist(finger.x, finger.y, thumb.x, thumb.y);
    smoothedPinch = smoothValue(smoothedPinch, pinchDistance, smoothingFactor);
    let newPinching = smoothedPinch < 50;
    
    // Only show circle when not actively building a tower
    if (!isPinching || !towers.length || !towers[towers.length-1].growing) {
      push();
      translate(floorX, 0, floorZ);
      rotateX(HALF_PI);
      stroke(newPinching ? '#ff0000' : '#ffffff');
      fill(newPinching ? '#ff000044' : '#ffffff44');
      circle(0, 0, 50);
      pop();
    }
    
    let currentTime = millis();
    if (newPinching && !isPinching && currentTime - lastPinchToggleTime > DEBOUNCE_DELAY) {
      towers.push(new Tower(floorX, floorZ));
      lastPinchY = smoothedY;
      lastPinchToggleTime = currentTime;
    } else if (newPinching && isPinching) {
      let yDiff = lastPinchY - smoothedY;
      if (towers.length > 0) {
        towers[towers.length - 1].grow(yDiff * 0.5);
      }
      lastPinchY = smoothedY;
    }
    
    isPinching = newPinching;
  }
  
  for (let tower of towers) {
    tower.update();
    tower.display();
  }
}

function gotHands(results) {
  hands = results;
}

function windowResized() {
  resizeCanvas(1080, 1080);
}