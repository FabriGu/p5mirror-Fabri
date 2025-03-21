let shapes = [];
let boundaryMask;
let selectedShape = null;
let drawingBoundary = false;

const ATTACHMENT_DISTANCE = 15;
const SHAPE_SIZE = 50;
const ROTATION_SNAP = Math.PI/16; // For finer rotation snapping

class Shape {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.attachmentPoints = [];
    this.connections = new Map(); // Map of pointIndex -> [{shape, pointIndex}]
    
    if (type === 'square') {
      this.attachmentPoints = [
        {x: -SHAPE_SIZE/2, y: -SHAPE_SIZE/2}, // top-left
        {x: SHAPE_SIZE/2, y: -SHAPE_SIZE/2},  // top-right
        {x: SHAPE_SIZE/2, y: SHAPE_SIZE/2},   // bottom-right
        {x: -SHAPE_SIZE/2, y: SHAPE_SIZE/2}   // bottom-left
      ];
    } else if (type === 'triangle') {
      this.attachmentPoints = [
        {x: 0, y: -SHAPE_SIZE/2},             // top
        {x: SHAPE_SIZE/2, y: SHAPE_SIZE/2},   // bottom-right
        {x: -SHAPE_SIZE/2, y: SHAPE_SIZE/2}   // bottom-left
      ];
    }
  }
  
  getTransformedPoints() {
    return this.attachmentPoints.map(point => {
      const cos = Math.cos(this.rotation);
      const sin = Math.sin(this.rotation);
      return {
        x: this.x + (point.x * cos - point.y * sin),
        y: this.y + (point.x * sin + point.y * cos)
      };
    });
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    if (this === selectedShape) {
      stroke(255, 0, 0);
    } else {
      stroke(0);
    }
    
    fill(200);
    
    if (this.type === 'square') {
      rectMode(CENTER);
      rect(0, 0, SHAPE_SIZE, SHAPE_SIZE);
    } else if (this.type === 'triangle') {
      triangle(0, -SHAPE_SIZE/2, 
              SHAPE_SIZE/2, SHAPE_SIZE/2, 
              -SHAPE_SIZE/2, SHAPE_SIZE/2);
    }
    
    // Draw attachment points with different colors based on connection status
    const transformedPoints = this.getTransformedPoints();
    for (let i = 0; i < this.attachmentPoints.length; i++) {
      if (this.connections.has(i)) {
        fill(0, 0, 255); // Connected points in blue
      } else {
        fill(0, 255, 0); // Unconnected points in green
      }
      circle(this.attachmentPoints[i].x, this.attachmentPoints[i].y, 8);
    }
    
    pop();
  }
  
  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    const rotX = dx * cos - dy * sin;
    const rotY = dx * sin + dy * cos;
    
    if (this.type === 'square') {
      return abs(rotX) < SHAPE_SIZE/2 && abs(rotY) < SHAPE_SIZE/2;
    } else if (this.type === 'triangle') {
      return abs(rotX) < SHAPE_SIZE/2 && 
             rotY > -SHAPE_SIZE/2 && 
             rotY < SHAPE_SIZE/2;
    }
    return false;
  }
  
  disconnectAll() {
    // Remove all connections from this shape
    this.connections.clear();
    
    // Remove connections from other shapes that connect to this shape
    for (let shape of shapes) {
      if (shape === this) continue;
      for (let [pointIndex, connections] of shape.connections) {
        shape.connections.set(pointIndex, 
          connections.filter(conn => conn.shape !== this));
        if (shape.connections.get(pointIndex).length === 0) {
          shape.connections.delete(pointIndex);
        }
      }
    }
  }
  
  tryConnect() {
    const selectedPoints = this.getTransformedPoints();
    let bestRotation = this.rotation;
    let minDistance = Infinity;
    let bestConnections = new Map();
    
    // Try different rotations to find the best fit
    for (let rotOffset = -PI/4; rotOffset <= PI/4; rotOffset += ROTATION_SNAP) {
      const testRotation = this.rotation + rotOffset;
      const testConnections = new Map();
      let maxDistance = 0;
      
      // Calculate transformed points for this test rotation
      const testPoints = this.attachmentPoints.map(point => {
        const cos = Math.cos(testRotation);
        const sin = Math.sin(testRotation);
        return {
          x: this.x + (point.x * cos - point.y * sin),
          y: this.y + (point.x * sin + point.y * cos)
        };
      });
      
      // Check all points against all other shapes
      for (let shape of shapes) {
        if (shape === this) continue;
        const otherPoints = shape.getTransformedPoints();
        
        for (let i = 0; i < testPoints.length; i++) {
          for (let j = 0; j < otherPoints.length; j++) {
            const d = dist(testPoints[i].x, testPoints[i].y,
                         otherPoints[j].x, otherPoints[j].y);
            
            if (d < ATTACHMENT_DISTANCE) {
              if (!testConnections.has(i)) {
                testConnections.set(i, []);
              }
              testConnections.get(i).push({shape, pointIndex: j});
              maxDistance = max(maxDistance, d);
            }
          }
        }
      }
      
      // If we found better connections, save them
      if (testConnections.size > 0 && maxDistance < minDistance) {
        minDistance = maxDistance;
        bestRotation = testRotation;
        bestConnections = testConnections;
      }
    }
    
    // If we found good connections, apply them
    if (bestConnections.size > 0) {
      this.rotation = bestRotation;
      this.connections = bestConnections;
      
      // Update position to align with connected points
      let totalDx = 0;
      let totalDy = 0;
      let count = 0;
      
      const finalPoints = this.getTransformedPoints();
      for (let [pointIndex, connections] of bestConnections) {
        for (let conn of connections) {
          const otherPoints = conn.shape.getTransformedPoints();
          const dx = otherPoints[conn.pointIndex].x - finalPoints[pointIndex].x;
          const dy = otherPoints[conn.pointIndex].y - finalPoints[pointIndex].y;
          totalDx += dx;
          totalDy += dy;
          count++;
        }
      }
      
      if (count > 0) {
        this.x += totalDx / count;
        this.y += totalDy / count;
      }
      
      // Add reciprocal connections to connected shapes
      for (let [pointIndex, connections] of bestConnections) {
        for (let conn of connections) {
          if (!conn.shape.connections.has(conn.pointIndex)) {
            conn.shape.connections.set(conn.pointIndex, []);
          }
          conn.shape.connections.get(conn.pointIndex).push({
            shape: this,
            pointIndex: pointIndex
          });
        }
      }
    }
  }
}

function setup() {
  createCanvas(800, 600);
  angleMode(RADIANS);
  boundaryMask = createGraphics(width, height);
  boundaryMask.background(0);
}

function draw() {
  background(255);
  
  // Draw boundary mask
  image(boundaryMask, 0, 0);
  
  // Draw all shapes
  for (let shape of shapes) {
    shape.draw();
  }
  
  // Move selected shape
  if (selectedShape) {
    selectedShape.x = mouseX;
    selectedShape.y = mouseY;
  }
}

function mousePressed() {
  if (keyIsPressed && key === 'b') {
    // Draw on boundary mask
    boundaryMask.stroke(255);
    boundaryMask.strokeWeight(4);
    boundaryMask.line(mouseX, mouseY, pmouseX, pmouseY);
  } else {
    // Select shape
    selectedShape = null;
    for (let shape of shapes) {
      if (shape.contains(mouseX, mouseY)) {
        selectedShape = shape;
        selectedShape.disconnectAll();
        break;
      }
    }
  }
}

function mouseDragged() {
  if (keyIsPressed && key === 'b') {
    boundaryMask.stroke(255);
    boundaryMask.strokeWeight(4);
    boundaryMask.line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

function mouseReleased() {
  if (selectedShape) {
    selectedShape.tryConnect();
    selectedShape = null;
  }
}

function keyPressed() {
  if (key === 's') {
    shapes.push(new Shape('square', mouseX, mouseY));
  } else if (key === 't') {
    shapes.push(new Shape('triangle', mouseX, mouseY));
  } else if (key === 'd') {
    saveTrainingData();
  } else if (key === 'c') {
    boundaryMask.background(0);
  }
  if (selectedShape) {
      if (keyCode === LEFT_ARROW) {
        selectedShape.rotation -= PI/16;
      } else if (keyCode === RIGHT_ARROW) {
        selectedShape.rotation += PI/16;
      }
    }
}

function saveTrainingData() {
  // Convert boundary mask to normalized point cloud
  let boundaryPoints = [];
  boundaryMask.loadPixels();
  for (let x = 0; x < width; x += 10) {
    for (let y = 0; y < height; y += 10) {
      const index = 4 * (y * width + x);
      if (boundaryMask.pixels[index] > 128) {
        boundaryPoints.push({
          x: x / width,
          y: y / height
        });
      }
    }
  }
  
  const data = {
    boundary: boundaryPoints,
    shapes: shapes.map(shape => ({
      type: shape.type,
      x: shape.x / width,  // Normalize coordinates
      y: shape.y / height,
      rotation: shape.rotation,
      connections: Array.from(shape.connections.entries()).map(([pointIndex, conns]) => ({
        pointIndex: pointIndex,
        connectedTo: conns.map(conn => ({
          shapeIndex: shapes.indexOf(conn.shape),
          pointIndex: conn.pointIndex
        }))
      }))
    }))
  };
  
  saveJSON(data, 'training_data.json');
}