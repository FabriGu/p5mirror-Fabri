let snakes = [];
const MIN_THICKNESS = 10;
const INITIAL_THICKNESS = 20;
const INITIAL_LENGTH = 500;
const SPEED = 100;
const DIRECTION_CHANGE_INTERVAL = 1000;
const SPLIT_DELAY = 1000;
const BOUNDARY_MARGIN = 30;

const DIRECTIONS = [
  { x: 1, y: 0 }, { x: 0, y: 1 }, 
  { x: -1, y: 0 }, { x: 0, y: -1 }
];

class Snake {
  constructor(x, y, dirIndex, length, thickness) {
    this.points = [{x, y}];
    this.dirIndex = dirIndex;
    this.thickness = thickness;
    this.length = length;
    this.markedForSplit = null;
    this.intersectionPoints = [];
    this.lastDirectionChange = millis();
  }

  move() {
    if (millis() - this.lastDirectionChange > DIRECTION_CHANGE_INTERVAL) {
      this.dirIndex = (this.dirIndex + (Math.random() < 0.5 ? 1 : -1)) & 3;
      this.lastDirectionChange = millis();
    }

    let newX = this.points[0].x + DIRECTIONS[this.dirIndex].x * SPEED;
    let newY = this.points[0].y + DIRECTIONS[this.dirIndex].y * SPEED;

    // Boundary check with margin
    newX = constrain(newX, BOUNDARY_MARGIN, width - BOUNDARY_MARGIN);
    newY = constrain(newY, BOUNDARY_MARGIN, height - BOUNDARY_MARGIN);

    // Change direction if hitting boundary
    if (newX <= BOUNDARY_MARGIN || newX >= width - BOUNDARY_MARGIN) {
      this.dirIndex = this.dirIndex === 0 ? 2 : 0;
    }
    if (newY <= BOUNDARY_MARGIN || newY >= height - BOUNDARY_MARGIN) {
      this.dirIndex = this.dirIndex === 1 ? 3 : 1;
    }

    this.points.unshift({x: newX, y: newY});
    if (this.points.length > this.length) {
      this.points.pop();
    }
  }

  checkIntersection(otherSnake) {
    if (this.thickness <= MIN_THICKNESS) return null;
    
    for (let i = 1; i < this.points.length; i++) {
      const p1 = this.points[i-1];
      const p2 = this.points[i];
      
      for (let j = 1; j < otherSnake.points.length; j++) {
        const p3 = otherSnake.points[j-1];
        const p4 = otherSnake.points[j];
        
        const intersection = getIntersection(p1, p2, p3, p4);
        if (intersection && 
            (this !== otherSnake || j < i - 10)) {
          return intersection;
        }
      }
    }
    return null;
  }

  draw() {
    strokeWeight(this.thickness);
    stroke(0);
    noFill();
    beginShape();
    for (const p of this.points) {
      vertex(p.x, p.y);
    }
    endShape();
    
    strokeWeight(1);
    stroke(255, 0, 0);
    for (const point of this.intersectionPoints) {
      push();
      translate(point.x, point.y);
      line(-5, -5, 5, 5);
      line(-5, 5, 5, -5);
      pop();
    }
  }
}

function getIntersection(p1, p2, p3, p4) {
  const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denominator === 0) return null;
  
  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
  
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
  
  return {
    x: p1.x + ua * (p2.x - p1.x),
    y: p1.y + ua * (p2.y - p1.y)
  };
}

function splitSnake(snake, intersection) {
  const newThickness = snake.thickness * 0.8;
  if (newThickness < MIN_THICKNESS) return;
  
  let splitIndex = 0;
  let minDist = Infinity;
  
  for (let i = 0; i < snake.points.length; i++) {
    const dist = Math.hypot(
      snake.points[i].x - intersection.x,
      snake.points[i].y - intersection.y
    );
    if (dist < minDist) {
      minDist = dist;
      splitIndex = i;
    }
  }
  
  const snake1Points = snake.points.slice(0, splitIndex);
  const snake2Points = snake.points.slice(splitIndex);
  
  const snake1 = new Snake(
    snake1Points[0].x,
    snake1Points[0].y,
    snake.dirIndex,
    snake1Points.length,
    newThickness
  );
  snake1.points = snake1Points;
  
  const snake2 = new Snake(
    snake2Points[0].x,
    snake2Points[0].y,
    (snake.dirIndex + 2) & 3,
    snake2Points.length,
    newThickness
  );
  snake2.points = snake2Points;
  
  snakes = snakes.filter(s => s !== snake);
  snakes.push(snake1, snake2);
}

function setup() {
  createCanvas(800, 600);
  background(255);
  
  snakes.push(new Snake(
    width/2,
    height/2,
    floor(random(4)),
    INITIAL_LENGTH,
    INITIAL_THICKNESS
  ));
}

function draw() {
  background(255);
  
  // Draw boundary
  noFill();
  strokeWeight(1);
  stroke(200);
  rect(BOUNDARY_MARGIN, BOUNDARY_MARGIN, 
       width - 2 * BOUNDARY_MARGIN, 
       height - 2 * BOUNDARY_MARGIN);
  
  for (const snake of snakes) {
    snake.move();
    
    for (const otherSnake of snakes) {
      const intersection = snake.checkIntersection(otherSnake);
      if (intersection) {
        snake.intersectionPoints.push(intersection);
        if (!snake.markedForSplit) {
          snake.markedForSplit = {
            time: millis(),
            point: intersection
          };
        }
      }
    }
    
    if (snake.markedForSplit && 
        millis() - snake.markedForSplit.time > SPLIT_DELAY) {
      splitSnake(snake, snake.markedForSplit.point);
    }
    
    snake.draw();
  }
}