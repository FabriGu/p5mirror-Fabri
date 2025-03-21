// Original Sketch: https://glitch.com/edit/#!/tinted-glittery-feta?path=effect.vert%3A1%3A0

// the shader variable
let camShader;

// the camera variable
let cam;

function preload(){
  // load the shader
  camShader = loadShader('effect.vert', 'effect.frag');
}

function setup() {
  // shaders require WEBGL mode to work
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // initialize the webcam at the window size
  cam = createCapture(VIDEO);
  cam.size(windowWidth, windowHeight);

  // hide the html element that createCapture adds to the screen
  cam.hide();

}

function draw() {
  // shader() sets the active shader with our shader
  shader(camShader);

  // lets just send the cam to our shader as a uniform
  camShader.setUniform('tex0', cam);
  // console.log(cam)
      /*
      Uniforms are global variables within a shader program. 
      They provide a way to pass values from a sketch running on the CPU to a shader program running on the GPU.
      The first parameter, uniformName, is a string with the uniform’s name. 
      For the shader above, uniformName would be 'tex0'.

      The second parameter, data, is the value that should be used to set the uniform. 
      For example, calling myShader.setUniform('r', 0.5) would set the r uniform in the shader above to 0.5. 
      data should match the uniform’s type. Numbers, strings, booleans, arrays, and many types of images can all be passed to a shader with setUniform().
        In this case we are sending the camera valyes to the shade?
      */

  // also send the size of 1 texel on the screen
  camShader.setUniform('texelSize', [2.5/width, 2.5/height]); // can play around with the ratio for cool effects like edge blurring (original 1.0 for both)

  // changed to below to use the mouseSensitive code taken from https://glitch.com/edit/#!/lunar-puzzled-stitch?path=uniform.frag%3A76%3A4
  // camShader.setUniform('texelSize', [width, height]); // can play around with the ratio for cool effects like edge blurring (original 1.0 for both)

  camShader.setUniform('u_time', millis()/1000.0); // set the time interaval

  // adding this myself for mouse input
  // camShader.setUniform('u_mouse', [mouseX, mouseY])
  camShader.setUniform("u_mouse", [mouseX, map(mouseY, 0, height, height, 0)]);
  
  camShader.setUniform('random', 4.0);


  // rect gives us some geometry on the screen
  // rect(0,0,width, height);
  ellipse(0,0,width, height);
  // changing this to other shapes gives interesting outlines of the camera
  // why does chanigng the width and height not change the width and height of the camera and shape it is shown in?
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
