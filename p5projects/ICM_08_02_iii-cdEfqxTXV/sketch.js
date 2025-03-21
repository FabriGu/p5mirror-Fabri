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
      let mid = ogImg.width/2
      
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
      
      if (x >= mid-5 && x <= mid+5) {
        myImg.pixels[i] = 0;
        myImg.pixels[i+1] = 0;
        myImg.pixels[i+2] = 255;
        myImg.pixels[i+3] = 255;
      }
    }
  }
  
  
//   // Erase middle line of cat

  
//   let s = (mid-5) * ogImg.width * 4;
//   let e = (mid+5) * ogImg.width * 4;
  
//   for (let k = s; k < e; k++) {
//     // Erase all pixel data
    
//   }
  
  myImg.updatePixels()
  
  image(myImg, 0, 0);
}