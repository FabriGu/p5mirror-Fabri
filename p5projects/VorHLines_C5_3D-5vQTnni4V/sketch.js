let lines = [];
let squares = [];
let isVertical = true;
let baseHueRan;
let growingSquares = [];

class GrowingSquare {
  constructor(corners, color) {
    this.corners = corners;
    this.color = color;
    this.height = 0;
    this.targetHeight = random(30,80);
    this.growing = true;
  }

  update() {
    if (this.growing && this.height < this.targetHeight) {
      this.height += 5;
    }
    if (this.height >= this.targetHeight) {
      this.growing = false;
    }
  }

  draw() {
    push();
    translate((this.corners[0].x + this.corners[2].x) / 2, 
              (this.corners[0].y + this.corners[2].y) / 2, this.height/2);
    
    let width = dist(this.corners[0].x, this.corners[0].y, 
                    this.corners[1].x, this.corners[1].y);
    let height = dist(this.corners[0].x, this.corners[0].y, 
                     this.corners[3].x, this.corners[3].y);
    
    fill(this.color);
    noStroke();
    box(width, height, this.height);
    pop();
  }
}

class Line {
  constructor(isVertical, intersectPoint = null, forceRandom = false) {
    this.isVertical = isVertical;
    let length = random(250, 400);
    
    if (!forceRandom && intersectPoint) {
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
      if (isVertical) {
        this.x1 = this.x2 = random(width * 0.1, width * 0.9);
        this.y1 = random(height * 0.1, height * 0.9);
        this.y2 = this.y1 + length;
      } else {
        this.y1 = this.y2 = random(height * 0.1, height * 0.9);
        this.x1 = random(width * 0.1, width * 0.9);
        this.x2 = this.x1 + length;
      }
    }
  }
  
  draw() {
    // if (frameCount % 10 == 0) {
      push();
      translate(0, 0, 1);  // Slightly above the plane
      stroke(0);
      line(this.x1, this.y1, this.x2, this.y2);
      pop();
    // }
    
  }
  
  
  getIntersection(otherLine) {
    if (this.isVertical === otherLine.isVertical) return null;
    
    let vertLine = this.isVertical ? this : otherLine;
    let horzLine = this.isVertical ? otherLine : this;
    
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
      corners.sort((a, b) => a.x - b.x);
      let leftPoints = corners.slice(0, 2).sort((a, b) => a.y - b.y);
      let rightPoints = corners.slice(2).sort((a, b) => a.y - b.y);
      
      return [
        leftPoints[0],
        rightPoints[0],
        rightPoints[1],
        leftPoints[1]
      ];
    }
    return null;
  }
}

function isPointInSquare(point, square) {
  let corners = square.corners;
  let x = point.x;
  let y = point.y;
  
  let minX = Math.min(...corners.map(c => c.x));
  let maxX = Math.max(...corners.map(c => c.x));
  let minY = Math.min(...corners.map(c => c.y));
  let maxY = Math.max(...corners.map(c => c.y));
  
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

function isNewSquareLocation(corners, existingSquares) {
  let centerX = (corners[0].x + corners[2].x) / 2;
  let centerY = (corners[0].y + corners[2].y) / 2;
  let centerPoint = { x: centerX, y: centerY };
  
  // First check if it overlaps with any existing squares
  if (existingSquares.some(square => isPointInSquare(centerPoint, square))) {
    return false;
  }
  
  // Then check distance from other square centers
  for (let square of existingSquares) {
    let squareCenterX = (square.corners[0].x + square.corners[2].x) / 2;
    let squareCenterY = (square.corners[0].y + square.corners[2].y) / 2;
    let distance = dist(centerX, centerY, squareCenterX, squareCenterY);
    
    // If too close to another square, return false
    if (distance < 40) return false;
  }
  
  return true;

  
  // ... [Keep existing getIntersection and checkSquare methods] ...
}

function setup() {
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createCanvas(1080,1080,WEBGL);
  frameRate(20);
  lines.push(new Line(isVertical, null, true));
  colorMode(HSB, 360, 100, 100);
  baseHueRan = random(0, 360);
  
  // Setup lighting
  directionalLight(255, 255, 255, 0, 1, -1);
  ambientLight(100);
}

function draw() {
  background(255);
  orbitControl();  // Enables 3D navigation
  
  // Set camera position
  translate(-width/2, -height/2, 50);  // Center the scene
  
  // Draw plane
  // push();
  // noStroke();
  // fill(240);
  // translate(width/2, height/2, -1);
  // rotateX(PI/2);
  // // plane(width, height);
  // pop();
  
  // Draw lines
  for (let ln of lines) {
    ln.draw();
  }
  
  // Update and draw growing squares
  for (let square of growingSquares) {
    square.update();
    square.draw();
  }
  
  if (frameCount % 10 == 0) {
  // Add new line and check for squares
    if (lines.length < 100) {
      let forceRandom = random(1) < 0.01;
      console.log(forceRandom)
      let intersectPoint = null;

       if (!forceRandom && intersectPoint) {
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
        // More spread out random positioning
        if (isVertical) {
          this.x1 = this.x2 = random(width * 0.1, width * 0.9);
          this.y1 = random(height * 0.1, height * 0.9); // Full height range
          this.y2 = this.y1 + length;
        } else {
          this.y1 = this.y2 = random(height * 0.1, height * 0.9);
          this.x1 = random(width * 0.1, width * 0.9); // Full width range
          this.x2 = this.x1 + length;
        }
      }

      let newLine = new Line(isVertical, intersectPoint, forceRandom);
      lines.push(newLine);

      // Check for squares
      for (let i = 0; i < lines.length - 3; i++) {
        for (let j = i + 1; j < lines.length - 2; j++) {
          for (let k = j + 1; k < lines.length - 1; k++) {
            let corners = newLine.checkSquare(lines[i], lines[j], lines[k]);
            if (corners && isNewSquareLocation(corners, squares)) {
              let squareColor = color(
             
                random(baseHueRan - 50, baseHueRan + 50), // Hue varies slightly around base
                random(50, 70),  // Saturation
                random(70, 90),  // Brightness
                0.7  // Alpha
              
                // ----
//                 random(1) < 0.33 ? 
//                   random(baseHueRan - 30, baseHueRan + 30) :
//                   random(1) < 0.5 ?
//                     random(baseHueRan + 90, baseHueRan + 150) :
//                     random(baseHueRan + 110, baseHueRan + 170),
//                 random(50, 70),
//                 random(70, 90),
//                 0.7
              );
              
              squares.push({ corners: corners, color: squareColor });
              growingSquares.push(new GrowingSquare(corners, squareColor));
            }
          }
        }
      }

      isVertical = !isVertical;
    }
  } // for delaying
}