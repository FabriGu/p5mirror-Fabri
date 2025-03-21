let lines = [];
let squares = [];
let isVertical = true;  // Alternates between vertical and horizontal

class Line {
  constructor(isVertical) {
    // Random position within canvas
    if (isVertical) {
      this.x1 = random(width);
      this.x2 = this.x1;
      this.y1 = 0;
      this.y2 = height;
    } else {
      this.x1 = 0;
      this.x2 = width;
      this.y1 = random(height);
      this.y2 = this.y1;
    }
    this.isVertical = isVertical;
  }
  
  draw() {
    line(this.x1, this.y1, this.x2, this.y2);
  }
  
  // Return intersection point if this line intersects with another
  getIntersection(otherLine) {
    if (this.isVertical === otherLine.isVertical) return null;
    
    if (this.isVertical) {
      return { x: this.x1, y: otherLine.y1 };
    } else {
      return { x: otherLine.x1, y: this.y1 };
    }
  }
  
  // Check if this and three other lines form a square
  checkSquare(line2, line3, line4) {
    let linesSet = [this, line2, line3, line4];
    let verticals = linesSet.filter(l => l.isVertical);
    let horizontals = linesSet.filter(l => !l.isVertical);
    
    // Need exactly 2 vertical and 2 horizontal lines
    if (verticals.length !== 2 || horizontals.length !== 2) return null;
    
    let corners = [];
    
    // Get all intersection points
    for (let v of verticals) {
      for (let h of horizontals) {
        corners.push(v.getIntersection(h));
      }
    }
    
    if (corners.length === 4) {
      return corners;
    }
    return null;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(1);  // Slow it down to see what's happening
}

function draw() {
  background(220);
  
  // Draw existing squares
  noStroke();
  for (let square of squares) {
    fill(square.color);
    beginShape();
    for (let corner of square.corners) {
      vertex(corner.x, corner.y);
    }
    endShape(CLOSE);
  }
  
  // Draw all lines
  stroke(0);
  for (let ln of lines) {
    ln.draw();
  }
  
  // Add new line
  if (lines.length < 10) {
    let newLine = new Line(isVertical);
    lines.push(newLine);
    
    // Check for squares with all possible combinations of 4 lines
    for (let i = 0; i < lines.length - 3; i++) {
      for (let j = i + 1; j < lines.length - 2; j++) {
        for (let k = j + 1; k < lines.length - 1; k++) {
          let corners = newLine.checkSquare(lines[i], lines[j], lines[k]);
          if (corners) {
            squares.push({
              corners: corners,
              color: color(random(255), random(255), random(255), 127)
            });
          }
        }
      }
    }
    
    isVertical = !isVertical;  // Toggle for next line
  }
}