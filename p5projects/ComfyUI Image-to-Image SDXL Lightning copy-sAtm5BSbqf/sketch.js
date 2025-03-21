// Machine Learning for Artists and Designers
// NYUSH F24 - gohai

// This workflow expects
// - models/checkpoints/sdxl_lightning_2step.safetensors
// to be available on the ComfyUI server

let workflow;
let comfy;
let srcImg;
let resImg;

function preload() {
  workflow = loadJSON("workflow_api.json");
}

function setup() {
  createCanvas(512, 512);
  pixelDensity(1); // SDXL operates on 1024x1024, but 512x512 makes it faster

  srcImg = createGraphics(width, height);

  comfy = new ComfyUiP5Helper("https://7faa8b013957.ngrok.app/");
  console.log("workflow is", workflow);

  let button = createButton("start generating");
  button.mousePressed(requestImage);
  button = createButton("new seed");
  button.mousePressed(updateSeed);
}

function requestImage() {
  // replace the LoadImage node with our source image
  workflow[10] = comfy.image(srcImg); // can even use get() to get entire sketch and give it to the comfy ui node

  // replace the prompts (#6 is positive, #7 negative)
  workflow[6].inputs.text = "idylic beach scene with white volleyball";
  workflow[7].inputs.text = "multiple volleyballs, text";

  comfy.run(workflow, gotImage);
}

function updateSeed() {
  // update the random seed
  workflow[3].inputs.seed = random(9999999);
}

function gotImage(data, err) {
  // data is an array of outputs from running the workflow
  console.log("gotImage", data);

  // we can load them like so
  if (data.length > 0) {
    resImg = loadImage(data[0].src);
  }

  // automatically run again
  requestImage();
}

function draw() {
  // draw a scene into the source image to use for generation
  srcImg.background(255, 150, 50); // sky
  srcImg.fill(0, 50, 150); // water
  srcImg.noStroke();
  srcImg.rect(0, height / 2, width, height / 2);
  srcImg.fill(255); // volleyball
  srcImg.noStroke();
  srcImg.ellipse(mouseX, mouseY, 150, 150);

  background(255);
  if (resImg) {
    //if we have an image, put it onto the canvas
    image(resImg, 0, 0, width, height);
  } else {
    image(srcImg, 0, 0);
  }
}
