// At the top with other constants
const TIME_SCALE = 2.0;  // Simulation speed multiplier

  update() {
    if (this.isLocked) return;
    
    // Update linear motion with time scaling
    this.vel.add(p5.Vector.mult(this.acc, TIME_SCALE));
    this.vel.limit(this.maxSpeed * TIME_SCALE);
    this.pos.add(p5.Vector.mult(this.vel, TIME_SCALE));
    this.vel.mult(pow(this.friction, TIME_SCALE));
    
    // Update angular motion with time scaling
    this.angularVel += this.angularAcc * TIME_SCALE;
    this.angularVel *= pow(this.angularFriction, TIME_SCALE);
    this.angle += this.angularVel * TIME_SCALE;
    
    this.acc.mult(0);
    this.angularAcc = 0;
    
    // Adjust settling detection for time scale
    if (this.vel.mag() < (0.05 * TIME_SCALE) && abs(this.angularVel) < (0.001 * TIME_SCALE)) {
      this.stationaryFrames++;
      if (this.stationaryFrames > this.stationaryThreshold / TIME_SCALE) {
        // Only lock if near other triangles
        let nearOthers = false;
        for (let other of triangles) {
          if (other !== this) {
            let dist = p5.Vector.dist(this.pos, other.pos);
            if (dist < (this.size + other.size) * 1.2) {
              nearOthers = true;
              break;
            }
          }
        }
        if (nearOthers) {
          this.isLocked = true;
        }
      }
    } else {
      this.stationaryFrames = 0;
    }
  }