let canvas;

const w = 512;
const  h = 768;

let colorPicker;
let brush_color = "#EEFF66";

 //let url = "http://127.0.0.1:7860/controlnet/txt2img";

 // let url = "http://127.0.0.1:7860/sdapi/v1/img2img"; 
const url =  "https://replicate-api-proxy.glitch.me/create_n_get/";
 
 let the_drawing_canvas;

let the_drawing_container;

let pos_prompt_input_field;

let cn_weight_slider;
let curr_cn_weight = 1.1;

let brush_size = 20;
let brush_size_slider;

let brush_opacity = 10;
let brush_opacity_slider;

let buffer = new Array(w*h);

// ------------------------------------------

function changeBRUSHSIZE() {
  // Get the current value of the slider
  brush_size = brush_size_slider.value();
  
}

function changeBRUSHOPACITY() {
  // Get the current value of the slider
 brush_opacity = brush_opacity_slider.value()*.1;
  
}

function changeSLIDER() {
  // Get the current value of the slider
  curr_cn_weight = cn_weight_slider.value()*.01;
  
  document.getElementById("weight_label").innerText = `CN_WEIGHT: ${curr_cn_weight}`;
  
}



// ---------------------------------------
// ---------------------------------------
// ---------------------------------------

function hide_drawing_UI(){
  
  the_drawing_container.style.display = 'none';
  
}

function show_drawing_UI(){
  
  the_drawing_container.style.display = 'block';
  
}


// Function to get the prompt from localStorage
    function getStoredPrompt() {
      let storedPrompt = localStorage.getItem("scribble_pos_prompt");
      if (storedPrompt) {
        pos_prompt_input_field.value = storedPrompt;
      }
    }



// ---------------------------------------
// -----------------------------------
// ---------------------------------------

function setup() {
  
  pos_prompt_input_field  = document.getElementById("promptInput"); 
  
  cn_weight_slider =   select('#cn_weight'); // document.getElementById("cn_weight");
  //cn_weight_slider.input(curr_cn_weight);
 cn_weight_slider.elt.addEventListener('input', changeSLIDER);
  
  
  brush_size_slider =  select('#brush_size_slider'); //
  brush_size_slider.elt.addEventListener('input', changeBRUSHSIZE);
  
  brush_opacity_slider =  select('#brush_opacity_slider'); //
  brush_opacity_slider.elt.addEventListener('input', changeBRUSHOPACITY);
  
  getStoredPrompt();
  
  
  the_drawing_container = document.getElementById("canvas_drawing_container");
  
  the_drawing_canvas = createCanvas(w, h);
  
  canvas = createGraphics( w, h );
  canvas.background(255);
  
  //buffer = [w*h];
  
  
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = 0;// Math.floor(random(256)); // Fills the array with random int values from 0 to 255
  }
  
 //  console.log("len: " + buffer.length);
  
  the_drawing_canvas.parent(the_drawing_container);
 
  
  show_drawing_UI();
  
  frameRate(60);
  
   colorPicker = createColorPicker('#ed225d');
  colorPicker.position(0, height + 5);
 colorPicker.input(setBrushColor);
  
 
  
  // canvas.blendMode(MULTIPLY);
  // canvas.endDraw();
}

// ----------------------------------

function setBrushColor(){

  brush_color= colorPicker.color();

}


// ---------------------------------------
// ---------------------------------------
// ---------------------------------------

function draw() {
  background(220);
  
  
  
  if(mouseIsPressed){
    
   canvas.strokeWeight(brush_size);
    canvas.stroke(brush_color);
    canvas.line(mouseX,mouseY,pmouseX,pmouseY)
    canvas.circle(mouseX,mouseY,2);
    
  //  buffer
    
     //
    
   //  let iii = int(mouseY * w + mouseX);
    
   // buffer[ int(iii)] += 10;
    
   // brushDraw(brush_size);
    
    
    
    
    
 // console.log(  buffer[ int(iii)] );
    
    
    
    
  }
  
 // drawBuffer();
  image(canvas,0,0);
}

// ---------------------------------------

function brushDraw(radius) {
  // Calculate the center pixel position based on mouseX and mouseY
  let centerX = round(mouseX);
  let centerY = round(mouseY);

  // Loop through the buffer array and fill pixels within the specified radius from the center
  for (let y = max(0, centerY - radius); y <= min(h - 1, centerY + radius); y++) {
    for (let x = max(0, centerX - radius); x <= min(w - 1, centerX + radius); x++) {
      // Calculate the index of the buffer array corresponding to the current pixel
      let index = y * w + x;

      // Calculate the distance between the current pixel and the mouse position
      let distance = dist(x, y, mouseX, mouseY);

      // Calculate the increment value based on the distance and the specified radius
     
      let inc = ( radius - distance ) ;
      
      
      
      if(  brush_opacity >0){

          if(inc>1 && buffer[index]<254){
             buffer[index] += int(inc * brush_opacity*.6) ;

          }
      }else{
      
      
          if(inc>1  &&  buffer[index]>0){
               buffer[index] += int(inc * brush_opacity*.6) ;
            }
       }

      // Increment the pixel value in the buffer array
     //increment;
    }
  }
}


// ---------------------------------------
// ---------------------------------------
// ---------------------------------------

function  drawBuffer(){
  
  
  
  // Update the pixel array with the buffer values
  canvas.loadPixels();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Calculate the index of the buffer array corresponding to the current pixel
      let index = (y * w + x) * 4;
      // Get the grayscale value from the buffer array
      
      
      let grayValue = buffer[index / 4];
      // Set the pixel color in the pixel array
      canvas.pixels[index] = grayValue;     // Red component
      canvas.pixels[index + 1] = grayValue; // Green component
      canvas.pixels[index + 2] = grayValue; // Blue component
      canvas.pixels[index + 3] = 255;       // Alpha component (opaque)
      
    }
  }
 canvas.updatePixels();
  
  
  
}



// -----------------------------------
function sendDIRECT(){
  
  
    hide_drawing_UI();
  
   // After translating the prompt, store it in localStorage
      localStorage.setItem("scribble_pos_prompt", pos_prompt_input_field.value );
  
  let base64String = getBase64StringFromGraphic(canvas);
  
    let imgs  = [];
    imgs[0] = base64String;
      
  
  let all_control_nets = [];
  
  
  
  let my_controlnet_unit = {
    
      input_image: base64String,
      
      module: "none",
      model: "control_sd15_depth",
      weight:curr_cn_weight,
      resize_mode: 0,
      lowvram:false,
      processor_res:256,
      pixel_perfect:true,
      guidance:0.98,
      guessmode: true
    
 
    
  };
   
  
//   let my_controlnet_unit = {
    
//       input_image: base64String,
      
//       module: "none",
//       model: "control_sd15_depth",
//       weight:curr_cn_weight,
//       resize_mode: 0,
//       lowvram:false,
//       processor_res:256,
//       pixel_perfect:true,
//       guidance:0.98,
//       guessmode: true
    
 
    
//   };
  
  all_control_nets[0] = my_controlnet_unit;
  
  
  let pos_prompt = "((( funky fluffy moss in wooden pool and streamlet,fluffy furry forest floor in background, glossy water drips curly, molten chrome glossy white porcelain metal, complementary pastel color palette unsaturated, surreal painting)))";
  
  pos_prompt = "((( " + pos_prompt_input_field.value + ") )) ";
  
    pos_prompt += ", photorealistic, ultra realistic, maximum detail, foreground focus, epicurious, instagram, 8k, volumetric light, cinematic, octane render, uplight, no blur, depth of field, dof, bokeh, 8k, 4k";

  
  
  // Define the JSON data to be sent
      let data = {
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        init_images:imgs,
        //alwayson_scripts: {},
        prompt: pos_prompt,
        restore_faces: true,
        tiling: false,
        steps:20,
        neg_prompt: "ugly, drawing, label, text, watermark, typo, logo, watermark, text, error, blurry, jpeg artifacts, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, artist name, (worst quality, low quality:1.4), bad anatomy ", 
        width: w,
        height: h,
        batch_size:1,
        sampler_index: "Euler a",
        cfg_scale:7,
        resize_mode:0,
        denoising_strength: 0.55
       // controlnet_units:all_control_nets
      };
  
  
  
  
  // Convert JSON data to a string
      let jsonData = JSON.stringify(data);
  
   //console.log(jsonData);
  
   // Fetch data using the POST method
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
      })
        .then(response => response.json())
        .then(handleResponse)
        .catch(error => {
          console.error('Error:', error);
          //hidePreloader();
        });
  
  
}


// ---------------------------------------
// ---------------------------------------
// ---------------------------------------

function handleResponse(response) {
  
    // Clear the existing images container
      let imagesContainer = document.getElementById("images-container");
      imagesContainer.innerHTML = "";
  
  if (response.images && Array.isArray(response.images) && response.images.length > 0) {
        
          
          // Assuming the image is in the first element of the "images" array
           let image_raw1 = response.images[0];
        
        // Create an HTML <img> element and set its "src" to the image data
          let img1 = createImg("data:image/png;base64," + image_raw1);
        img1.size(width, height); // Set the size of the image
         img1.position(400, 400); // Position the image on the canvas
       
    
    
       // If there are more images, handle them here using a loop
//         for (let i = 0; i < response.images.length; i++) {
//           let image_raw = response.images[i];
//           let img = createImg("data:image/png;base64," + image_raw);
//           img.size(w, h);
          
//           img.parent(imagesContainer);
          
//         }
    
    
    
  }
  
  
  
  
}


// ---------------------------------------
// ---------------------------------------
// ---------------------------------------


function getBase64StringFromGraphic(graphic) {
      // Create an offscreen canvas
      let offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = graphic.width;
      offscreenCanvas.height = graphic.height;

      // Get the 2D context of the offscreen canvas
      let ctx = offscreenCanvas.getContext('2d');

      // Draw the graphic onto the offscreen canvas
      ctx.drawImage(graphic.elt, 0, 0);

      // Convert the offscreen canvas to base64 string
      let base64String = offscreenCanvas.toDataURL().split(',')[1];

      return base64String;
    }