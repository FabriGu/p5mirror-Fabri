class StoveTop {
  constructor(cubeSize) {
    this.cubeSize = cubeSize;
    this.burnerRadius = cubeSize / 6;
    this.grateSize = cubeSize / 3;
    this.burnerPositions = [
      [-cubeSize / 4, -cubeSize / 4],
      [cubeSize / 4, -cubeSize / 4],
      [-cubeSize / 4, cubeSize / 4],
      [cubeSize / 4, cubeSize / 4]
    ];
    this.noFlames = 16;
  }

  create() {
    push();

    // Draw the stove top base
    fill(200);
    box(this.cubeSize, this.cubeSize / 10, this.cubeSize);

    // Draw the burners
    for (let i = 0; i < this.burnerPositions.length; i++) {
      const [x, y] = this.burnerPositions[i];
      
      push();
      translate(x, -this.cubeSize / 20, y);
      
      // Draw the burner
      fill(50);
      cylinder(this.burnerRadius, 10);

      // Draw the grate
      stroke(100);
      for (let j = 0; j < 4; j++) {
        push();
        rotateY(HALF_PI * j);
        line(-this.grateSize / 2, 0, 0, this.grateSize / 2, 0, 0);
        pop();
      }
      line(-this.grateSize / 2, 0, -this.grateSize / 2, this.grateSize / 2, 0, -this.grateSize / 2);
      line(-this.grateSize / 2, 0, this.grateSize / 2, this.grateSize / 2, 0, this.grateSize / 2);
      line(this.grateSize / 2, 0, -this.grateSize / 2, -this.grateSize / 2, 0, -this.grateSize / 2);
      line(this.grateSize / 2, 0, this.grateSize / 2, -this.grateSize / 2, 0, this.grateSize / 2);

      pop();
    }

    // Draw flames if mouse is over the stove top
    if (mouseX > width / 2 - this.cubeSize / 2 && mouseX < width / 2 + this.cubeSize / 2 &&
        mouseY > height / 2 - this.cubeSize / 2 && mouseY < height / 2 + this.cubeSize / 2) {
      for (let i = 0; i < this.burnerPositions.length; i++) {
        const [x, y] = this.burnerPositions[i];

        push();
        // rotateX(PI/2)
        translate(x, -this.cubeSize / 20, y);
        fill(255, 100, 0);
        for (let j = 0; j < this.noFlames; j++) {
          push();
          noStroke()
          rotateY(TWO_PI * j / this.noFlames);
          translate(this.burnerRadius, 0, 0);
          let flicker = sin(frameCount * 0.1 + j) * 10;
          translate(0, flicker, 0);
          rotate(PI/10)
          cone(this.burnerRadius / 15, this.burnerRadius/2 + flicker*1.8);
          pop();
        }
        pop();
      }
    }

    pop();
  }
}

let stoveTop;

function setup() {
  createCanvas(800, 600, WEBGL);
  stoveTop = new StoveTop(300);
}

function draw() {
  background(220);
  orbitControl();
  
  stoveTop.create();
}
