let N = 128;
let iter = 16;
let SCALE = 4;
let t = 0;

// function to use 1D array and fake the extra two dimensions --> 3D
function IX(x, y) {
  return x + y * N;
}

// Fluid cube class
class Fluid {
    constructor(dt, diffusion, viscosity) {
    this.size = N;
    this.dt = dt;
    this.diff = diffusion;
    this.visc = viscosity;
    this.s = new Array(N * N).fill(0);
    this.density = new Array(N * N).fill(0);
    this.Vx = new Array(N * N).fill(0);
    this.Vy = new Array(N * N).fill(0);
    this.Vx0 = new Array(N * N).fill(0);
    this.Vy0 = new Array(N * N).fill(0);
    // Add surface tension simulation
    this.surfaceTension = new Array(N * N).fill(0);
  }

  step() {
    let N = this.size;
    let visc = this.visc;
    let diff = this.diff;
    let dt = this.dt;
    let Vx = this.Vx;
    let Vy = this.Vy;
    let Vx0 = this.Vx0;
    let Vy0 = this.Vy0;
    let s = this.s;
    let density = this.density;

    // Increased iterations for more stable, viscous behavior
    for (let i = 0; i < 4; i++) {
      diffuse(1, Vx0, Vx, visc, dt);
      diffuse(2, Vy0, Vy, visc, dt);
    }
    
    project(Vx0, Vy0, Vx, Vy);
    
    // Slower advection for more viscous movement
    advect(1, Vx, Vx0, Vx0, Vy0, dt * 0.5);
    advect(2, Vy, Vy0, Vx0, Vy0, dt * 0.5);
    
    project(Vx, Vy, Vx0, Vy0);
    
    // Add surface tension effect
    this.applySurfaceTension();
    
    diffuse(0, s, density, diff, dt);
    advect(0, density, s, Vx, Vy, dt);
  }

  applySurfaceTension() {
    // Simple surface tension simulation
    for (let i = 1; i < N - 1; i++) {
      for (let j = 1; j < N - 1; j++) {
        let idx = IX(i, j);
        let force = 0;
        
        // Check neighboring cells
        force += this.density[IX(i-1, j)] - this.density[idx];
        force += this.density[IX(i+1, j)] - this.density[idx];
        force += this.density[IX(i, j-1)] - this.density[idx];
        force += this.density[IX(i, j+1)] - this.density[idx];
        
        // Apply surface tension force
        this.surfaceTension[idx] = force * 0.1;
        this.Vy[idx] += this.surfaceTension[idx];
      }
    }
  }
  // method to add density
  addDensity(x, y, amount) {
    let index = IX(x, y);
    this.density[index] += amount;
  }

  // method to add velocity
  addVelocity(x, y, amountX, amountY) {
    let index = IX(x, y);
    this.Vx[index] += amountX;
    this.Vy[index] += amountY;
  }

  // function to render density
  renderD() {
    colorMode(HSB, 255);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        let x = i * SCALE;
        let y = j * SCALE;
        let d = this.density[IX(i, j)];
        fill((d + 50) % 255,200,d);
        noStroke();
        square(x, y, SCALE);
      }
    }
  }

  // function to render velocity
  renderV() {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        let x = i * SCALE;
        let y = j * SCALE;
        let vx = this.Vx[IX(i, j)];
        let vy = this.Vy[IX(i, j)];
       // stroke(0);
        stroke(255);

        if (!(abs(vx) < 0.1 && abs(vy) <= 0.1)) {
          line(x, y, x + vx * SCALE, y + vy * SCALE);
        }
      }
    }
  }
  fadeD() {
    for (let i = 0; i < this.density.length; i++) {
      //let d = density[i];
      this.density = constrain(this.density-0.02, 0, 255);
    }
  }
  
}