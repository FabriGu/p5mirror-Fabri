let lineMax = 100;
let lineMin = 20;


function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(10);
}

function draw() {
  background(220);
  
  let HV = Math.floor(random(2));
  // console.log(HV)
  if (HV == 0) {
    
    line(0,0,0,100);
  } else {
    line(0,0,100,0);
  }
  
}