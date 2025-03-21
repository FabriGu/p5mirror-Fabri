let capture;
let previousPixels;
let noiseTexture;

function setup() {
  createCanvas(640, 480);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();
  
  // Create concrete texture
  noiseTexture = createGraphics(100, 100);
  generateConcreteTexture();
  
  previousPixels = createImage(width, height);
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

function draw() {
  background(240);
  capture.loadPixels();
  
  // Apply blur and threshold for better shape detection
  let processed = createImage(width, height);
  processed.copy(capture, 0, 0, width, height, 0, 0, width, height);
  processed.filter(BLUR, 3);
  processed.filter(THRESHOLD, 0.5);
  processed.loadPixels();
  
  let polygons = detectPolygonalShapes(processed);
  
  // Draw polygons with concrete texture
  polygons.forEach(polygon => {
    drawTexturedPolygon(polygon);
  });
}

function drawTexturedPolygon(polygon) {
  push();
  fill(150);
  stroke(0);
  strokeWeight(2);
  
  beginShape();
  polygon.vertices.forEach(v => {
    vertex(v.x, v.y);
  });
  endShape(CLOSE);
  
  pop();
}

function detectPolygonalShapes(img) {
  let polygons = [];
  let gridSize = 80; // Larger grid for more abstract shapes
  
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
  
  // Sample points around the grid cell
  for (let angle = 0; angle < TWO_PI; angle += PI/8) {
    let x = startX + cos(angle) * size/2;
    let y = startY + sin(angle) * size/2;
    
    if (x >= 0 && x < width && y >= 0 && y < height) {
      let index = (floor(x) + floor(y) * width) * 4;
      let brightness = img.pixels[index] / 255;
      
      if (brightness > 0.5) {
        edgePoints.push(createVector(x, y));
      }
    }
  }
  
  // Create vertices from edge points
  if (edgePoints.length >= 3) {
    // Simplify the shape by averaging nearby points
    vertices = simplifyPoints(edgePoints, size/4);
    
    return {
      vertices: vertices,
      center: calculateCenter(vertices),
      rotation: random(TWO_PI),
      size: size
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