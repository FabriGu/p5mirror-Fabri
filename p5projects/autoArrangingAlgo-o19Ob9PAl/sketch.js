// Base Shape class
class Shape {
  constructor(x, y, rotation = 0) {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.attachmentPoints = [];
    this.connectedTo = new Map();
  }
  
  getAttachmentPoints() {
    return this.attachmentPoints.map(point => {
      const rotatedX = point.x * cos(this.rotation) - point.y * sin(this.rotation);
      const rotatedY = point.x * sin(this.rotation) + point.y * cos(this.rotation);
      return { x: this.x + rotatedX, y: this.y + rotatedY };
    });
  }
  
  getAttachmentPoint(index) {
    const point = this.attachmentPoints[index];
    const rotatedX = point.x * cos(this.rotation) - point.y * sin(this.rotation);
    const rotatedY = point.x * sin(this.rotation) + point.y * cos(this.rotation);
    return { x: this.x + rotatedX, y: this.y + rotatedY };
  }
  
  hasAvailableAttachmentPoint() {
    return this.connectedTo.size < this.attachmentPoints.length;
  }
  
  getAvailableAttachmentIndices() {
    const indices = [];
    for (let i = 0; i < this.attachmentPoints.length; i++) {
      if (!this.connectedTo.has(i)) {
        indices.push(i);
      }
    }
    return indices;
  }
  
  // Get vertices for collision detection
  getVertices() {
    // Override in subclasses
    return [];
  }
  
  // Check if point is inside shape
  containsPoint(px, py) {
    // Override in subclasses
    return false;
  }
  
  // Check collision with another shape
  collidesWith(other) {
    // Get vertices of both shapes
    const myVertices = this.getVertices();
    const otherVertices = other.getVertices();
    
    // Check if any vertex of either shape is inside the other shape
    for (let vertex of myVertices) {
      if (other.containsPoint(vertex.x, vertex.y)) {
        return true;
      }
    }
    for (let vertex of otherVertices) {
      if (this.containsPoint(vertex.x, vertex.y)) {
        return true;
      }
    }
    
    // Check for edge intersections
    for (let i = 0; i < myVertices.length; i++) {
      const next = (i + 1) % myVertices.length;
      const line1 = {
        x1: myVertices[i].x,
        y1: myVertices[i].y,
        x2: myVertices[next].x,
        y2: myVertices[next].y
      };
      
      for (let j = 0; j < otherVertices.length; j++) {
        const nextOther = (j + 1) % otherVertices.length;
        const line2 = {
          x1: otherVertices[j].x,
          y1: otherVertices[j].y,
          x2: otherVertices[nextOther].x,
          y2: otherVertices[nextOther].y
        };
        
        if (linesIntersect(line1, line2)) {
          return true;
        }
      }
    }
    
    return false;
  }
}

class Triangle extends Shape {
  constructor(x, y, size, rotation = 0) {
    super(x, y, rotation);
    this.size = size;
    this.attachmentPoints = [
      { x: 0, y: -this.size }, // top
      { x: -this.size * cos(PI/6), y: this.size/2 }, // bottom left
      { x: this.size * cos(PI/6), y: this.size/2 }  // bottom right
    ];
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    triangle(0, -this.size,
            -this.size * cos(PI/6), this.size/2,
            this.size * cos(PI/6), this.size/2);
    // Draw attachment points for debugging
    fill(255, 0, 0);
    this.attachmentPoints.forEach(pt => circle(pt.x, pt.y, 4));
    pop();
  }
}

class Square extends Shape {
  constructor(x, y, size, rotation = 0) {
    super(x, y, rotation);
    this.size = size;
    const halfSize = size/2;
    this.attachmentPoints = [
      { x: -halfSize, y: -halfSize },
      { x: halfSize, y: -halfSize },
      { x: halfSize, y: halfSize },
      { x: -halfSize, y: halfSize }
    ];
  }
  
  getVertices() {
    const halfSize = this.size/2;
    const vertices = [
      { x: -halfSize, y: -halfSize },
      { x: halfSize, y: -halfSize },
      { x: halfSize, y: halfSize },
      { x: -halfSize, y: halfSize }
    ];
    
    return vertices.map(v => {
      const rotatedX = v.x * cos(this.rotation) - v.y * sin(this.rotation);
      const rotatedY = v.x * sin(this.rotation) + v.y * cos(this.rotation);
      return { x: this.x + rotatedX, y: this.y + rotatedY };
    });
  }
  
  containsPoint(px, py) {
    const vertices = this.getVertices();
    return pointInPolygon({ x: px, y: py }, vertices);
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    rectMode(CENTER);
    rect(0, 0, this.size, this.size);
    fill(255, 0, 0);
    this.attachmentPoints.forEach(pt => circle(pt.x, pt.y, 4));
    pop();
  }
}

class Circle extends Shape {
  constructor(x, y, radius, rotation = 0) {
    super(x, y, rotation);
    this.radius = radius;
    this.attachmentPoints = [
      { x: 0, y: -radius },
      { x: 0, y: radius }
    ];
  }
  
  // For circles, we'll approximate with octagon for collision detection
  getVertices() {
    const vertices = [];
    const numPoints = 8;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * TWO_PI;
      vertices.push({
        x: this.x + this.radius * cos(angle),
        y: this.y + this.radius * sin(angle)
      });
    }
    return vertices;
  }
  
  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
  
  // Override collision detection for circle
  collidesWith(other) {
    if (other instanceof Circle) {
      // Circle-circle collision
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const distSq = dx * dx + dy * dy;
      const minDist = this.radius + other.radius;
      return distSq < minDist * minDist;
    } else {
      // Use default polygon collision for other shapes
      return super.collidesWith(other);
    }
  }
  
  draw() {
    circle(this.x, this.y, this.radius * 2);
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    fill(255, 0, 0);
    this.attachmentPoints.forEach(pt => circle(pt.x, pt.y, 4));
    pop();
  }
}

class DrawnShape {
  constructor() {
    this.points = [];
    this.closed = false;
  }
  
  addPoint(x, y) {
    this.points.push({ x, y });
  }
  
  draw() {
    beginShape();
    for (let point of this.points) {
      vertex(point.x, point.y);
    }
    if (this.closed) {
      endShape(CLOSE);
    } else {
      endShape();
    }
  }
  
  checkClosure(x, y) {
    if (this.points.length > 2) {
      const firstPoint = this.points[0];
      if (dist(x, y, firstPoint.x, firstPoint.y) < 20) {
        this.closed = true;
        return true;
      }
    }
    return false;
  }
  
  isPointInside(x, y) {
    let inside = false;
    for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
      const xi = this.points[i].x, yi = this.points[i].y;
      const xj = this.points[j].x, yj = this.points[j].y;
      
      const intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }
  
  getCentroid() {
    let sumX = 0, sumY = 0;
    this.points.forEach(point => {
      sumX += point.x;
      sumY += point.y;
    });
    return {
      x: sumX / this.points.length,
      y: sumY / this.points.length
    };
  }
}

let drawnShape;
let shapes = [];
let availableShapes = [];

function setup() {
  createCanvas(800, 600);
  background(220);
  
  drawnShape = new DrawnShape();
  
  // Create our pool of available shapes
  for (let i = 0; i < 2; i++) {
    availableShapes.push(new Triangle(0, 0, 30));
    availableShapes.push(new Square(0, 0, 40));
    availableShapes.push(new Circle(0, 0, 20));
  }
}

function draw() {
  background(220);
  
  // Draw the user-drawn shape
  stroke(0);
  noFill();
  drawnShape.draw();
  
  // Draw all placed shapes
  fill(200);
  stroke(0);
  for (let shape of shapes) {
    shape.draw();
  }
  
  // If shape is closed and no shapes placed yet, start packing
  if (drawnShape.closed && shapes.length === 0) {
    startPacking();
  }
}

function mousePressed() {
  if (!drawnShape.closed) {
    drawnShape.addPoint(mouseX, mouseY);
  }
}

function mouseDragged() {
  if (!drawnShape.closed) {
    drawnShape.addPoint(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (!drawnShape.closed) {
    if (drawnShape.checkClosure(mouseX, mouseY)) {
      console.log("Shape closed!");
    }
  }
}

function startPacking() {
  // Place first shape at centroid
  const centroid = drawnShape.getCentroid();
  const firstShape = availableShapes.shift();
  firstShape.x = centroid.x;
  firstShape.y = centroid.y;
  
  // Verify the shape fits
  if (shapeInBounds(firstShape)) {
    shapes.push(firstShape);
    packNextShape();
  }
}

function packNextShape() {
  if (availableShapes.length === 0) return;
  
  const nextShape = availableShapes.shift();
  let placed = false;
  
  // Try to attach to each existing shape
  for (let existingShape of shapes) {
    if (!existingShape.hasAvailableAttachmentPoint()) continue;
    
    const availablePoints = existingShape.getAvailableAttachmentIndices();
    
    for (let existingPointIdx of availablePoints) {
      for (let newPointIdx = 0; newPointIdx < nextShape.attachmentPoints.length; newPointIdx++) {
        // Try different rotations
        for (let rotation = 0; rotation < TWO_PI; rotation += PI/4) {
          nextShape.rotation = rotation;
          
          // Calculate position that would connect the attachment points
          const existingPoint = existingShape.getAttachmentPoint(existingPointIdx);
          const newPoint = nextShape.getAttachmentPoint(newPointIdx);
          
          // Move new shape so attachment points align
          nextShape.x = existingPoint.x - (newPoint.x - nextShape.x);
          nextShape.y = existingPoint.y - (newPoint.y - nextShape.y);
          
          // Check if this position works
          if (shapeInBounds(nextShape)) {
            // Place the shape and record connection
            shapes.push(nextShape);
            existingShape.connectedTo.set(existingPointIdx, {
              shape: nextShape,
              point: newPointIdx
            });
            nextShape.connectedTo.set(newPointIdx, {
              shape: existingShape,
              point: existingPointIdx
            });
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (placed) break;
    }
    if (placed) break;
  }
  
  // If successfully placed, try to pack next shape
  if (placed) {
    setTimeout(packNextShape, 100); // Add delay for visualization
  }
}



////////////////////////////////////////////////////////////////////
// Base Shape class with collision detection


// Helper functions for collision detection
function linesIntersect(line1, line2) {
  const x1 = line1.x1, y1 = line1.y1, x2 = line1.x2, y2 = line1.y2;
  const x3 = line2.x1, y3 = line2.y1, x4 = line2.x2, y4 = line2.y2;
  
  const denominator = ((x2 - x1) * (y4 - y3)) - ((y2 - y1) * (x4 - x3));
  if (denominator === 0) return false;
  
  const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
  const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;
  
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function pointInPolygon(point, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Rest of the code remains similar, but add collision check in packNextShape:
function shapeInBounds(shape) {
  // Check if all vertices are inside the drawn shape
  const vertices = shape.getVertices();
  for (let vertex of vertices) {
    if (!drawnShape.isPointInside(vertex.x, vertex.y)) {
      return false;
    }
  }
  
  // Check for collisions with other shapes
  for (let existingShape of shapes) {
    if (shape.collidesWith(existingShape)) {
      return false;
    }
  }
  
  return true;
}

// The rest of the code (DrawnShape class, setup, draw, mouse functions, etc.) 
// remains the same as in the previous version