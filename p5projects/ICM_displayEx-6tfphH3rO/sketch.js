let str = 'I dunk a skunk in a trunk full of gunk.';
console.log(str.charAt(0));

function setup() {
  createCanvas(400, 400);
    textAlign(LEFT, TOP);

  textSize(36);
}

let x = 0;
let y = 0;
let c = 0;

function draw() {
  // background(220);
  if (frameCount % 5 == 1) {
    let ch = str.charAt(c);
    text(ch,x,random(y));
    x+=textWidth(ch);
    c++;
    c%=str.length;
    if (x > width) {
      background("white")
      x = 0;
      y += textAscent() + textDescent();
    }
  }

  // for (let c = 0; c< str.length; c++) {
    
  // }
  
  
}