var video;
var threshold = 10;
let targetColor;
var mySound;

let col1;

function preload() {
  mySound = loadSound("bgGame.mp3");
  
}

function setup() {
  createCanvas(640, 480);
  pixelDensity(1); //weird thing for high end mac monitors
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
   //mySound.loop();
  targetColor = [255, 0, 0,0];
  
  col1 = new color(mySound);
  col2 = new color(mySound);

}

class color {

  constructor(sound) {
    this.winningX = 0;
    this.winningY = 0;
    this.allThatQualified = 1;
    this.sound = sound;
    this.sound.play();
    this.sound.loop();
    this.worldRecord;
    this.pan;
    this.rate;
    

    
    // this.targetColor = targetColor;
    // this.video = video;
    // this.video = vid;
  }
  
  track(targetColor) {

    image(video, 0, 0);
    for (var y = 0; y < video.height; y++) {
      for (var x = 0; x < video.width; x++) {
        var thisPixel = video.get(x, y);
        var diffBetweenColors = dist(thisPixel[0], thisPixel[1], thisPixel[2], targetColor[0], targetColor[1], targetColor[2])
        //if(diffBetweenColors < worldRecord){
        if (diffBetweenColors < threshold) {
          this.winningX += x;
          this.winningY += y;
          this.allThatQualified++
          this.worldRecord = diffBetweenColors;
        }
      }
    }
    var h = this.winningX / this.allThatQualified;
    var v = this.winningY / this.allThatQualified;
    // console.log(get(h, y));
    push()
    fill(targetColor);
    ellipse(h, v, 20, 20);
    pop()
    var pan = map(h, 0, width, -1, 1);
    var rate = map(v, 0, height,0, 2);
    this.sound.pan(pan);
    this.sound.rate(rate);
  }
  
//   mousePressed() {
//     this.targetColor = get(mouseX, mouseY);
// //   return targetColor;
//     this.track();
//     console.log("hello")
//   }  
}

function draw() {
  // console.log(get(width/2, height/2))
  col1.track([203, 28, 80, 255]);
  // col2.track([0, 0, 255, 255])
  
//   image(video, 0, 0);
//   var winningX = 0;
//   var winningY = 0;
//   //var worldRecord = 8888888888;
//   var allThatQualified = 1;
//   for (var y = 0; y < video.height; y++) {
//     for (var x = 0; x < video.width; x++) {
//       var thisPixel = video.get(x, y);
//       var diffBetweenColors = dist(thisPixel[0], thisPixel[1], thisPixel[2], targetColor[0], targetColor[1], targetColor[2])
//       //if(diffBetweenColors < worldRecord){
//       if (diffBetweenColors < threshold) {
//         winningX += x;
//         winningY += y;
//         allThatQualified++
//         worldRecord = diffBetweenColors;
//       }
//     }
//   }
//   var h = winningX / allThatQualified;
//   var v = winningY / allThatQualified
//   ellipse(h, v, 20, 20);
//   var pan = map(h, 0, width, -1, 1);
//   var rate = map(v, 0, height,0, 2);
//   mySound.pan(pan);
//   mySound.rate(rate);
}

function mousePressed() {
  console.log( targetColor)
  targetColor = get(mouseX, mouseY)
  col1.track(targetColor);
  // targetColor = 
  // targetColor = get(mouseX, mouseY);
  // return targetColor;
  // col1.mousePressed();
  console.log("hi")
}