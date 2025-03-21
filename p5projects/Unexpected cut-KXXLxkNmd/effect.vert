// our vertex data
attribute vec3 aPosition;
attribute vec2 aTexCoord;
uniform float u_time; // tried this for fun but does not work 

// lets get texcoords just for fun! 
varying vec2 vTexCoord;

void main() {
  // copy the texcoords
  vTexCoord = aTexCoord;

  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4 = vec4(aPosition, 1.0); // the second variable changes the scale of the geometry and thus the camera feedback
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0 ; // placing the image in teh center of the screen 

  // send the vertex information on to the fragment shader
  gl_Position = positionVec4;
}