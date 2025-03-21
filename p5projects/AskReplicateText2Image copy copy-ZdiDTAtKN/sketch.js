const replicateProxy = "https://replicate-api-proxy.glitch.me";
let feedback;
let img;
let frames = [];
let lastOutput;
let frameP = 0;
let frameNum = 5;
let input_image_field;
let imageLayer;
let mode = "image";

function setup() {
  createCanvas(512, 512);
  input_image_field = createInput(
    "A student trying to learn how use a machine learning API"
  );
  input_image_field.size(450);
  input_image_field.id("input_image_prompt");
  input_image_field.position(10,10);
  
  
  imageLayer = createGraphics(width, height);
  imageLayer.clear();
  
  //add a button to ask for picture
  let button = createButton("Ask");
  button.position(460,10);
  button.mousePressed(() => {
    requestImages();
  });
  
  let modeBtn = createButton("Mode")
  modeBtn.position(460,30);
  modeBtn.mousePressed(() => {
    if (mode == "image") {
      mode = "draw"
    } else {
      mode = "image"
    }
    console.log(mode)
  });
  
  
  feedback = createP("");
  feedback.position(0,20)
}


function draw(){
  // if (img) image(img, 0, 0, width, height);
//   if (frames.length == frameNum) {
//     for (let i = 0; i < frameNum; i++) {
//       console.log(frames[i])
//     }
//   }
  background("white")
  text(mode, 420,45)
  
  image(imageLayer, 0, 0);
  if (frames.length == frameNum) {
    frameRate(1)
    image(frames[frameP], 0, 0, 512, 512);

    frameP++;
    if (frameP > frameNum-1){
       frameP = 0; 
    }
    // console.log(frameP)
    push()
    image(imageLayer, 0, 0);
    tint(255, 127)
    
  } else {
    if (mouseIsPressed) {
      // console.log("hello")
      imageLayer.fill("blue");
      imageLayer.noStroke();
      imageLayer.ellipse(mouseX, mouseY, 20, 20);
      // imageLayer.background("red")
    }
    
    image(imageLayer, 0, 0);
  }
  
//   if (frames.length == frameNum && frameP != frames.length) {
//     setTimeout(function() {
//       image(frames[frameP], 0, 0, 512, 512);
//       // if (frameP == frames.length) {
//       //   clearInterval(interval)
//       // } else {
//         frameP++;
//       // }
      
//     }, 1000)
//   }
}

function requestImages() {
  for (let i = 0; i < frameNum; i++) {
    askForPicture(input_image_field.value(), i, imageLayer);
  }
}

async function askForPicture(p_prompt, frameP, src) {
  let srcImg;
  
  
  const imageDiv = select("#resulting_image");
  feedback.html("Waiting for reply from Replicate's Stable Diffusion API...");
  let data;
  if (frameP == 0) {
    data = {
      version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: {
        prompt: p_prompt,
        negative_prompt: "",
        num_inference_steps: 50,
        guidance_scale: 7.5,
        // seed: 42,
      },
    };
  } else {
   
    
    if (mode == "draw") {
      if (src) {
      
        src.loadPixels();
        // srcImg = src.canvas.toDataURL();
        //img2b64('nature100b.jpg');
        var code= src.canvas.toDataURL()
        srcImg ='data:image/png;base64,'+code
      }
    } else {
      if (lastOutput) {
        lastOutput.loadPixels()
        srcImg = lastOutput.canvas.toDataURL();
      
        
        
      }
    }   
    
    data = {
      version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: {
        prompt: p_prompt,
        negative_prompt: "",
        num_inference_steps: 50,
        guidance_scale: 7.5,
        image: srcImg,
        // mask_image: [srcImg]
      },
    };
  }
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

    // console.log(proxy_said)
    lastOutput = loadImage(proxy_said.output[0])
    // console.log(lastOutput)
    frames.push(loadImage(`${proxy_said.output[0]}`))
  }
}
