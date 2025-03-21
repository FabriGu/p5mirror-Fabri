var offset = 0;
function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(255);
  strokeWeight(3);
  stroke(255);
  
  for (var x = 0; x <= width; x += 50){
    fill(random(255), 0, random(255));
    rect(x + offset, 200, 45, 45);
    
    fill(0, random(255), random(255));
    ellipse(x + offset, 350, 55, 55);
    
    fill(random(255), random(255), 0);
    rect(x + offset, 55, 25, 45);
    
    fill(random(255), 0, 0);
    ellipse(x + offset, 155, 15, 25);
    
    fill(0, 0, random(255));
    ellipse(x + offset, 285, 15, 25);
    
  }

}