let shapes = [];
let boundaryPoints = [];
let selectedShape = null;
let drawingBoundary = false;
let boundaryComplete = false;

const ATTACHMENT_DISTANCE = 15;
const SHAPE_SIZE = 50;

class Shape {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.attachmentPoints = [];
    this.connections = []; // Store connected shapes and which points are connected
    
    if (type === 'square') {
      // Define attachment points relative to center
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
    
    // Draw attachment points
    fill(0, 255, 0);
    const points = this.getTransformedPoints();
    for (let i = 0; i < points.length; i++) {
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
      // Simplified triangle hit detection
      return abs(rotX) < SHAPE_SIZE/2 && 
             rotY > -SHAPE_SIZE/2 && 
             rotY < SHAPE_SIZE/2;
    }
    return false;
  }
}

function setup() {
  createCanvas(800, 600);
  angleMode(RADIANS);
}

function draw() {
  background(255);
  
  // Draw boundary
  if (boundaryPoints.length > 0) {
    stroke(0);
    beginShape();
    for (let point of boundaryPoints) {
      vertex(point.x, point.y);
    }
    if (boundaryComplete) {
      endShape(CLOSE);
    } else {
      endShape();
      // Draw line to mouse while drawing
      if (drawingBoundary) {
        line(boundaryPoints[boundaryPoints.length-1].x,
             boundaryPoints[boundaryPoints.length-1].y,
             mouseX, mouseY);
      }
    }
  }
  
  // Draw shapes and check for attachments
  for (let shape of shapes) {
    shape.draw();
  }
  
  // If shape is selected, move it to mouse position
  if (selectedShape) {
    selectedShape.x = mouseX;
    selectedShape.y = mouseY;
    
    // Check for nearby attachment points
    const selectedPoints = selectedShape.getTransformedPoints();
    
    for (let shape of shapes) {
      if (shape === selectedShape) continue;
      
      const otherPoints = shape.getTransformedPoints();
      
      for (let i = 0; i < selectedPoints.length; i++) {
        for (let j = 0; j < otherPoints.length; j++) {
          const d = dist(selectedPoints[i].x, selectedPoints[i].y,
                        otherPoints[j].x, otherPoints[j].y);
          
          if (d < ATTACHMENT_DISTANCE) {
            // Snap to attachment point
            const dx = otherPoints[j].x - selectedPoints[i].x;
            const dy = otherPoints[j].y - selectedPoints[i].y;
            selectedShape.x += dx;
            selectedShape.y += dy;
            
            // Record connection
            if (!selectedShape.connections.some(c => 
                c.shape === shape && c.point1 === i && c.point2 === j)) {
              selectedShape.connections.push({
                shape: shape,
                point1: i,
                point2: j
              });
            }
          }
        }
      }
    }
  }
}

function mousePressed() {
  if (!boundaryComplete) {
    if (!drawingBoundary) {
      // Start drawing boundary
      drawingBoundary = true;
      boundaryPoints.push({x: mouseX, y: mouseY});
    } else {
      // Continue drawing boundary
      boundaryPoints.push({x: mouseX, y: mouseY});
    }
  } else {
    // Select shape
    selectedShape = null;
    for (let shape of shapes) {
      if (shape.contains(mouseX, mouseY)) {
        selectedShape = shape;
        break;
      }
    }
  }
}

function mouseReleased() {
  if (selectedShape) {
    selectedShape = null;
  }
}

function keyPressed() {
  if (!boundaryComplete) {
    if (key === 'Enter') {
      // Complete boundary
      boundaryComplete = true;
      drawingBoundary = false;
    }
  } else {
    if (key === 's') {
      shapes.push(new Shape('square', mouseX, mouseY));
    } else if (key === 't') {
      shapes.push(new Shape('triangle', mouseX, mouseY));
    } else if (key === 'd') {
      saveTrainingData();
    }
    
    if (selectedShape) {
      if (keyCode === LEFT_ARROW) {
        selectedShape.rotation -= PI/16;
      } else if (keyCode === RIGHT_ARROW) {
        selectedShape.rotation += PI/16;
      }
    }
  }
}

function saveTrainingData() {
  const data = {
    boundary: boundaryPoints,
    shapes: shapes.map(shape => ({
      type: shape.type,
      x: shape.x,
      y: shape.y,
      rotation: shape.rotation,
      connections: shape.connections.map(conn => ({
        connectedShapeType: conn.shape.type,
        point1: conn.point1,
        point2: conn.point2
      }))
    }))
  };
  
  saveJSON(data, 'training_data.json');
}