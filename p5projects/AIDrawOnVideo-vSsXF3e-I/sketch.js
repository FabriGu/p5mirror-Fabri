let img;
let frame;
let button;
let inputBox;
let mask;
let canvas;
let painting;
const replicateProxy = "https://replicate-api-proxy.glitch.me";
let videoOn;
let prevImgs = [];
let loc = 0;

let canvas2;

function preload() {
  // img = loadImage("jacob.png");
}
function setup() {
  
  
  button = createButton("Ask");
  button.mousePressed(ask);
  button.position(530, 40);
  inputBox = createInput("cowboy hat");
  inputBox.position(530, 10);
  
  video = createCapture(VIDEO); 
  video.size(512, 512);
  video.hide();
  videoOn = true;
  frame = video;

  canvas = createCanvas(512, 512);
  canvas.position(0, 0);

  painting = createGraphics(512, 512);

  mask = createGraphics(512, 512);
//   image(img, 0, 0, 512, 512);
  
  takeImg = createButton("Take Pic")
  takeImg.position(530, 70);
  takeImg.mousePressed(function () { img = video.get();     prevImgs.push(img); video.remove(); videoOn = false;});
  
  prev = createButton("Previous")
  prev.position(530, 100)
  prev.mousePressed(function () {
    // console.log(prevImgs[loc-1])
    // console.log(loc)
    if (loc > 0) {
      img = prevImgs[loc-1]
      loc--;
      push();
      translate(width, 0);
      scale(-1, 1);
      image(img, 0, 0, 512, 512);
      pop()
      
    }
  });
  
  reset = createButton("Reset")
  reset.position(600, 100)
  reset.mousePressed(function() {
    loc = 0;
    prevImgs.splice(1)
    img = prevImgs[loc]
    push();
    translate(width, 0);
    scale(-1, 1);
    image(img, 0, 0, 512, 512);
    pop()
  })
  
  let p = createP("Change Brush Size:");
  p.position(532, 120);
  
  slider = createSlider(20, 100, 50);
  slider.position(530, 160);
}

function draw() {
  if (videoOn) {
    push();
    translate(width, 0);
    scale(-1, 1);
    if (frame) image(frame, 0, 0, width, height);
    pop()
  } 
}

function mouseDragged() {
  painting.noStroke();
  painting.fill(255, 255, 255);
  painting.ellipse(mouseX, mouseY, slider.value(), slider.value());
  //  this was a test thing sorry. ellipse(512 + mouseX, mouseY, 10, 10);
  image(painting, 0, 0, 512, 512);
  console.log(painting)
}
function mouseReleased() {
  maskBase64 = mask.elt.toDataURL();
  
}

async function ask() {
  push();
  translate(width, 0);
  scale(-1, 1);
  image(img, 0, 0, 512, 512);
  pop()
  mask.fill(0, 0, 0);
  mask.rect(0, 0, 512, 512);
  mask.image(painting, 0, 0, 512, 512);
  canvas.loadPixels();
  mask.loadPixels();
  let maskBase64 = mask.elt.toDataURL();
  let imgBase64 = canvas.elt.toDataURL();
  console.log(maskBase64)
  let postData = {
    version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    input: {
      prompt: inputBox.value(),
      prompt_strength: 1.0,
      num_inference_steps: 50,
      guidance_scale: 7.5,
      image: imgBase64,
      mask: maskBase64,
      // seed: 32,
    },
  };

  let url = replicateProxy + "/create_n_get";
  const options = {
    headers: {
      "Content-Type": `application/json`,
    },
    method: "POST",
    body: JSON.stringify(postData), //p)
  };
  console.log("Asking for Picture ", url, postData);
  const response = await fetch(url, options);
  const result = await response.json();
  console.log(result);
  if (!result.error) {
    loadImage(result.output[0], function (newImage) {
      console.log("image loaded", newImage);
      painting = createGraphics(512, 512);
      img = newImage;
      prevImgs.push(newImage)
      loc++;
      // console.log(prevImgs)
      push();
        translate(width, 0);
        scale(-1, 1);
        image(img, 0, 0, 512, 512);
      pop()
    });
  } else {
    console.log("Error", result.error);
  }
}
