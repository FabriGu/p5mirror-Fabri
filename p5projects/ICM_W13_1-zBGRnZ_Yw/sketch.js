let sentence = "I wish to wash my Irish wristwatch."
let characters = [];

function setup() {
  createCanvas(400, 400);
  for (let ch of sentence) {
    characters.push(ch);
  }
  frameRate(2);
}

function draw() {
  background(220);
  for (let ch of characters) {
    // let p = createP(Math.floor(random(0,400)), Math.floor(random(0,400)));
    //  p.html(ch); 
    let x = random(0,400);
    let y = random(0, 400);
      text(ch, x, y)
  }
}

