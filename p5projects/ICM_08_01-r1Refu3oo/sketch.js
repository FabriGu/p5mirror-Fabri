function setup() {
  createCanvas(200, 200);
}

function draw() {
  stroke("red")
  for(let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      point(j,i)
    }
  }
  
}