let fish;

function preload(){
// Load model with normalise parameter set to true
  fish = loadModel('fish.obj', true);
}

function setup() {
  createCanvas(400, 400, WEBGL);
}

function draw() {
  background(220);
  
  scale(1);
  translate(mouseX - width/2, mouseY - height/2);
  model(fish);
  
}