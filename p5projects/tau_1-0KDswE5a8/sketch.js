let time = 0;

function setup() {
  createCanvas(1200, 1200, WEBGL);
  colorMode(HSB);
  noStroke();
  orbitControl(TAU, TAU);
}

function draw() {
  background(0);
  translate(0,0,500);
  
  // Calculate time progression for 10-second loop
  time = (time + TAU/600) % TAU;
  
  // Base purple hue (270 in HSB) normalized to TAU
  let baseHue = TAU * (270/360);
  
  // Create multiple layers of rotating geometry with more spacing
  for (let i = 0; i < TAU; i += TAU/12) {
    push();
    
    // Spread elements out in 3D space using TAU
    let spreadX = cos(i) * TAU * TAU;
    let spreadY = sin(i) * TAU * TAU;
    let spreadZ = cos(i * TAU) * TAU * TAU;
    
    translate(spreadX, spreadY, spreadZ);
    
    // Rotate based on current time and position
    rotateZ(time + i);
    rotateX(time * TAU/4);
    rotateY(i);
    
    // Calculate varying hue
    let hue = (baseHue + sin(time + i) * TAU/36) % TAU;
    
    // Set color with full saturation and brightness
    fill(hue * (360/TAU), 80, 100);
    
    // Create thicker geometric elements
    for (let layer = 0; layer < TAU/2; layer += TAU/8) {
      push();
      translate(0, 0, layer * TAU);
      
      beginShape(TRIANGLE_STRIP);
      for (let angle = 0; angle < TAU; angle += TAU/24) {
        let radius = TAU * (TAU/2 + sin(angle * TAU + time * TAU));
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;
        
        // Add depth to the shape
        let z1 = sin(angle * TAU) * TAU;
        let z2 = sin((angle + TAU/24) * TAU) * TAU;
        
        vertex(x, y, z1);
        
        let innerRadius = radius * (TAU/4);
        x = cos(angle + TAU/24) * innerRadius;
        y = sin(angle + TAU/24) * innerRadius;
        vertex(x, y, z2);
      }
      endShape(CLOSE);
      pop();
    }
    
    // Add connecting elements between layers
    push();
    rotateX(TAU/4);
    for (let angle = 0; angle < TAU; angle += TAU/12) {
      beginShape(TRIANGLES);
      let radius = TAU * TAU/2;
      let x1 = cos(angle) * radius;
      let y1 = sin(angle) * radius;
      let x2 = cos(angle + TAU/12) * radius;
      let y2 = sin(angle + TAU/12) * radius;
      
      vertex(0, 0, -TAU);
      vertex(x1, y1, 0);
      vertex(x2, y2, 0);
      endShape();
    }
    pop();
    
    pop();
  }
  
  // Add central connecting structure
  push();
  rotateX(time);
  rotateY(time * TAU/4);
  for (let angle = 0; angle < TAU; angle += TAU/8) {
    push();
    rotateZ(angle);
    translate(TAU * TAU, 0, 0);
    box(TAU * TAU, TAU, TAU);
    pop();
  }
  pop();
}