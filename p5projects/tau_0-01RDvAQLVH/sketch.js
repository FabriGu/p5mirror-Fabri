let time = 0;

function setup() {
  createCanvas(800, 800, WEBGL);
  colorMode(HSB);
  noStroke();
}

function draw() {
  background(0);
  
  // Calculate time progression for 10-second loop
  time = (time + TAU/600) % TAU;
  
  // Base purple hue (270 in HSB) normalized to TAU
  let baseHue = TAU * (270/360);
  
  // Create multiple layers of rotating geometry
  for (let i = 0; i < TAU; i += TAU/24) {
    push();
    
    // Rotate based on current time and position
    rotateZ(time + i);
    rotateX(time * TAU/4);
    
    // Calculate varying hue
    let hue = (baseHue + sin(time + i) * TAU/36) % TAU; // +/- 10 degrees
    
    // Set color with full saturation and brightness
    fill(hue * (360/TAU), 80, 100);
    
    // Create geometric pattern
    beginShape(TRIANGLE_STRIP);
    for (let angle = 0; angle < TAU; angle += TAU/48) {
      let radius = TAU * (TAU + sin(angle * TAU + time * TAU));
      let x = cos(angle) * radius;
      let y = sin(angle) * radius;
      vertex(x, y, 0);
      
      let innerRadius = radius * (TAU/4);
      x = cos(angle + TAU/48) * innerRadius;
      y = sin(angle + TAU/48) * innerRadius;
      vertex(x, y, 0);
    }
    endShape(CLOSE);
    
    pop();
  }
  
  // Create mirrored layer for more complexity
  rotateY(TAU/4);
  for (let i = 0; i < TAU; i += TAU/24) {
    push();
    rotateZ(-time + i);
    rotateX(-time * TAU/4);
    
    let hue = (baseHue - sin(time + i) * TAU/36) % TAU;
    fill(hue * (360/TAU), 80, 100);
    
    beginShape(TRIANGLE_STRIP);
    for (let angle = 0; angle < TAU; angle += TAU/48) {
      let radius = TAU * (TAU + cos(angle * TAU + time * TAU));
      let x = cos(angle) * radius;
      let y = sin(angle) * radius;
      vertex(x, y, 0);
      
      let innerRadius = radius * (TAU/4);
      x = cos(angle + TAU/48) * innerRadius;
      y = sin(angle + TAU/48) * innerRadius;
      vertex(x, y, 0);
    }
    endShape(CLOSE);
    
    pop();
  }
}