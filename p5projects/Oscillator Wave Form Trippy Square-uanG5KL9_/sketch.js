let osc, fft;

let colors = [];
let colorDir = [-1, 1, -1];

function setup() {
  createCanvas(720, 500);
  
  // create random colors
  colors[0] = parseInt(random(0,256));
  colors[1] = parseInt(random(0,256));
  colors[2] = parseInt(random(0,256));

  // create oscillator object
  osc = new p5.Oscillator(); 
  // set initial frequency and type
  osc.amp(0.5);
  osc.setType("sine");

  fft = new p5.FFT();
  osc.start();
}

function draw() {
  // background(255);
  // choose random colors
  for (let j = 0; j < colors.length; j++) {
    if ((colors[j] < 256 && colors[j] >= 0)) {
      colors[j] += colorDir[j];
    } else {
      colorDir[j] *= -1;
      colors[j] += colorDir[j];
    }
    // console.log(colors[j]);
  }
  // set stroke
  stroke(colors[0], colors[1], colors[2])
  
  let waveform = fft.waveform(); 
  // beginShape();
  beginShape(LINES);
  strokeWeight(3);
  
  let y1 = 125;
  let y2 = 0;
  
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, y1, y2);
      vertex(x, y);
    }
    endShape();
    y1 += 125;
    y2 += 125;
//     console.log(y1 + "  "+ y2)
  }
  
  rectMode(CENTER)
  // translate(width, height); 
  // rotate(radians(frameCount));
  // stroke(inverseColor(colors[0], colors[1], colors[2]))
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, width, 0);
    let y = map(waveform[i], -1, 1, height, 0);
    vertex(x, y);
  }
  endShape();
  
  push()
  rectMode(CENTER)
  translate(width/2, height/2);
  rotate(radians(frameCount));
  // stroke( inverseColor(colors[0],colors[1],colors[2]) )
  // let col = color(0.5, inverseColor(colors[0],colors[1],colors[2]))
  // let alphaValue = alpha(col);
  // fill(alphaValue);
  
  let colF = color(inverseColor(colors[0],colors[1],colors[2]))
  colF.setAlpha(0.9)
  fill(colF)
  let colS = color(inverseColor(colors[0],colors[1],colors[2]))
  // colS.setAlpha(100)
  stroke(colS)
  rect(0, 0, 200, 300);
  // for (let i = 0; i < waveform.length; i+= 10) {
  //   let x = map(i, 0, waveform.length, 200, 0);
  //   let y = map(waveform[i], -1, 1, 300, 0);
  //   vertex(x, y);
  // }
  // endShape();
  pop()

  // change frequency based on mouseX
  let freq = map(mouseX, 0, width, 40, 100);
  osc.freq(freq);

  // change frequency based on mouseY
  let amp = map(mouseY, 0, height, 1, 0.01);
  osc.amp(amp);
}

// inversing color 
function inverseColor(r,g,b){
  r = 255 - r; 
  g = 255 - g; 
  b = 255 - b; 

  return color(r,g,b);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) changeWave('sine');
  if (keyCode === UP_ARROW) changeWave('sawtooth');
  if (keyCode === RIGHT_ARROW) changeWave('triangle');
  if (keyCode === DOWN_ARROW) changeWave('square');
}

function changeWave(type) {
  osc.stop();
  osc.setType(type);
  osc.start();
}
