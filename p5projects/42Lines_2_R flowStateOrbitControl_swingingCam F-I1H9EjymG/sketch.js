let angle = 0, direction = 1, baseHue;

let cameraAngle = 0, oscillating = true, lastTransitionTime = 0, isTransitioning = false, transitionStartAngle = 0, transitionTargetAngle = 0, transitionStartTime = 0;
const PAUSE_DURATION = 7000; // 5 seconds in milliseconds
const TRANSITION_DURATION = 4000; // 1 second transition

function setup() {
  createCanvas(1080, 1080, WEBGL);
  colorMode(HSB, 360, 100, 100, 0.5);
  baseHue = random(360);
}

function draw() {
  const currTime = millis(); const timeSinceTransition = currTime - lastTransitionTime; 
  if (timeSinceTransition >= PAUSE_DURATION && !isTransitioning) { isTransitioning = true; transitionStartTime = currTime; transitionStartAngle = cameraAngle; transitionTargetAngle = cameraAngle === 0 ? PI/2 : 0;
  }
  if (isTransitioning) {
    const transitionProgress = (currTime - transitionStartTime) / TRANSITION_DURATION;
    if (transitionProgress >= 1) { cameraAngle = transitionTargetAngle; isTransitioning = false; lastTransitionTime = currTime;
    } else { const t = transitionProgress; const smoothT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; cameraAngle = transitionStartAngle + (transitionTargetAngle - transitionStartAngle) * smoothT;
    }
  }
  let radius = 700, camX = 0, camY = sin(cameraAngle) * radius, camZ = cos(cameraAngle) * radius;
  camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0); background(0); rotateZ(PI); rotateZ(angle);
  for (let i = 0; i < 4; i++) { push(); rotate(PI/2 + (PI/2 * i)); drawFibSystem(0, 0, 0, 0.7,0.5, 2); pop(); }
  angle += 0.01;
}
function drawFibSystem(x, y, z, size, depth, rotation) {
  if (size > 100 || size < 1) direction *= -1; if (depth > 20) return; push(); translate(x,y,rotation); rotateZ(rotation); baseHue = (frameCount) % 360; const hue = (baseHue + depth *5 ) % 360; stroke(hue, 80, 90); strokeWeight(3); noFill();const nextSize = size * 1.2 * direction; const displacement = size /15; // default size * 20
  drawFibSystem(displacement, 0, z + size * 5, nextSize, depth + 1, rotation ); // first variable == displacement usually and roation + PI/2
  beginShape();
  for (let a = 0; a < PI/2; a += 0.1) { // a < PI/2
    const r = size * 20;const px = cos(a) * r; // cos(a) * r
    const py = sin(a) * r; //sin(a) * r
    vertex(px, py, sin(a + angle * 2) * size * 10);
  }
  endShape();
  pop();
}
function windowResized() {
  resizeCanvas(1080, 1080);
}