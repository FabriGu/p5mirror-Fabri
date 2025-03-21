let mic; 
let backgroundRGB = [100,100,100];

function setup() {
  createCanvas(400, 400);
  mic= new p5.AudioIn();
  mic.start();
  
  noStroke();
}

function draw() {
  background(backgroundRGB[0], backgroundRGB[1], backgroundRGB[2]);
  let level = mic.getLevel();
  
  // fill("black")
  level = level*1000;
  
  // console.log(level)
  fill(255- backgroundRGB[0], 255- backgroundRGB[1], 255- backgroundRGB[2])
  ellipse(width/2, height/2,level,level)
  
  
  if (level > 200) {
    for (let i = 0; i < 3; i++) {
      backgroundRGB[i] = random(255);
    }
  }
  
}