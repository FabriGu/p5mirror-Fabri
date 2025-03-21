// Declare a variable to hold the video feed
let cam;

// Declare and initialize the cell size of the pixelation
let cellSz = 20;

function setup() {
  createCanvas(640, 480);
  
  // Start the video feed
  // Creates a p5.MediaElement object
  cam = createCapture(VIDEO);
  
  // Hide the DOM element on the page
  cam.hide();
  
  // Use HSB color.
  colorMode(HSB);

  // Create a p5.Color object.
  let c = color(0, 50, 100);

//   // Draw the left rectangle.
//   noStroke();
//   fill(c);
//   rect(15, 15, 35, 70);

  // Set 'brightValue' to 100.
  // let brightValue = brightness(c);

}

function draw() {
  background(220);
  
  // Load the pixels from the current frame of the video feed
  cam.loadPixels();
  
  // Loop through the image in 2-dimensions
  for(let x = 0; x < width; x+=cellSz) {
    for(let y = 0; y < height; y+=cellSz) {
      
      // This is too slow
      //let c = cam.get(x,y);
      
      // let brightness = brightness(100,200,200)
      
     
      
      // Calculate the index number of the r-value of the pixel at x,y
      let i = (y*width + x)*4;
      
      // console.log(cam.pixels[i])
      
      let cR = int(cam.pixels[i])
      let cG = int(cam.pixels[i+1])
      let cB = int(cam.pixels[i+2])
      
      // console.log(typeof(cR))
      
      // let c = color(cR, cG, cB)
      let c = color(cam.pixels[i], cam.pixels[i+2], cam.pixels[i+2])
      
      let b = brightness(c);
      
//       console.log(b)
      
      if (b > 50) {
        fill("white")
      }
      if (b <= 50) {
        fill("black")
      }
      noStroke()
      // Draw a big rect to represent this pixel 
      rect(x, y, cellSz, cellSz);
    }
  }

  // Draw the cam image to the canvas
  //image(cam, 0, 0);
}