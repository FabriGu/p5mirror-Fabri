
let c = 0;
let cX = -600/4;
let cY = 600 / 4;

function setup() {
  createCanvas(600, 600, WEBGL);
  background("#3D1629");
}

function draw() {
  ambientLight(200)
  c++;
  
  push();
  rotateZ(0)
  // Position and draw rectangles as an abstract element
  translate(-width / 4, height / 4);
  if (cX < width) {
    translate(cX,0)
    cX++
  } else if (cY > 0){
    // translate(0,cY)
    // cY--
  }
  
  rotateZ(frameCount * 0.01);

  if (c % 60 == 0) {
    stroke("#9BBEE4")
    fill("#4756A6")
    cone(100)
  }
  pop();
  
  push();
  translate(-300,0,0)
  rotateZ(80)
  // Position and draw rectangles as an abstract element
  translate(-width / 4, height / 4);
  if (cX < width) {
    translate(cX,0)
    cX++
    
    
    rotateZ(frameCount * 0.01);

    if (c % 60 == 0) {
      stroke("#9BBEE4")
      fill("#981B1E")
      cone(100)
    // torus(100)
      
    }
  } else if (cY > 0){

  }
  
  pop();
  

  
}
function mousePressed() {
  saveCanvas('myArtwork', 'png');
}

