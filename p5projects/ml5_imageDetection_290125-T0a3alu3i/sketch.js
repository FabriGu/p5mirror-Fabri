let classifier;
let img;
let label;

function preload() {
  classifier= ml5.imageClassfier("MobileNet");
  img = loadImage("name");
}

function gotResults(results) {
  console.log(results);
  label = results[0].label;
}

function setup() {
  createCanvas(400, 400);
  classifier.classify(img, gotResults, 100);
}

function draw() {
  background(220);
  image(img, 0, 0, width, height);
  
}