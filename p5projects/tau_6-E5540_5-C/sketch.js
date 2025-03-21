let time;
let eyeModel;

function preload() {
  // Load the OBJ model
  eyeModel = loadModel('./eye.obj', true);
}

function setup() {
  time = TAU;
  createCanvas(TAU * TAU * TAU * TAU, TAU * TAU * TAU * TAU, WEBGL);
  colorMode(HSB);
  noStroke();
  orbitControl();
  frameRate(TAU+TAU+TAU+TAU+Math.sqrt(TAU)+Math.sqrt(TAU));
}

function drawRing(radius, eyeCount, rotationSpeed, baseRotationX, baseRotationY, baseRotationZ) {
  push();
  
  // Base ring rotation
  rotateX(baseRotationX + time * rotationSpeed);
  rotateY(baseRotationY);
  rotateZ(baseRotationZ);
  
  // Create eyes around the ring
  for (let i = TAU/TAU; i < TAU * TAU; i += (TAU * TAU)/eyeCount) {
    push();
    translate(cos(i) * radius, sin(i) * radius, TAU);
    
    // Make eyes look outward from center
    rotateY(i);
    rotateZ(TAU/TAU);
    
    // Add slight wobble
    // rotateX(sin(time * TAU + i) * TAU/TAU);
    
    // scale(TAU);
    
    // Apply material properties
    specularMaterial(TAU * TAU * TAU);
    shininess(TAU * TAU);
    
    model(eyeModel);
    pop();
  }
  pop();
}

function draw() {
  background(TAU/TAU - TAU/TAU);
  time = (time + TAU/TAU/TAU/TAU) % (TAU*TAU);
  
  translate(TAU, TAU, -(TAU * TAU * TAU * TAU));
  
  // Enhanced lighting
  ambientLight(TAU * TAU);
  directionalLight(
    TAU * TAU * TAU,
    TAU * TAU * TAU,
    TAU * TAU * TAU,
    sin(time) * TAU,
    cos(time) * TAU,
    -TAU
  );
  
  pointLight(
    TAU * TAU * TAU,
    TAU * TAU * TAU,
    TAU * TAU * TAU,
    TAU,
    TAU,
    TAU * TAU * TAU
  );
  
  // Central eye
  push();
  scale(TAU * TAU);
  specularMaterial(TAU * TAU * TAU);
  shininess(TAU * TAU);
  model(eyeModel);
  pop();
  
  // First ring (closest)
  drawRing(
    TAU * TAU * TAU + TAU,           // radius
    TAU * TAU * TAU,           // number of eyes
    Math.sqrt(TAU),                       // rotation speed
    TAU/TAU,                   // base rotation X
    time * TAU,                // base rotation Y
    TAU/TAU                    // base rotation Z
  );
  
  // Second ring (middle)
  drawRing(
    TAU * TAU * TAU + (TAU*TAU) + (TAU*TAU)+(TAU*TAU)+ (TAU*TAU)+(TAU*TAU)+(TAU*TAU)+(TAU*TAU)+(TAU*TAU)+(TAU*TAU)+(TAU*TAU), // radius
    TAU * TAU * TAU,           // number of eyes
    TAU/TAU,                   // rotation speed
    time * TAU,                // base rotation X
    TAU/TAU,                   // base rotation Y
    time * TAU/TAU             // base rotation Z
  );
  
  // Third ring (farthest)
  drawRing(
    TAU * TAU * TAU * TAU-((TAU*TAU)+ (TAU*TAU)+ (TAU*TAU) + (TAU*TAU) + (TAU*TAU) + (TAU*TAU)),     // radius
    TAU * TAU * TAU * TAU/TAU+TAU+TAU+TAU+(TAU*TAU), // number of eyes
    log(TAU)-Math.sqrt(TAU) / log(TAU),                   // rotation speed
    time * TAU/TAU,            // base rotation X
    time * TAU,                // base rotation Y
    TAU/TAU                    // base rotation Z
  );
}