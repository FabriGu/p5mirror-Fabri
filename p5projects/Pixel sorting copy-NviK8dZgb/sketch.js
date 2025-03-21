var sorted;

function preload(){
  img = loadImage("cataniaBadPartPopulated.png");
}

function setup() {
  createCanvas(500, 400);

  sorted = img.get();
  sorted.loadPixels();
  for (var i = 0; i < 1000; i++) {
    var record = -1;
    var selectedPixel = i;
    for (var j = i; j < 1000; j++) {
      var pix = sorted.pixels[j];
      // Sort by hue
     var b = hue(pix);
      if (b > record) {
        selectedPixel = j;
        record = b;
      }
    }

    // Swap selectedPixel with i
    var temp = sorted.pixels[i];
    sorted.pixels[i] = sorted.pixels[selectedPixel];
    sorted.pixels[selectedPixel] = temp;
  }
  
sorted.updatePixels();
}

function draw() {
  
  background(220);
  image(img,0,500,500,400);
  image(sorted,0, 0);
  
}
  

 


