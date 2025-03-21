// for circle
let radius;
let angle = 0;
let colors= []
let colorDir = [-1,-1,-1]

function setup() {
  createCanvas(400, 400);
    // for circle
 colors[0] = parseInt(random(0,256));
  colors[1] = parseInt(random(0,256));
  colors[2] = parseInt(random(0,256));
  

  angleMode(DEGREES);
  radius = (width/2);
  angle = 0;
}

function draw() {
  // background(220);
    radius = radius + 1;
  angle = angle + .01;
  xPos= radius*cos(angle);
  console.log("xPos " + xPos)
  yPos = radius*sin(angle);
  // ellipse(xPos, yPos, 100,100);
  fill(abs(colors[0]-255),abs(colors[1]-255), abs(colors[2]-255));
  
  
  push()
  rotate(0);
  noStroke();
  fill(abs(colors[0]-255),abs(colors[1]-255), abs(colors[2]-255));
  ellipse(width/2,height/2, xPos, yPos);
  ellipse(width/2,height/2, yPos, xPos);
  pop()
  
  push();
  fill(colors[0],colors[1], colors[2]);
  translate(200,200);
  rotate(angle);
  angle++;
  ellipse(width/2,height/2, xPos, yPos);
  
  ellipse(width/2,height/2, yPos, xPos);
  pop()
  // rotate(-1)
  for (let j = 0; j < colors.length; j++) {
      if ((colors[j] < 256 && colors[j] >= 0)) {
        colors[j] += colorDir[j];
      } else {
        colorDir[j] *= -1;
        colors[j] += colorDir[j];
      }
      // console.log(colors[j]);
  }
  
}