let lines = [];
let squares = [];
let isVertical = true;

class Line {
  constructor(isVertical, intersectPoint = null) {
    this.isVertical = isVertical;
    let length = random(100, 300); // Random line length
    
    if (intersectPoint) {
      // Start from intersection point
      if (isVertical) {
        this.x1 = this.x2 = intersectPoint.x;
        this.y1 = intersectPoint.y - length/2;
        this.y2 = intersectPoint.y + length/2;
      } else {
        this.y1 = this.y2 = intersectPoint.y;
        this.x1 = intersectPoint.x - length/2;
        this.x2 = intersectPoint.x + length/2;
      }
    } else {
      // First line - random position
      if (isVertical) {
        this.x1 = this.x2 = random(width);
        this.y1 = height/2 - length/2;
        this.y2 = height/2 + length/2;
      } else {
        this.y1 = this.y2 = random(height);
        this.x1 = width/2 - length/2;
        this.x2 = width/2 + length/2;
      }
    }
  }
  
  draw() {
    line(this.x1, this.y1, this.x2, this.y2);
  }
  
  getIntersection(otherLine) {
    if (this.isVertical === otherLine.isVertical) return null;
    
    let vertLine = this.isVertical ? this : otherLine;
    let horzLine = this.isVertical ? otherLine : this;
    
    // Check if lines actually intersect
    if (vertLine.x1 >= Math.min(horzLine.x1, horzLine.x2) &&
        vertLine.x1 <= Math.max(horzLine.x1, horzLine.x2) &&
        horzLine.y1 >= Math.min(vertLine.y1, vertLine.y2) &&
        horzLine.y1 <= Math.max(vertLine.y1, vertLine.y2)) {
      return { x: vertLine.x1, y: horzLine.y1 };
    }
    return null;
  }
  
  checkSquare(line2, line3, line4) {
    let linesSet = [this, line2, line3, line4];
    let verticals = linesSet.filter(l => l.isVertical);
    let horizontals = linesSet.filter(l => !l.isVertical);
    
    if (verticals.length !== 2 || horizontals.length !== 2) return null;
    
    let corners = [];
    for (let v of verticals) {
      for (let h of horizontals) {
        let intersect = v.getIntersection(h);
        if (intersect) corners.push(intersect);
      }
    }
    
    if (corners.length === 4) {
      // Sort corners to ensure proper square rendering
      corners.sort((a, b) => a.x - b.x);
      let leftPoints = corners.slice(0, 2).sort((a, b) => a.y - b.y);
      let rightPoints = corners.slice(2).sort((a, b) => a.y - b.y);
      
      return [
        leftPoints[0],   // top-left
        rightPoints[0],  // top-right
        rightPoints[1],  // bottom-right
        leftPoints[1]    // bottom-left
      ];
    }
    return null;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(1);
  // Start with first line
  lines.push(new Line(isVertical));
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
  if (lines.length < 100) {
    // Find intersection point with existing perpendicular line
    let intersectPoint = null;
    let attempts = 0;
    while (!intersectPoint && attempts < 100) {
      let randomLine = random(lines);
      if (randomLine.isVertical !== isVertical) {
        let tempLine = new Line(isVertical);
        intersectPoint = tempLine.getIntersection(randomLine);
      }
      attempts++;
    }
    
    // Create new line from intersection point
    let newLine = new Line(isVertical, intersectPoint);
    lines.push(newLine);
    
    // Check for squares
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
    
    isVertical = !isVertical;
  }
}