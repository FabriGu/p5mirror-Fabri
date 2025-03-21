let baseSizeInput;
let fontSizes = [];
const goldenRatio = 1.618;

function setup() {
  createCanvas(400, 400);
  baseSizeInput = createInput('100'); // Default value
  baseSizeInput.position(10, 10);
  baseSizeInput.input(generateSizes);
  
  generateSizes();
}

function generateSizes() {
  fontSizes = [];
  let baseSize = float(baseSizeInput.value());
  
  for (let i = 0; i < 6; i++) {
    fontSizes.push(baseSize);
    baseSize /= goldenRatio;
  }
}

function draw() {
  background(240);
  textSize(16);
  fill(50);
  text("Golden Ratio Font Sizes:", 10, 50);
  
  for (let i = 0; i < fontSizes.length; i++) {
    textSize(fontSizes[i]);
    text(`Size: ${nf(fontSizes[i], 1, 2)}`, 10, 100 + i * 50);
  }
}
