let sounds = [];
let x = 0;
let h = 0;
let beat = 60;
let sb = beat - 10;

let cellSize;

let c1 = 0;

function preload() {
  for (let s = 0; s < 9; s++) {
    sounds.push(loadSound('data/' + s + '.mp3'));
  }
}

function setup() {
  createCanvas(600, windowHeight);

  // noStroke();
  
   // the grid or set to your preference
  let cols = 60;
  let rows = 60;
  cellSize = width / cols; // Calculate cell size based on canvas width and column count
  
  h = cellSize;
  // x = cellSize  
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let xpos = x * cellSize;
      let ypos = y * cellSize;
      rect(xpos, ypos, cellSize, cellSize); // Draw each cell as a rectangle
    }
  }

}




function draw() {
  
  
  
  x++;
  if (x > width) {
    background('white');
    x = 0;
  }

  let y = 0;
  fill('purple');
  if (frameCount % floor(beat/4) == 1 && (frameCount==1 || frameCount == 46)) {
    sounds[6].play();
    rect(x, y, cellSize, cellSize);

  }

  y += h;
  fill('purple');
  if (frameCount % floor(beat/4) == 1 && (frameCount==16 || frameCount == 31)) {
    sounds[5].play();
    rect(x, y, cellSize, cellSize);
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