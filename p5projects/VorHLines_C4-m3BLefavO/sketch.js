let lines = [];
let squares = [];
let isVertical = true;
let baseHueRan;

class Line {
  constructor(isVertical, intersectPoint = null, forceRandom = false) {
    this.isVertical = isVertical;
    let length = random(150, 300); // Reduced max length
    
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
  }
  
  draw() {
    line(this.x1, this.y1, this.x2, this.y2);
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
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(3);
  lines.push(new Line(isVertical, null, true));
  colorMode(HSB, 360, 100, 100); // Change to HSB color mode
  baseHueRan = random(0,360);
  console.log(baseHueRan);
}

function draw() {
  background(255);
  
  
  // Draw all lines
  stroke(0);
  for (let ln of lines) {
    ln.draw();
  }
  
  
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
  
  // Add new line
  if (lines.length < 100) {
    let forceRandom = random(1) < 0.1;
    let intersectPoint = null;
    
    if (!forceRandom) {
      let attempts = 0;
      let foundValidIntersection = false;
      
      while (!foundValidIntersection && attempts < 50) {
        let randomLine = random(lines);
        if (randomLine.isVertical !== isVertical) {
          let tempLine = new Line(isVertical);
          let potentialIntersect = tempLine.getIntersection(randomLine);
          
          if (potentialIntersect) {
            // Check if this intersection is far enough from existing squares
            let tooClose = false;
            for (let square of squares) {
              let squareCenter = {
                x: (square.corners[0].x + square.corners[2].x) / 2,
                y: (square.corners[0].y + square.corners[2].y) / 2
              };
              if (dist(potentialIntersect.x, potentialIntersect.y, squareCenter.x, squareCenter.y) < 80) {
                tooClose = true;
                break;
              }
            }
            if (!tooClose) {
              intersectPoint = potentialIntersect;
              foundValidIntersection = true;
            }
          }
        }
        attempts++;
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
            let baseHue = baseHueRan;// 200 base cool
            squares.push({
              corners: corners,
//               -------------------
              // color: color(random(255), random(255), random(255), 200)
//               -------------------
              // Then in the draw function, where we create new squares, replace the color creation with:
//               // Option 1 - Similar hues, varying saturation and brightness:
//               let baseHue = 200;  // Pick a base hue (0-360): blue = 200, green = 120, etc.
//               color: color(
//                 random(baseHue - 30, baseHue + 30), // Hue varies slightly around base
//                 random(50, 70),  // Saturation
//                 random(70, 90),  // Brightness
//                 0.7  // Alpha
//               )

//               // OR Option 2 - Complementary colors:
//               let baseHue = 200;
              // color: color(
              //   random(1) < 0.5 ? 
              //     random(baseHue - 30, baseHue + 30) : // Either base hue
              //     random(baseHue + 150, baseHue + 210), // Or complementary hue
              //   random(50, 70),
              //   random(70, 90),
              //   0.7
              // )
              
//               TRIADIC
                     
            // color: color(
            //   random(baseHue - 30, baseHue + 30), // Hue varies slightly around base
            //   random(50, 70),  // Saturation
            //   random(70, 90),  // Brightness
            //   0.7  // Alpha
            // )
              color: color(
                random(1) < 0.33 ? 
                  random(baseHue - 30, baseHue + 30) : // First color range
                  random(1) < 0.5 ?
                    random(baseHue + 90, baseHue + 150) : // Second color (120° away)
                    random(baseHue + 110, baseHue + 170), // Third color (240° away) // was 210, 270
                random(50, 70),
                random(70, 90),
                0.7
              )

              // OR Option 3 - Analogous colors (three adjacent colors on the wheel):
              
              // color: color(
              //   baseHue + random([-30, 0, 30]), // Randomly pick from 3 adjacent hues
              //   random(50, 70),
              //   random(70, 90),
              //   0.7
              // )
//               -------------------
            });
          }
        }
      }
    }
    
    isVertical = !isVertical;
  }
}