const replicateProxy = "https://replicate-api-proxy.glitch.me";
let feedback;
let img;
let p_prompt;

function setup() {
  createCanvas(512, 512);

  feedback = createP("");
  feedback.position(0,20)
  
  input_p = createInput("")
  button = createButton("Send to ML")
  button.mousePressed(() => {
    ask(input_p.value());
  });
}


function draw(){
  if (img) image(img, 0, 0, width, height);
}

async function ask(p_prompt) {
  const imageDiv = select("#resulting_image");
  feedback.html("Waiting for reply from Replicate's Stable Diffusion API...");
  let data = {
    version: "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
    input: {
      prompt: "Can you explain what a transformer is (in a machine learning context)?",
      system_prompt: "You are James Charles the famous internet personality"
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
//     img = loadImage(`${proxy_said.output[0]}`)
    const stuffBackFromFetch = await fetch(url, options);
    let JSON_format = await stuffBackFromFetch.json();
    console.log(JSON_format);
    output_j = JSON_format.output.join(" ")
    console.log(output_j)
    feedback.html(output_j)
  }
}
