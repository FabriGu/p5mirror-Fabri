let mic; 
function setup() {
  createCanvas(1024, 400);
  mic= new p5.AudioIn();
  mic.start();
  
  fft = new p5.FFT();
  fft.setInput(mic);
}

function draw() {
  background(220);
  let level = mic.getLevel();
  console.log(level)
  
  let bins = fft.analyze();
  console.log(bins)
  for (let i = 0; i < bins.length; i++) {
    let bin = bins[i]
    let y = height-bin - height/2;
    // stroke(rgb)
    
    // line(i, height/2, i, -y);
    line(i, height/2, i, y);
  }
  
  let wave = fft.waveform();
  noFill()
  beginShape();
  for (let i = 0; i < wave.length; i++) {
    let y = wave[i]*100 + height/2
    vertex(i, y)
    
    // let y = height-w;
    // stroke(rgb)
    
    // line(i, height, i, y);
  }
  endShape();
}