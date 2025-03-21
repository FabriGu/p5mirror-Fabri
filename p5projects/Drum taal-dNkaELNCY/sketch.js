let sounds = [];
let x = 0;
let y = 0;
let beat = 60;
let sb = beat - 10;

let cellSize;
let cellWidth;
let cellHeight;

let c = 0;

function preload() {
  for (let s = 0; s < 12; s++) {
    
    sounds.push(loadSound('data/' + s + '.mp3'));
   
    // if (s < 11) {
    //   sounds.push(loadSound('data/' + s + '.mp3'));
    // } else {
    //   sounds.push(loadSound('data/' + s + '.m4a'));
    // }
    
    
  }
  
}

function setup() {
  createCanvas(500, 400); // Adjust the canvas size if needed
  makeGrid();
  frameRate(40)
}

function draw() {
  if (x > width) {
    background('white');
    makeGrid();
    x = 0;
  }
  
  
  frameCount = frameCount % 60;
  
  console.log(frameCount % floor(beat*4))
  console.log(beat*4)
  if (c == 0) {
    fill('orange');
    sounds[11].play();
    rect(x, y+cellHeight*2, cellWidth, cellHeight);
    // x+=cellWidth;
  }
  
  if (c < 4) {
    if (frameCount % floor(beat/4) == 1 && (frameCount==1 || frameCount == 46)) {
    fill('purple');
    sounds[7].play();
    rect(x, y, cellWidth, cellHeight);
    x+=cellWidth;
  }

    if (frameCount % floor(beat/4) == 1 && (frameCount==16 || frameCount == 31)) {
      fill('green');
      sounds[7].play();
      rect(x, y+cellHeight, cellWidth, cellHeight);
      x+=cellWidth;
    }
    
    
/// --------------------------- different bar -----------------
  } else if (c == 4) {
    console.log("4thbar")
  if (frameCount % floor(beat/4) == 1  && frameCount == 46) {
    fill('purple');
    sounds[10].play();
    rect(x, y, cellWidth, cellHeight);
    x+=cellWidth;
  }

  if (frameCount % floor(beat/4) == 1 && (frameCount==16 || frameCount == 31)) {
    fill('green');
    sounds[9].play();
    rect(x, y+cellHeight, cellWidth, cellHeight);
    x+=cellWidth;
  }
  
  if (frameCount % floor(beat/4) == 1 && (frameCount==7)) {
    fill('green');
    sounds[5].play();
    rect(x, y+cellHeight, cellWidth, cellHeight);
    x+=cellWidth;
  }
    
//     if (frameCount % floor())
  }
  
  
  if (frameCount % 60 == 1 && c == 4) {
    c = 0;
  } else if (frameCount % 60 == 1) {
    c++;
  }
  
  
  
  // console.log(frameCount % beat/4)

  // y += h;
  // // Mango drum  
  // if (frameCount % floor(beat / 2) == 1) {
  //   sounds[0].play();
  //   rect(x, y, 5, 15);
  // }

//   y += h;
//   // Pineapple
//   if (frameCount % floor(beat / 3) == 1) {
//     sounds[1].play();
//     rect(x, y, 5, 15);
//   }

  // y += h;
  // //Syncopated drum
  // if (frameCount % beat == sb) {
  //   sounds[5].play();
  //   rect(x, y, 5, 15);
  //   sb--;
  // }
  
  // y += h;
  // // Phased drum
  // if (frameCount % 50 == 1) {
  //   sounds[4].play();
  //   rect(x, y, 5, 15);
  // }

}

function makeGrid() {
  
  let cols = 16; // 4 beats * 4 bars
  let rows = 4;  // 4 rows to visualize each measure
  cellWidth = width / cols;
  cellHeight = height / rows;
  for(let xi = 0; xi < width; xi+=cellWidth) {
    for (let yi = 0; yi < height; yi+= cellHeight) {
      line(xi, 0, xi, height);
      line(0, yi, width, yi);
    }
  }
}