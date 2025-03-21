#ifdef GL_ES
precision mediump float;
#endif

// lets grab texcoords just for fun
varying vec2 vTexCoord;



// code below taken from https://glitch.com/edit/#!/lunar-puzzled-stitch?path=uniform.frag%3A76%3A4

#define PI 3.14159265358979323846
vec2 rotate2D (vec2 _st, float _angle) {
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}
float concentricCircles(in vec2 st, in vec2 radius, in float resolution, in float scale) {
    float dist = distance(st,radius);
    float pct = floor(dist*resolution)/scale;
    return pct;
}
vec2 tile (vec2 _st, float _zoom) {
    _st *= _zoom;
    return fract(_st);
}

vec2 rotateTilePattern(vec2 _st){

    //  Scale the coordinate system by 2x2
    _st *= 2.0;

    //  Give each cell an index number
    //  according to its position
    float index = 0.0;
    index += step(1., mod(_st.x,2.0));
    index += step(1., mod(_st.y,2.0))*2.0;

    //      |
    //  2   |   3
    //      |
    //--------------
    //      |
    //  0   |   1
    //      |

    // Make each cell between 0.0 - 1.0
    _st = fract(_st);

    // Rotate each cell according to the index
    if(index == 1.0){
        //  Rotate cell 1 by 90 degrees
        _st = rotate2D(_st,PI*0.5);
    } else if(index == 2.0){
        //  Rotate cell 2 by -90 degrees
        _st = rotate2D(_st,PI*-0.5);
    } else if(index == 3.0){
        //  Rotate cell 3 by 180 degrees
        _st = rotate2D(_st,PI);
    }

    return _st;
}



// our texture coming from p5
uniform sampler2D tex0;
uniform vec2 texelSize;
uniform float u_time;
uniform vec2 u_mouse; // added
uniform float random;

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;

  // a single pass blur works by sampling all the neighbor pixels and averaging them up
  // this is somewhat inefficient because we have to sample the texture 9 times -- texture2D calls are slow :(
  // check out the two-pass-blur example for a better blur approach
  // get the webcam as a vec4 using texture2D

  // spread controls how far away from the center we should pull a sample from
  // you will start to see artifacts if you crank this up too high
  float spread = 4.0;
   // float spread = random;
  // create our offset variable by multiplying the size of a texel with spread
  vec2 offset = texelSize * spread;

  // get all the neighbor pixels!
  vec4 tex = texture2D(tex0, uv); // middle middle -- the actual texel / pixel
  tex += texture2D(tex0, uv + vec2(-offset.x, -offset.y)); // top left
  tex += texture2D(tex0, uv + vec2(0.0, -offset.y)); // top middle
  tex += texture2D(tex0, uv + vec2(offset.x, -offset.y)); // top right

  tex += texture2D(tex0, uv + vec2(-offset.x, 0.0)); //middle left
  tex += texture2D(tex0, uv + vec2(offset.x, 0.0)); //middle right

  tex += texture2D(tex0, uv + vec2(-offset.x, offset.y)); // bottom left
  tex += texture2D(tex0, uv + vec2(0.0, offset.y)); // bottom middle
  tex += texture2D(tex0, uv + vec2(offset.x, offset.y)); // bottom right

  // we added 9 textures together, so we will divide by 9 to average them out and move the values back into a 0 - 1 range
  //abs(sin(u_time))


  vec2 st = gl_FragCoord.xy; //get normalized coordinates from 0.0-1.0 WORKS!
  // vec2 st = gl_FragCoord.xy/texelSize.xy;
  vec2 mst = gl_FragCoord.xy/u_mouse.xy;
  float mdist= distance(vec2(2.0,2.0), mst);

  float dist = distance(st,vec2(((cos(u_time/10.0)+1.0)*0.5),(sin(u_time/10.0)+1.0)*0.5));
  st = rotate2D(st,dist/(mdist)*(2.0*PI));
    //vec2 st = vec2(2.0, 2.0);
    //vec2 st = u_mouse.xy;

  st = tile(st,dist *(sin(u_time) +1.0)* 10.0);
  st = rotateTilePattern(st*2.);

  

tex += fract(tex) * 10.0 + (dist *abs(sin(u_time)));
  // tex = floor(tex);
  tex /= 10.0;
  
  // tex = fract(tex) / 4.5;


  gl_FragColor = tex;
     // gl_FragColor = vec4(vec3(concentricCircles(st, vec2(0.0,0.0), 5.0, 5.0),concentricCircles(st, vec2(0.0,0.0), 10.0, 10.0),concentricCircles(st, vec2(0.0,0.0), 20.0, 10.0)),1.0);

}
