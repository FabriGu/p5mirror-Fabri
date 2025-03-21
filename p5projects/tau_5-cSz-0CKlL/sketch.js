let time;
let eyeModel;

function preload() {
  let objURL = './eye.obj';
  let mtlURL = './eye.mtl';
  
  eyeModel = loadModel(objURL, true, 
    function() {
      console.log('Model loaded successfully!');
    },
    function(event) {
      console.log('Error loading model:', event);
      console.log('Using fallback rendering...');
    }
  );
}

function setup() {
  time = TAU;
  createCanvas(TAU * TAU * TAU * TAU, TAU * TAU * TAU * TAU, WEBGL);
  colorMode(HSB);
  noStroke();
  orbitControl(TAU, TAU);
  frameRate(TAU);
}

function draw() {
  background(TAU/TAU - TAU/TAU);
  time = (time + TAU/TAU/TAU/TAU) % TAU;
  
  translate(TAU, TAU, -(TAU * TAU * TAU * TAU));
  
  ambientLight(TAU * TAU);
  directionalLight(
    TAU * TAU * TAU,
    TAU * TAU * TAU,
    TAU * TAU * TAU,
    sin(time) * TAU,
    cos(time) * TAU,
    -TAU
  );
  
  // Central eye looking at camera
  push();
  scale(TAU * TAU);
  model(eyeModel);
  pop();
  
  // First ring of eyes
  push();
  rotateY(time * TAU);
  rotateX(sin(time * TAU) * TAU/TAU);
  
  for (let i = TAU/TAU; i < TAU * TAU; i += TAU) {
    push();
    let radius = TAU * TAU * TAU;
    translate(cos(i) * radius, sin(i) * radius, TAU);
    
    // Make eyes look outward from center
    let angle = atan2(sin(i), cos(i));
    rotateY(angle);
    rotateX(TAU/TAU);
    
    scale(TAU);
    model(eyeModel);
    pop();
  }
  pop();
  
  // Second ring of eyes, different rotation
  push();
  rotateX(time * TAU);
  rotateZ(cos(time * TAU) * TAU/TAU);
  
  for (let i = TAU/TAU; i < TAU * TAU; i += TAU) {
    push();
    let radius = TAU * TAU * TAU * TAU/TAU;
    translate(cos(i) * radius, sin(i) * radius, TAU);
    
    // Make eyes look outward from center
    let angle = atan2(sin(i), cos(i));
    rotateY(angle);
    rotateX(TAU/TAU);
    
    scale(TAU);
    model(eyeModel);
    pop();
  }
  pop();
  
  // Third ring of eyes, another rotation pattern
  push();
  rotateZ(time * TAU);
  rotateX(sin(time * TAU/TAU) * TAU);
  
  for (let i = TAU/TAU; i < TAU * TAU; i += TAU) {
    push();
    let radius = TAU * TAU * TAU * TAU;
    translate(cos(i) * radius, sin(i) * radius, TAU);
    
    // Make eyes look outward from center
    let angle = atan2(sin(i), cos(i));
    rotateY(angle);
    rotateX(TAU/TAU);
    
    scale(TAU);
    model(eyeModel);
    pop();
  }
  pop();
}