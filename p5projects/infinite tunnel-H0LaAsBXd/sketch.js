let center;
let x = 0, y = 0;
let direction = 0;
let colors = [];

let colorDir = [-1, 1, -1];

let angle;

function setup() {
  createCanvas(1000, 1000);
  colors[0] = parseInt(random(0,256));
  colors[1] = parseInt(random(0,256));
  colors[2] = parseInt(random(0,256));
  angleMode(DEGREES);
  angle = 0;
}

function draw() {

  // for (let i = 0; i > 4; i++) {
  translate(200,200)
  push()
    noStroke();
    fill(colors[0],colors[1],colors[2]);
    ellipse(x, y, 50, 50);
    // console.log(i);
    //draw an ellipse across from the mouse in the horizontal direction
    ellipse(width - x, y, 50, 50);

    //draw an ellipse across from the mouse in the vertical direction
    ellipse(x, height - y, 50, 50);

    //draw an ellipse across from the mouse in both the horizontal and vertical directions
    ellipse(width - x, height - y, 50, 50);
    
  pop()
  
  push()
  // translate(100, 400);
  rotate(45);
  noStroke();
    fill(colors[0],colors[1],colors[2]);
    ellipse(x, y, 50, 50);
    // console.log(i);
    //draw an ellipse across from the mouse in the horizontal direction
    ellipse(width - x, y, 50, 50);

    //draw an ellipse across from the mouse in the vertical direction
    ellipse(x, height - y, 50, 50);

    //draw an ellipse across from the mouse in both the horizontal and vertical directions
    ellipse(width - x, height - y, 50, 50);
    
  pop()
  
  push()
  // translate(100, 400);
  rotate(90);
  noStroke();
    fill(colors[0],colors[1],colors[2]);
    ellipse(x, y, 50, 50);
    // console.log(i);
    //draw an ellipse across from the mouse in the horizontal direction
    ellipse(width - x, y, 50, 50);

    //draw an ellipse across from the mouse in the vertical direction
    ellipse(x, height - y, 50, 50);

    //draw an ellipse across from the mouse in both the horizontal and vertical directions
    ellipse(width - x, height - y, 50, 50);
    
  pop()
  
  push()
  // translate(100, 400);
  rotate(135);
  noStroke();
    fill(colors[0],colors[1],colors[2]);
    ellipse(x, y, 50, 50);
    // console.log(i);
    //draw an ellipse across from the mouse in the horizontal direction
    ellipse(width - x, y, 50, 50);

    //draw an ellipse across from the mouse in the vertical direction
    ellipse(x, height - y, 50, 50);

    //draw an ellipse across from the mouse in both the horizontal and vertical directions
    ellipse(width - x, height - y, 50, 50);
    
  pop()
  
  push()
  // translate(100, 400);
  rotate(180);
  noStroke();
    fill(colors[0],colors[1],colors[2]);
    ellipse(x, y, 50, 50);
    // console.log(i);
    //draw an ellipse across from the mouse in the horizontal direction
    ellipse(width - x, y, 50, 50);

    //draw an ellipse across from the mouse in the vertical direction
    ellipse(x, height - y, 50, 50);

    //draw an ellipse across from the mouse in both the horizontal and vertical directions
    ellipse(width - x, height - y, 50, 50);
    
  pop()
  
  push()
  // translate(100, 400);
  rotate(225);
  noStroke();
    fill(colors[0],colors[1],colors[2]);
    ellipse(x, y, 50, 50);
    // console.log(i);
    //draw an ellipse across from the mouse in the horizontal direction
    ellipse(width - x, y, 50, 50);

    //draw an ellipse across from the mouse in the vertical direction
    ellipse(x, height - y, 50, 50);

    //draw an ellipse across from the mouse in both the horizontal and vertical directions
    ellipse(width - x, height - y, 50, 50);
    
  pop()
  
  push()
  // translate(100, 400);
  rotate(270);
  noStroke();
    fill(colors[0],colors[1],colors[2]);
    ellipse(x, y, 50, 50);
    // console.log(i);
    //draw an ellipse across from the mouse in the horizontal direction
    ellipse(width - x, y, 50, 50);

    //draw an ellipse across from the mouse in the vertical direction
    ellipse(x, height - y, 50, 50);

    //draw an ellipse across from the mouse in both the horizontal and vertical directions
    ellipse(width - x, height - y, 50, 50);
    
  pop()
  
  push()
  // translate(100, 400);
  rotate(315);
  noStroke();
    fill(colors[0],colors[1],colors[2]);
    ellipse(x, y, 50, 50);
    // console.log(i);
    //draw an ellipse across from the mouse in the horizontal direction
    ellipse(width - x, y, 50, 50);

    //draw an ellipse across from the mouse in the vertical direction
    ellipse(x, height - y, 50, 50);

    //draw an ellipse across from the mouse in both the horizontal and vertical directions
    ellipse(width - x, height - y, 50, 50);
    
  pop()
  
  push()
  // translate(100, 400);
  rotate(365);
  noStroke();
    fill(colors[0],colors[1],colors[2]);
    ellipse(x, y, 50, 50);
    // console.log(i);
    //draw an ellipse across from the mouse in the horizontal direction
    ellipse(width - x, y, 50, 50);

    //draw an ellipse across from the mouse in the vertical direction
    ellipse(x, height - y, 50, 50);

    //draw an ellipse across from the mouse in both the horizontal and vertical directions
    ellipse(width - x, height - y, 50, 50);
    
  pop()
  
  push()
    
    for (let j = 0; j < 20; j++) {
      rotate(angle);
      noStroke();
        fill(colors[0],colors[1],colors[2]);
        ellipse(x, y, 50, 50);
        // console.log(i);
        //draw an ellipse across from the mouse in the horizontal direction
        ellipse(width - x, y, 50, 50);

        //draw an ellipse across from the mouse in the vertical direction
        ellipse(x, height - y, 50, 50);

        //draw an ellipse across from the mouse in both the horizontal and vertical directions
        ellipse(width - x, height - y, 50, 50);
      angle += 25;
    }
  pop()
  // }
  if (direction <= 50) {
      direction += 1;
      x += 1;
      y += 0;
    } else if ( direction > 50 && direction <= 100) {
      direction += 1;
      x += 1;
      y += 1;
    } else if (direction > 100 && direction <= 150) {
      direction += 1;
      x += 0;
      y += 1;
    } else {
      direction = 0;
    }
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