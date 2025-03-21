let time;
let eyeModel;

function preload() {
  let objURL = './stylized.obj';
  let mtlURL = './stylized.mtl';
  
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
  
  // Move camera back further using only TAU
  translate(TAU, TAU, -(TAU * TAU * TAU * TAU * TAU));
  
  ambientLight(TAU * TAU);
  directionalLight(
    TAU * TAU * TAU,
    TAU * TAU * TAU,
    TAU * TAU * TAU,
    sin(time) * TAU,
    cos(time) * TAU,
    -TAU
  );
  
  // Main expanding eye pattern
  for (let radius = TAU/TAU; radius < TAU * TAU * TAU; radius += TAU) {
    for (let angle = TAU/TAU; angle < TAU * TAU; angle += TAU) {
      push();
      
      // Expanding spiral movement
      let expansionFactor = (radius + time) * TAU;
      let x = cos(angle + time * TAU) * expansionFactor;
      let y = sin(angle + time * TAU) * expansionFactor;
      let z = cos(angle * TAU + time) * expansionFactor;
      
      translate(x, y, z);
      
      // Rotation that creates the overlapping effect
      rotateX(time * TAU + angle);
      rotateY(time * TAU + radius);
      rotateZ(sin(time + angle) * TAU);
      
      // Scale varies with distance
      let distScale = TAU + sin(time * TAU + radius);
      scale(distScale);
      
      model(eyeModel);
      
      pop();
    }
  }
  
  // Secondary layer with different movement pattern
  for (let i = TAU/TAU; i < TAU * TAU * TAU; i += TAU) {
    for (let j = TAU/TAU; j < TAU * TAU; j += TAU) {
      push();
      
      let outwardDist = (i + time) * TAU * TAU;
      let angle = j + time * TAU;
      
      // Creates a more complex outward spiral
      let x = cos(angle) * outwardDist * cos(i);
      let y = sin(angle) * outwardDist * cos(i);
      let z = sin(i) * outwardDist;
      
      translate(x, y, z);
      
      // Rotation creates additional overlapping
      rotateX(time * TAU + i);
      rotateY(angle * TAU);
      rotateZ(time * TAU + j);
      
      // Scale varies with time and position
      let scaleVar = TAU + sin(time * TAU + i);
      scale(scaleVar);
      
      model(eyeModel);
      
      pop();
    }
  }
  
  // Third layer with inward/outward pulsing
  for (let layer = TAU/TAU; layer < TAU * TAU * TAU; layer += TAU) {
    for (let segment = TAU/TAU; segment < TAU * TAU; segment += TAU) {
      push();
      
      let pulseRadius = (TAU + sin(time * TAU)) * TAU * TAU;
      let x = cos(segment + time) * sin(layer) * pulseRadius;
      let y = sin(segment + time) * sin(layer) * pulseRadius;
      let z = cos(layer) * pulseRadius;
      
      translate(x, y, z);
      
      rotateX(time * TAU + layer);
      rotateY(segment * TAU);
      rotateZ(time * TAU);
      
      scale(TAU);
      
      model(eyeModel);
      
      pop();
    }
  }
}