let font;

function preload() {
  font = loadFont('Staatliches-Regular.ttf'); // Preload the font. For 3D to work, we need a font file (not a linked font). 
}


function setup() {
  createCanvas(windowWidth,windowHeight,WEBGL);
  background('#3C2350');
}

function draw() {
  textFont(font);
  textAlign(CENTER,CENTER);
  textSize(50);
  rotateX(map(mouseX,0,width,0,TWO_PI));
  rotateY(map(mouseY,0,height,0,TWO_PI));
  rotateZ(map(frameCount,0,600,0,TWO_PI))
  // fill('#8C53D5');
  push();
  for(let i=0; i<100; i++) {
    fill(map(i,0,100,0,255),80,215);
    translate(0,0,.5);
    text("you spin me\nright round",0,0);
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background('#3C2350');

}