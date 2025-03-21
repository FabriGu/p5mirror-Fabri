let input;
let img;

function setup() {
  createCanvas(400, 400);
  input = createInput("A woman jumping on a trampoline in order to bounce and reach a ham burger that is floating")
  input.style("width: 300px;")
  button = createButton("Send to ML")
  button.mousePressed(ask);
  
}

function draw() {
  //background(220);
  if (img) image(img, 0, 0, width, height);
}

async function ask() {
  console.log("asked this:" + input.value());
  text("asked this:" + input.value(), 10, 100, 300,300)
  
  const url =  "https://replicate-api-proxy.glitch.me/create_n_get/";
  let data = {
    version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
    input: {
      prompt: input.value(),
      // seed: 
    }
  };
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const stuffBackFromFetch = await fetch(url, options);
  let JSON_format = await stuffBackFromFetch.json();
  console.log(JSON_format);
  
  loadImage(JSON_format.output[0], (incomingImage) => {
    img = incomingImage
  });
}