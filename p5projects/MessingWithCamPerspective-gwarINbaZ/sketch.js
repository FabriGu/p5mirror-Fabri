function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
}

function draw() {
  background(255);
  camera(mouseX, height/2, (height/2) / tan(PI/6), width/2, height/2, 0, 0, 1, 0);
  translate(width/2, height/2+100, -100);
  angle = PI/2.8
  fov = PI/3
  cameraZ = (height/2.0) / tan(fov/2.0);
//     translate(-width/2,-height/2,0); //moves our drawing origin to the top left corner
  // rotate(angle);
  mappedFOV = map(mouseX, 0, width, 0, PI)
      // perspective(mappedFOV, float(width)/float(height), cameraZ/2.0, cameraZ*2.0);

  rotateX(angle);
  // rotateY(angle);
  // rotateZ(angle);
  box(300,300, 300)
//   plane()
//   sphere()
//   ellipsoid()
//   cone()
//   cylinder()
//   torus() 
}