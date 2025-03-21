let capture;
let previousPixels;
let noiseTexture;
let camX, camY, camZ;

function setup() {
  createCanvas(640, 640, WEBGL);
  capture = createCapture(VIDEO);
  capture.size(640, 640);
  capture.hide();
  
  // Initialize camera controls
  camX = 0;
  camY = 0;
  camZ = 800;
  
  noiseTexture = createGraphics(100, 100);
  generateConcreteTexture();
  previousPixels = createImage(width, height);
  frameRate(10)
}

function draw() {
  background(0);
  // rotateX(frameCount * 5);
//   rotateY(frameCount * 0.02);
  
  if (mouseIsPressed) {
    camX += (mouseX - pmouseX) * 2;
    camY += (mouseY - pmouseY) * 2;
  }
  let rotationSpeed = 0.2; // Adjust this to control rotation speed
camX += rotationSpeed;
camera(sin(camX) * camZ, sin(camY * 0.01) * camZ, cos(camX) * camZ);
  camera(sin(camX * 0.01) * camZ, sin(camY * 0.01) * camZ, cos(camX * 0.01) * camZ);
  
  capture.loadPixels();
  let processed = createImage(width, height);
  processed.copy(capture, 0, 0, width, height, 0, 0, width, height);
  processed.filter(BLUR, 3);
  processed.filter(THRESHOLD, 0.5);
  processed.loadPixels();
  
  translate(-width/2, -height/2, 0);
  
  // Create polygons with varying sizes
  let sizes = [80, 60, 40];
  sizes.forEach(size => {
    let polygons = detectPolygonalShapes(processed, size, random(-2, 2));
    polygons.forEach(polygon => drawPolygon3D(polygon));
  });
}

function drawPolygon3D(polygon) {
  push();
  translate(0,0, random(-30,31))
  translate(polygon.center.x, polygon.center.y, polygon.depth);
  
  // Random grayscale color
  let shade = random(130, 170);
  fill(shade);
  stroke(shade - 10);
  strokeWeight(1);
  
  // Front face
  beginShape();
  polygon.vertices.forEach(v => {
    let dx = v.x - polygon.center.x;
    let dy = v.y - polygon.center.y;
    vertex(dx, dy, 10);
  });
  endShape(CLOSE);
  
  // Back face
  beginShape();
  polygon.vertices.forEach(v => {
    let dx = v.x - polygon.center.x;
    let dy = v.y - polygon.center.y;
    vertex(dx, dy, -10);
  });
  endShape(CLOSE);
  
  // Side faces
  beginShape(TRIANGLE_STRIP);
  polygon.vertices.forEach((v, i) => {
    let dx = v.x - polygon.center.x;
    let dy = v.y - polygon.center.y;
    vertex(dx, dy, 10);
    vertex(dx, dy, -10);
  });
  // Connect back to first vertex
  let first = polygon.vertices[0];
  vertex(first.x - polygon.center.x, first.y - polygon.center.y, 10);
  vertex(first.x - polygon.center.x, first.y - polygon.center.y, -10);
  endShape(CLOSE);
  
  pop();
}

function detectPolygonalShapes(img, size, depth) {
  let polygons = [];
  let gridSize = size;
  
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      let potentialPolygon = findPolygon(x, y, gridSize, img);
      if (potentialPolygon) {
        polygons.push(potentialPolygon);
      }
    }
  }
  return polygons;
}

function findPolygon(startX, startY, size, img) {
  let vertices = [];
  let edgePoints = [];
//   noStroke();
  
  // Randomize starting position within grid
  startX += random(-size/2, size/2);
  startY += random(-size/2, size/2);
  
  // Random number of points between 3 and 8
  let points = floor(random(3, 8));
  for (let i = 0; i < points; i++) {
    let angle = (TWO_PI / points) * i + random(-0.5, 0.5);
    let radius = size/2 + random(-size/4, size/4);
    let x = startX + cos(angle) * radius;
    let y = startY + sin(angle) * radius;
    
    if (x >= 0 && x < width && y >= 0 && y < height) {
      let index = (floor(x) + floor(y) * width) * 4;
      let brightness = img.pixels[index] / 255;
      
      if (brightness < 0.95) {
        edgePoints.push(createVector(x, y));
      }
    }
  }
  
  if (edgePoints.length >= 3) {
    vertices = simplifyPoints(edgePoints, size/4);
    return {
      vertices: vertices,
      center: calculateCenter(vertices),
      rotation: {
        x: random(TWO_PI),
        y: random(TWO_PI),
        z: random(TWO_PI)
      },
      size: size,
      depth: random(-2, 2)
    };
  }
  return null;
}

function simplifyPoints(points, tolerance) {
  let simplified = [];
  let current = points[0];
  simplified.push(current);
  
  for (let i = 1; i < points.length; i++) {
    let d = dist(current.x, current.y, points[i].x, points[i].y);
    if (d > tolerance) {
      current = points[i];
      simplified.push(current);
    }
  }
  return simplified;
}

function calculateCenter(vertices) {
  let centroid = createVector(0, 0);
  vertices.forEach(v => {
    centroid.add(v);
  });
  centroid.div(vertices.length);
  return centroid;
}

function generateConcreteTexture() {
  noiseTexture.loadPixels();
  for (let x = 0; x < noiseTexture.width; x++) {
    for (let y = 0; y < noiseTexture.height; y++) {
      let noiseVal = noise(x * 0.1, y * 0.1) * 255;
      let granular = random(-20, 20);
      let pixel = color(noiseVal + granular, 100);
      noiseTexture.set(x, y, pixel);
    }
  }
  noiseTexture.updatePixels();
}