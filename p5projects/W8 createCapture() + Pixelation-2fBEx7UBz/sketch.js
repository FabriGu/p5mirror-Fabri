// Declare a variable to hold the video feed
let cam;

// Declare and initialize the cell size of the pixelation
let cellSz = 40;

let curX = 0;
let curY = 0;
let nextX, nextY;

function setup() {
  createCanvas(640, 480);
  
  // Start the video feed
  // Creates a p5.MediaElement object
  cam = createCapture(VIDEO);
  
  // Hide the DOM element on the page
  cam.hide();
}

function draw() {
  background(220);
  // console.log(cam)

  // if (cam.loadPixels()) {
    
    // Load the pixels from the current frame of the video feed
    cam.loadPixels();
    if (cam.pixels[0] != 0) {
      
      // Loop through the image in 2-dimensions
      for(let x = curX; x < curX+cellSz; x+=cellSz) {
        for(let y = curY; y < curY+cellSz; y+=cellSz) {

          // This is too slow
          //let c = cam.get(x,y);

          // Calculate the index number of the r-value of the pixel at x,y
          let i = (y*width + x)*4;
          let r = cam.pixels[i];
          let g = cam.pixels[i+1];
          let b = cam.pixels[i+2];

          // Fill with the rgb values of the pixel at x,y
          fill(r,g,b);

          // Draw a big rect to represent this pixel 
          rect(x, y, cellSz, cellSz);
        }
      }
      // noLoop();
      newPage();
      
    }



  // }
  

  // Draw the cam image to the canvas
  //image(cam, 0, 0);
  // noLoop()
}
