let c1,c2;
var offset = 0;

let x = 0, y = 0;
let direction = 0;
let colors = [];

let colorDir = [-1, 1, -1];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  colors[0] = parseInt(random(0,256));
  colors[1] = parseInt(random(0,256));
  colors[2] = parseInt(random(0,256));
  c1 = color(colors[0],colors[1],colors[2])
  
  
}
function draw() {
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
  }
    
  c2 = color(colors[0],colors[1],colors[2])
  
  for(let y=0; y<height; y++){
    n = map(y,0,height,0,1);
    let newc = lerpColor(c1,c2,n);
    stroke(newc);
    line(0,y,width, y);
  }

}