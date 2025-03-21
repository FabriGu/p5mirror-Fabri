let capture;
let previousPixels;

function setup() {
  createCanvas(640, 480);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();
  
  previousPixels = createImage(width, height);
}

function draw() {
  background(255);
  capture.loadPixels();
  
  let polygons = detectPolygonalShapes();
  
  polygons.forEach(polygon => {
    push();
    translate(polygon.center.x, polygon.center.y);
    rotate(polygon.rotation);
    
    // Cement-like fill
    fill(100, 100, 100, 200);
    noStroke();
    
    // Draw polygon
    beginShape();
    polygon.vertices.forEach(v => {
      vertex(v.x - polygon.center.x, v.y - polygon.center.y);
    });
    endShape(CLOSE);
    
    pop();
  });
}

function detectPolygonalShapes() {
  let polygons = [];
  let gridSize = 40;
  
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      let potentialPolygon = findPolygon(x, y, gridSize);
      if (potentialPolygon) {
        polygons.push(potentialPolygon);
      }
    }
  }
  
  return polygons;
}

function findPolygon(startX, startY, size) {
  let vertices = [];
  
  // Check for color/motion regions
  for (let x = startX; x < startX + size; x += 10) {
    for (let y = startY; y < startY + size; y += 10) {
      let index = (x + y * width) * 4;
      let r = capture.pixels[index];
      let g = capture.pixels[index + 1];
      let b = capture.pixels[index + 2];
      
      if (isGrayish(r, g, b)) {
        vertices.push(createVector(x, y));
      }
    }
  }
  
  // Require at least 3 vertices to form a polygon
  if (vertices.length >= 3) {
    // Calculate polygon center
    let center = calculateCenter(vertices);
    
    return {
      vertices: vertices,
      center: center,
      rotation: random(TWO_PI)
    };
  }
  
  return null;
}

function calculateCenter(vertices) {
  let centroid = createVector(0, 0);
  vertices.forEach(v => {
    centroid.add(v);
  });
  centroid.div(vertices.length);
  return centroid;
}

function isGrayish(r, g, b, threshold = 30) {
  return (
    Math.abs(r - g) < threshold && 
    Math.abs(g - b) < threshold && 
    Math.abs(r - b) < threshold
  );
}