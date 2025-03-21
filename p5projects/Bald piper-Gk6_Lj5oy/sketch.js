let angle = 0;
let radius = 50;
let dotSize = 10;

function setup() {
  createCanvas(400, 400);
  wave1 = new p5.Oscillator();
  wave2 = new p5.Oscillator();
  wave3 = new p5.Oscillator();

  //   wave.setType('sine');
  // wave.start();
  // wave.amp(0.5, 1);
  // wave.freq(440);
  cir1 = new SpinningCircle(width / 2, height / 2, 70, 5, 10, 0.05);
  cir2 = new SpinningCircle(width, height / 2, 20, 1, 10, 0.01);
  cir3 = new SpinningCircle(width, height, 100, 2, 10, -0.04);
  cir4 = new SpinningCircle(0, 0, 30, 10, 10, 0.4);

  noStroke();

}

function draw() {
  background(220);
 
  // cir1.display();
  // cir1.update();
  // cir2.display();
  // cir2.update();
  // cir3.display();
  // cir3.update();
  updDisp(cir1);
  updDisp(cir2);
  updDisp(cir3);
  // updDisp(cir4);
}

function updDisp(obj) {
  obj.display();
  obj.update();
}

class SpinningCircle {
  constructor(x, y, radius, numDots, dotSize, dir) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.numDots = numDots;
    this.dotSize = dotSize;
    this.angle = 0;
    this.wave = new p5.Oscillator();
    this.wave = this.wave.scale(0.1, 0.2);
    this.wave.start();
    this.wave.amp(0.1);
    this.dir = dir
    this.wave.setType("triangle");
  }

  display() {
    fill(255);
    ellipse(this.x, this.y, this.radius * 2);
    for (let i = 0; i < this.numDots; i++) {
      let dotX = this.x + cos(this.angle + TWO_PI * i / this.numDots) * this.radius;
      let dotY = this.y + sin(this.angle + TWO_PI * i / this.numDots) * this.radius;
      fill(0);
      ellipse(dotX, dotY, this.dotSize);
      
      // if (this.y)
      this.wave.freq(dotY);
      this.wave.pan(dotX);

    }
    
  }

  update() {
    this.angle += this.dir;
  }
}