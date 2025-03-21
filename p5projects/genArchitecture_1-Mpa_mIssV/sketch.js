let handpose;
let video;
let hands = [];
let towers = [];
let lastPinchY = 0;
let isPinching = false;

// let baseHue;
let incrementor = 7;
class Tower {
  constructor(x, z) {
    this.x = x;
    this.z = z;
    this.segments = [];
    this.targetHeight = 0;
    this.growing = false;
    this.baseHue = random(0,360);
    this.cylinderRadius = 10; // Base radius for the central cylinder
  }
  
  grow(amount) {
    if (this.segments.length < 30) { // limit tower height
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
    
    // Draw the central cylinder first
    if (this.segments.length > 0) {
      push();
      let totalHeight = this.segments.length * 15;
      translate(0, -totalHeight/2, 0);
      fill(this.baseHue, 40, 50);
      noStroke();
      // Draw cylinder with height based on tower height
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
  // Load the handpose model
  handpose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  // Start detecting hands from the webcam video
  handpose.detectStart(video, gotHands);
  
  colorMode(HSB);
}

function draw() {
  background(0);
  
  // Set up 3D scene
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
    
    // Calculate center point between finger and thumb
    let centerX = (finger.x + thumb.x) / 2;
    let centerY = (finger.y + thumb.y) / 2;
    
    // Map center point to floor position
    let floorX = map(centerX, 0, width, -400, 400);
    let floorZ = map(centerY, 0, height, -400, 400);
    
    // Calculate pinch distance
    let pinchDistance = dist(finger.x, finger.y, thumb.x, thumb.y);
    let newPinching = pinchDistance < 50; // Adjust threshold as needed
    
    // Draw floor indicator
    push();
    translate(floorX, 0, floorZ);
    rotateX(HALF_PI);
    stroke(newPinching ? '#ff0000' : '#ffffff');
    fill(newPinching ? '#ff000044' : '#ffffff44');
    circle(0, 0, 50);
    pop();
    
    // Handle pinch gesture
    if (newPinching && !isPinching) {
      // Start new tower
      towers.push(new Tower(floorX, floorZ));
      lastPinchY = centerY;
    } else if (newPinching && isPinching) {
      // Grow existing tower
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
}

function gotHands(results) {
  hands = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}