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
  radius = (100);
  angle = 0;
    xPos= radius*cos(angle);
  console.log("xPos " + xPos)
  yPos = radius*sin(angle);
  xAdd = 1;
  yAdd = -1;
}

function draw() {
  // background(220);
  // radius = radius + 1;
  // angle = angle + .01;

  // ellipse(xPos, yPos, 100,100);
  fill(abs(colors[0]-255),abs(colors[1]-255), abs(colors[2]-255));
  
  
  push()
  rotate(angle);
  noStroke();
  // translate(width/2,height/2)
  
  fill(abs(colors[0]-255),abs(colors[1]-255), abs(colors[2]-255));
  ellipse(200,200, xPos, yPos);
    fill(abs(colors[0]),abs(colors[1]), abs(colors[2]));

  ellipse(100,100, yPos, xPos);
    fill(abs(colors[0]-255),abs(colors[1]-255), abs(colors[2]-255));

    ellipse(300,300, xPos, yPos);
      fill(abs(colors[0]),abs(colors[1]), abs(colors[2]));

  ellipse(300,300, yPos, xPos);
  angle+=4;
  xPos+=xAdd;
  yPos+=yAdd;
  if (xPos >= 200) {
    xAdd = -1;
  } else if (xPos < 0) {
    xAdd = 1;
  }
  if (yPos <= 0) {
    yAdd = 1;
  } else if (yPos > 200) {
    yAdd = -1
  }
  pop()
  
  push()
  rotate(-angle);
  noStroke();
  // translate(width/2,height/2)
  
  fill(abs(colors[0]-255),abs(colors[1]-255), abs(colors[2]-255));
  ellipse(-200,-200, xPos, yPos);
    fill(abs(colors[0]),abs(colors[1]), abs(colors[2]));

  ellipse(-100,-100, yPos, xPos);
    fill(abs(colors[0]-255),abs(colors[1]-255), abs(colors[2]-255));

    ellipse(-300,-300, xPos, yPos);
      fill(abs(colors[0]),abs(colors[1]), abs(colors[2]));

  ellipse(300,300, yPos, xPos);
  angle+=4;
  xPos+=xAdd;
  yPos+=yAdd;
  if (xPos >= 200) {
    xAdd = -1;
  } else if (xPos < 0) {
    xAdd = 1;
  }
  if (yPos <= 0) {
    yAdd = 1;
  } else if (yPos > 200) {
    yAdd = -1
  }
  pop()
  
//   push();
//   fill(colors[0],colors[1], colors[2]);
//   translate(200,200);
//   rotate(angle);
//   angle++;
//   ellipse(width/2,height/2, xPos, yPos);
  
//   ellipse(width/2,height/2, yPos, xPos);
//   pop()
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