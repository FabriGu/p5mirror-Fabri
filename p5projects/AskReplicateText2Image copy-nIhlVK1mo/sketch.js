const replicateProxy = "https://replicate-api-proxy.glitch.me";
let feedback;
let img;

function setup() {
  createCanvas(512, 512);
  let input_image_field = createInput(
    "A student trying to learn how use a machine learning API"
  );
  input_image_field.size(450);
  input_image_field.id("input_image_prompt");
  input_image_field.position(10,10);
  //add a button to ask for picture
  let button = createButton("Ask");
  button.position(460,10);
  button.mousePressed(() => {
    askForPicture(input_image_field.value());
  });
  feedback = createP("");
  feedback.position(0,20)
}


function draw(){
  if (img) image(img, 0, 0, width, height);
}

async function askForPicture(p_prompt) {
  const imageDiv = select("#resulting_image");
  feedback.html("Waiting for reply from Replicate's Stable Diffusion API...");
  let data = {
    version: "cc7400e93bd6e5b684b7957998410f766e02765601358bfc701bf84b4588e675",
    input: {
      prompt: p_prompt,
      negative_prompt: "robot, watermark, blurry",
      num_inference_steps: 50,
      guidance_scale: 7.5,
      seed: 42,
    },
  };
  console.log("Asking for Picture Info From Replicate via Proxy", data);
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const url = replicateProxy + "/create_n_get/";
  const picture_info = await fetch(url, options);
  //turn the stuff coming back into json
  const proxy_said = await picture_info.json();
  if (proxy_said.output.length == 0) {
    feedback.html("Something went wrong, try it again");
  } else {
    feedback.html("");
    // loadImage(proxy_said.output[0], (incomingImage) => {
    //   img = incomingImage
    // });
    img = loadImage(`${proxy_said.output[0]}`)
    
  }
}
