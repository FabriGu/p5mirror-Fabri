let video;
let poseNet;
let poses = [];
let customFont;
let cylinderRadius = 50; // Radius of the cylinder
let cylinderHeight = 200; // Height of the cylinder
let segments = 50; // Number of segments to divide the circumference
let wordsArray = ["Hello", "World", "OpenAI", "ml5.js", "p5.js", "JavaScript", "Art", "Code", "Creative"];
let textureImages = [];
let textureIndex = 0;

function preload() {
  // Load the font file
  customFont = loadFont('./cmsy.ttf');
}

function setup() {
  createCanvas(640, 480, WEBGL);
  video = createCapture(VIDEO);
  video.size(width, height);

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', function(results) {
    poses = results;
    generateTextureImages();
  });

  video.hide();
  textFont(customFont)
}

function modelLoaded() {
  console.log('Model Loaded!');
}

function generateTextureImages() {
  if (poses.length > 0) {
    let pose = poses[0].pose;

    // Create an offscreen canvas to render the text
    let offscreenCanvas = createGraphics(200, 200);

    // Set the font
    offscreenCanvas.textFont(customFont);
    offscreenCanvas.textSize(24);
    offscreenCanvas.fill(255);

    // Render the text onto the offscreen canvas
    for (let i = 0; i < wordsArray.length; i++) {
      let word = wordsArray[i];
      offscreenCanvas.background(0); // Clear the canvas
      offscreenCanvas.text(word, offscreenCanvas.width / 2, offscreenCanvas.height / 2);
      textureImages.push(offscreenCanvas.get()); // Save the rendered text as an image
    }
  }
}

function draw() {
  background(0);
  texture(video);
  plane(width, height);

  if (poses.length > 0 && textureImages.length > 0) {
    draw3DModel();
  }
}

function draw3DModel() {
  let pose = poses[0].pose;

  let wordsPerSegment = wordsArray.length / segments;

  for (let i = 0; i < segments; i++) {
    let theta = map(i, 0, segments, 0, TWO_PI);

    let x = cylinderRadius * cos(theta);
    let y = cylinderHeight / 2;
    let z = cylinderRadius * sin(theta);

    push();
    translate(x, y, z);

    // Rotate to face the camera
    rotateY(PI / 2 - theta);

    // Apply texture
    texture(textureImages[textureIndex]);
    cylinder(10, 50); // Adjust dimensions as needed

    pop();

    textureIndex = (textureIndex + 1) % textureImages.length; // Cycle through texture images
  }
}
