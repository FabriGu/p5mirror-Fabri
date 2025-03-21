let shaderProgram;
let time = 0;

const vertShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat3 uNormalMatrix;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;
varying vec3 vCentroid;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
  
  vPosition = aPosition;
  vNormal = normalize(uNormalMatrix * aNormal);
  vTexCoord = aTexCoord;
  vCentroid = aPosition;
}`;

const fragShader = `
precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;
varying vec3 vCentroid;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define PI 3.14159265359
#define TAU 6.28318530718

// Function to calculate wrapped spherical coordinates
vec2 getWrappedCoords(vec3 pos) {
    // Convert to spherical coordinates
    float phi = atan(pos.z, pos.x);    // longitude (-π to π)
    float theta = acos(pos.y / length(pos)); // latitude (0 to π)
    
    // Normalize to [0,1] range
    phi = (phi + PI) / TAU;
    theta = theta / PI;
    
    return vec2(phi, theta);
}

// Function to calculate wrapped distance on a sphere
float sphereDistance(vec2 a, vec2 b) {
    // Convert phi (longitude) back to [-π,π] range
    float phiA = a.x * TAU - PI;
    float phiB = b.x * TAU - PI;
    
    // Calculate shortest distance considering wrapping
    float dPhi = abs(phiB - phiA);
    dPhi = dPhi > PI ? TAU - dPhi : dPhi;
    
    // Calculate latitude distance
    float dTheta = abs(b.y - a.y) * PI;
    
    // Return combined distance
    return sqrt(dPhi * dPhi + dTheta * dTheta);
}

void main() {
    // Get normalized coordinates
    vec2 faceCoords = getWrappedCoords(vCentroid);
    
    // Convert mouse position to wrapped coordinates
    vec2 mousePos = u_mouse;
    vec2 rippleCenter1 = vec2(mousePos.x, mousePos.y);
    vec2 rippleCenter2 = vec2(1.0 - mousePos.x, 1.0 - mousePos.y);
    
    // Calculate wrapped distances
    float dist1 = sphereDistance(faceCoords, rippleCenter1);
    float dist2 = sphereDistance(faceCoords, rippleCenter2);
    
    // Create stepped ripple effects
    float rippleFreq = 4.0;
    float rippleSpeed = 2.0;
    float ripple1 = floor(sin(dist1 * rippleFreq * PI - u_time * rippleSpeed) * 4.0) / 4.0;
    float ripple2 = floor(sin(dist2 * rippleFreq * PI - u_time * rippleSpeed) * 4.0) / 4.0;
    
    // Combine ripples with smooth falloff
    float maxDist = PI * 0.5;
    ripple1 *= smoothstep(maxDist, 0.0, dist1);
    ripple2 *= smoothstep(maxDist, 0.0, dist2);
    
    float combinedRipple = floor((ripple1 + ripple2) * 4.0) / 4.0;
    
    // Create color gradient
    vec3 color1 = vec3(0.2, 0.5, 0.8); // Blue
    vec3 color2 = vec3(0.8, 0.2, 0.5); // Magenta
    vec3 finalColor = mix(color1, color2, combinedRipple);
    
    // Add faceted lighting
    float light = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0)));
    light = floor(light * 4.0) / 4.0;
    finalColor *= 0.5 + light * 0.5;
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

function preload() {
  shaderProgram = createShader(vertShader, fragShader);
}

function setup() {
  createCanvas(800, 800, WEBGL);
  noStroke();
}

function draw() {
  background(0);
  
  time += 0.01;
  
  shader(shaderProgram);
  shaderProgram.setUniform('u_resolution', [width, height]);
  shaderProgram.setUniform('u_time', time);
  shaderProgram.setUniform('u_mouse', [mouseX/width, mouseY/height]);
  
  rotateY(time * 0.2);
  rotateX(sin(time * 0.1) * 0.2);
  
  sphere(200, 12, 12);
}