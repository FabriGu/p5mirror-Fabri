let sounds = [];
let x = 0;
let y = 0;
let beat = 60;
let sb = beat - 10;

let cellSize;
let cellWidth;
let cellHeight;

let c =0;

// let fps = frameCount;

function preload() {
  for (let s = 0; s < 9; s++) {
    sounds.push(loadSound('data/' + s + '.mp3'));
  }
}

function setup() {
  createCanvas(500, 400); // Adjust the canvas size if needed
  makeGrid();
  frameRate(1)
}

function draw() {
  if (x > width) {
    background('white');
    makeGrid();
    x = 0;
  }
  frameCount = frameCount % 60;
  
  for(let b = 0; b < 4; b++ ) {
    
  
    if (frameCount % floor(beat * (0.75)) == 1) {
      fill('rgb(252,0,252)');
      sounds[b].play();
      
      rect(x, y, cellWidth, cellHeight);
      x+=cellWidth;
    }

    if (frameCount % floor(beat * (b)) == 1) {
      fill('green');
      sounds[b].play();
      rect(x, y+cellHeight, cellWidth, cellHeight);
      x+=cellWidth;
    }
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