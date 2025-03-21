/*
 * @name Oscillator Frequency
 * @arialabel The wavelength travels across the screen and as the user’s mouse moves left, the wavelength is longer and the frequency is slower and both increase as the mouse moves right
 * @description <p>Control an Oscillator and view the waveform using FFT.
 * MouseX is mapped to frequency, mouseY is mapped to amplitude.</p>
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a> and a
 * sound file.</span></em></p>
 */
let osc, fft;

let colors = [];
let colorDir = [-1, 1, -1];

function setup() {
  createCanvas(720, 256);
  colors[0] = parseInt(random(0,256));
  colors[1] = parseInt(random(0,256));
  colors[2] = parseInt(random(0,256));

  osc = new p5.TriOsc(); // set frequency and type
  osc.amp(0.5);
  osc.setType("sawtooth");

  fft = new p5.FFT();
  osc.start();
}

function draw() {
  // background(255);
  for (let j = 0; j < colors.length; j++) {
    if ((colors[j] < 256 && colors[j] >= 0)) {
      colors[j] += colorDir[j];
    } else {
      colorDir[j] *= -1;
      colors[j] += colorDir[j];
    }
    // console.log(colors[j]);
  }
  stroke(colors[0], colors[1], colors[2])
  let waveform = fft.waveform(); // analyze the waveform
  // beginShape();
  beginShape(LINES);
  strokeWeight(5);
  
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height, 0);
    vertex(x, y);
  }
  endShape();

  // change oscillator frequency based on mouseX
  let freq = map(mouseX, 0, width, 40, 880);
  osc.freq(freq);

  let amp = map(mouseY, 0, height, 1, 0.01);
  osc.amp(amp);
}

function keyPressed() {
  // Sine - mild, soft tone
  if (keyCode === LEFT_ARROW) changeWave('sine');

  // Sawtooth - reedy, hollow sound
  if (keyCode === UP_ARROW) changeWave('sawtooth');

  // Triangle - somewhere between a sine and saw wave
  if (keyCode === RIGHT_ARROW) changeWave('triangle');

  // Square - sharp, biting tone
  if (keyCode === DOWN_ARROW) changeWave('square');
}

function changeWave(type) {
  osc.stop();
  osc.setType(type);
  osc.start();
}
