var img;
var theta = 0;

function preload() {
  img = loadImage('UV_Grid_Sm.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(255, 255, 255, 255);

  rotateZ(theta * mouseX * 0.001);
  rotateX(theta * mouseX * 0.001);
  rotateY(theta * mouseX * 0.001);

  //pass image as texture
  texture(img);
  sphere(80);

  theta += 0.05;
}