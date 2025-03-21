let ogImg;
let myImg;

function preload() {
  ogImg = loadImage("cat.jpg");
}

function setup() {
  createCanvas(ogImg.width, ogImg.height);
  
  myImg = createImage(width, height);
  
  ogImg.loadPixels()
  myImg.loadPixels()
  
  for(let x = 0; x < ogImg.width; x++) {
    for(let y = 0; y < ogImg.height; y++){
      
      let i = (x + y * ogImg.width) * 4;
      let mid = ogImg.height/2
      
      if ((x+y) %2 == 0) {
        myImg.pixels[i] = 0;
        myImg.pixels[i+1] = 255;
        myImg.pixels[i+2] = 0;
        myImg.pixels[i+3] = 255;

      } else {
        myImg.pixels[i] = ogImg.pixels[i];
        myImg.pixels[i+1] = ogImg.pixels[i+1];
        myImg.pixels[i+2] = ogImg.pixels[i+2];
        myImg.pixels[i+3] = ogImg.pixels[i+3];
      }
      
      if (y >= mid-5 && y <= mid+5) {
        myImg.pixels[i] = 0;
        myImg.pixels[i+1] = 0;
        myImg.pixels[i+2] = 0;
        myImg.pixels[i+3] = 0;
      }
    }
  }
  
  myImg.updatePixels()
  
  image(myImg, 0, 0);
}