//variables for sounds
var cello1;
var cello2;
var cello3;
var clar;
var oboe;
var drum;
var abstract;
var chime;
var show = true;

//variables for animations
var backgroundColor = 40; 
var x;
var y;
var z;
var j;
var k;
var l;
var a;
var b;
var c;
var drumlocx = 100;
var drumlocy = 200;
var drumColor;
var abstracty;
var abstractOp;
let chimelocx1;
let chimelocy1;
let chimelocx2;
let chimelocy2;
let chimelocx3;
let chimelocy3;
let chimelocx4;
let chimelocy4;
let chimeMainLocx;
let chimeMainLocy;
let drumColorR;
let drumColorG;
let drumColorB;


//preloading sounds
function preload() {
  cello1 = loadSound('Cello1.wav');
  cello2 = loadSound('Cello2.wav');
  cello3 = loadSound('Cello3.wav');
  clar = loadSound('clar.mp3');
  oboe = loadSound('oboe.wav');
  drum = loadSound('kickdrum.wav');
  abstract = loadSound('abstract.wav');
  chime = loadSound('chime2.wav');
}


function setup() {
  createCanvas(400, 400);
  chimelocx1 = random(-40, 40);
  chimelocy1 = random(-40, 40);
  chimelocx2 = random(-40, 40);
  chimelocy2 = random(-40, 40);
  chimelocx3 = random(-40, 40);
  chimelocy3 = random(-40, 40);
  chimelocx4 = random(-40, 40);
  chimelocy4 = random(-40, 40);
  chimeMainLocx = random(width);
  chimeMainLocy = random(height);
  drumColorR = random(230, 255);
  drumColorG = random(50, 150);
  drumColorB = random(100);
  clarColor = random (20, 150)
}

function draw() {
  noStroke();
  background(backgroundColor);
  
  if (show == true){
    instruction();
  }
  
  //cello1
  j = map(cello1.currentTime(), 0, cello1.duration() , 0, height);
  fill(105, 100);
  rect(0, 0, 133, j);
  
  //cello2
  k = map(cello2.currentTime(), 0, cello2.duration() , 0, height);
  fill(135, 100);
  rect(133, 400, 133, -k);
  
  //cello3
  l = map(cello3.currentTime(), 0, cello3.duration(), 0, height);
  fill(165, 100);
  rect(266, 0, 133, l);

  //clar
  fill(255); 
  x = map(clar.currentTime(), 0, clar.duration(), 0, 200);
  push();
  rectMode(CENTER);
  rect(width/2,height/2,x,40); 
  rect(width/2, height/2, -x,40); 
  pop();
  
  //oboe
  y = map(oboe.currentTime(), 0, oboe.duration(), 50, 500);
  z = map(oboe.currentTime(), 0, oboe.duration(), 0, 255);
  push();
  fill (200, z);
  translate(width/2, height/2);
  rectMode(CENTER);
  rotate(40);
  rect (0,0,y,y);
  pop();

  //Drum
  // fill(255, 0, 0);
  noFill();
  stroke(drumColorR, drumColorG, drumColorB);
  a = map(drum.currentTime(), 0, drum.duration(), 0, 200);
  ellipse(drumlocx, drumlocy, a, a);

	//Abstract
  noFill();
  abstractOp = map (abstract.currentTime(), 0, abstract.duration(), 0, 255);
  stroke(255, 255, 0, abstractOp);
  abstracty = map(abstract.currentTime(), 0, abstract.duration(), 30, 200);
  ellipse(width/2, height/2, 30, abstracty);
  

  //Chime
  c = map(chime.currentTime(), 0, chime.duration(), 0, 100);
  noFill();
  if (c > 0 && c < 10) {
    stroke(100, 200, 255)
    ellipse(chimeMainLocx, chimeMainLocy, 20, 20);
  } else if (c > 10 && c < 20) {
    stroke(100, 200, 255, 70)
    ellipse(chimeMainLocx + chimelocx1, chimeMainLocy + chimelocy1, 20, 20);
  } else if (c > 30 && c < 40) {
    stroke(100, 200, 255, 40)
    ellipse(chimeMainLocx + chimelocx2, chimeMainLocy + chimelocy2, 10, 10);
  } else if (c > 40 && c < 50) {
    stroke(100, 200, 255, 20)
    ellipse(chimeMainLocx + chimelocx3, chimeMainLocy + chimelocy3, 10, 10);
  } else if (c > 50 && c < 60) {
    stroke(100, 200, 255, 10)
    ellipse(chimeMainLocx + chimelocx4, chimeMainLocy + chimelocy4, 10, 10);
  }
	
  //console.log(key);
}

function keyPressed() {
  //triggering sound + animation when pressing on keys
  if (key == 'a') {
    clar.play();
  } else if (key == 's') {
    oboe.play();
  } else if (key == 'q') {
    cello1.play();
  } else if (key == 'w') {
    cello2.play();
  } else if (key == 'e') {
    cello3.play();
  }  else if (key == 'j') {
    drum.play()
    drumlocx = random(width);
    drumlocy = random(height);
    drumColorR = random(230, 255);
    drumColorG = random(50, 150);
    drumColorB = random(100);
  } else if (key == 'k') {
    abstract.play();
  } else if (key == 'l') {
    chime.play();
    chimeMainLocx = random(width);
    chimeMainLocy = random(height);
    chimelocx1 = random(-20, 20);
    chimelocy1 = random(-20, 20);
    chimelocx2 = random(-20, 20);
    chimelocy2 = random(-20, 20);
    chimelocx3 = random(-20, 20);
    chimelocy3 = random(-20, 20);
    chimelocx4 = random(-20, 20);
    chimelocy4 = random(-20, 20);
  } else {
    backgroundColor = random(0,40); 
  }
  
}

  function instruction(){
    textAlign(CENTER);
    fill (255);
    textSize(15);
    text("Press Q, W, E, A, or S for instrumental sounds.", width/2, height/2 - 25);
		text("Press J, K, or L for electronic sounds.", width/2, height/2);
    fill (150);
    text("Click to continue!", width/2, height/2 + 25);
  }

function mousePressed(){
  show = false;
}