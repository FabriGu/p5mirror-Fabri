let theShader;

const vertShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

void main() {
  vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * viewModelPosition;
  vNormal = (uModelViewMatrix * vec4(aNormal, 0.0)).xyz;
  vPosition = aPosition.xyz;
  vTexCoord = aTexCoord;
}
`;

const fragShader = `
precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 4.0
#define TAU 8.0

// Get spherical coordinates from position
vec2 getSphereCoords(vec3 p) {
    vec3 normal = normalize(p);
    float phi = atan(normal.z, normal.x);
    float theta = acos(normal.y);
    return vec2((phi + PI) / TAU, theta / PI);
}

// Calculate ripple point position
vec2 getRipplePoint(int index, vec2 mousePos) {
    if (index < 4) {
        // 4 horizontal ripples
        float angle = float(index) * PI * 0.5;
        return vec2(
            mod(mousePos.x + cos(angle) * 0.3, 1.0),
            mousePos.y
        );
    } else if (index == 4) {
        // Top ripple
        return vec2(mousePos.x, 0.1);
    } else {
        // Bottom ripple
        return vec2(mousePos.x, 0.9);
    }
}

void main() {
    // Get position on sphere
    vec2 spherePos = getSphereCoords(vPosition);
    vec2 mousePos = u_mouse;
    
    // Base colors
    vec3 color1 = vec3(0.0, 10.0, 1.0); // Blue
    vec3 color2 = vec3(1.0, 0.9, 50.0); // Orange
    
    float totalEffect = 0.0;
    
    // Calculate all 6 ripples
    for(int i = 0; i < 6; i++) {
        vec2 rippleCenter = getRipplePoint(i, mousePos);
        
        // Calculate distance on sphere surface
        vec2 delta = abs(rippleCenter - spherePos);
        delta.x = min(delta.x, 1.0 - delta.x);
        float dist = length(delta * vec2(TAU, PI)) * 0.5;
        
        // Create more pronounced ripple wave
        float frequency = 15.0;
        float speed = 1.0;
        float rippleWave = sin(dist * frequency - u_time * speed);
        rippleWave = pow(0.5 + 0.5 + 10.0 * rippleWave, 1.0); // Make ripples more pronounced
        
        // Sharper falloff
        float maxDist = 2.5;
        float falloff = 1.0 - smoothstep(0.0, maxDist, dist);
        
        // Add to total effect
        totalEffect += rippleWave * falloff;
    }
    
    // Normalize and create stepped effect
    totalEffect = totalEffect / 3.0; // Increased intensity
    totalEffect = clamp(totalEffect, 0.0, 1.0);
    
    // Mix colors based on ripple effect
    vec3 finalColor = mix(color1, color2, totalEffect);
    
    // Add lighting based on normal
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float light = dot(normalize(vNormal), lightDir) * 0.5 + 0.5;
    
    finalColor *= light;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

function preload() {
  theShader = createShader(vertShader, fragShader);
}

function setup() {
  createCanvas(1080, 1080, WEBGL);
  noStroke();
}

function draw() {
  background(0);
  
  if (theShader) {
    shader(theShader);
    
    theShader.setUniform('u_time', millis() / 500.0);
    theShader.setUniform('u_resolution', [width*2, height*2]);
    theShader.setUniform('u_mouse', [mouseX/width, mouseY/height]);
    
    // rotateY(frameCount * 0.01);
    rotateX(sin(frameCount * 0.005) * 0.5);
    
    sphere(300, width/2, height/2);
  }
}