const serial = new p5.WebSerial();
let isConnected = false;
let portButton;
let debugText = "";

// Grid settings for LED display
const gridWidth = 16;
const gridHeight = 8;
const numLEDs = gridWidth * gridHeight;

// High resolution simulation settings
const simWidth = 160;  // 10x LED resolution
const simHeight = 80;
let fluidSimulation;
let pixelatedOutput;

// Timing
let lastSendTime = 0;
const sendInterval = 200;

// Sensor data from Arduino (rotX for tilt)
let currentTilt = 0;

class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.radius = 4;  // Increased particle size
        this.mass = 1;
    }

    interact(other) {
        let d = p5.Vector.dist(this.pos, other.pos);
        let minDist = this.radius + other.radius;
        
        if (d < minDist) {
            // Calculate collision response
            let angle = atan2(other.pos.y - this.pos.y, other.pos.x - this.pos.x);
            let targetX = this.pos.x + cos(angle) * minDist;
            let targetY = this.pos.y + sin(angle) * minDist;
            
            let ax = (targetX - other.pos.x) * 0.05;
            let ay = (targetY - other.pos.y) * 0.05;
            
            this.vel.x -= ax;
            this.vel.y -= ay;
            other.vel.x += ax;
            other.vel.y += ay;
            
            // Add a bit of velocity averaging for fluid-like behavior
            let avgVelX = (this.vel.x + other.vel.x) * 0.5;
            let avgVelY = (this.vel.y + other.vel.y) * 0.5;
            
            this.vel.x = lerp(this.vel.x, avgVelX, 0.1);
            this.vel.y = lerp(this.vel.y, avgVelY, 0.1);
            other.vel.x = lerp(other.vel.x, avgVelX, 0.1);
            other.vel.y = lerp(other.vel.y, avgVelY, 0.1);
        }
    }

    update(gravity) {
        // Apply forces
        this.acc.add(gravity);
        this.vel.add(this.acc);
        this.vel.mult(0.99); // Dampening
        this.pos.add(this.vel);
        this.acc.mult(0);

        // Boundary collision
        let bounce = -0.6;
        let margin = this.radius;

        if (this.pos.x < margin) {
            this.pos.x = margin;
            this.vel.x *= bounce;
        }
        if (this.pos.x > simWidth - margin) {
            this.pos.x = simWidth - margin;
            this.vel.x *= bounce;
        }
        if (this.pos.y < margin) {
            this.pos.y = margin;
            this.vel.y *= bounce;
        }
        if (this.pos.y > simHeight - margin) {
            this.pos.y = simHeight - margin;
            this.vel.y *= bounce;
        }

        // Speed limit
        let maxSpeed = 4;
        let speed = this.vel.mag();
        if (speed > maxSpeed) {
            this.vel.mult(maxSpeed / speed);
        }
    }
}

class FluidSimulation {
    constructor() {
        this.particles = [];
        this.numParticles = 200;  // Reduced number of particles since they're bigger
        this.currentRotation = 0;
        
        // Initialize particles in a grid pattern
        let cols = ceil(sqrt(this.numParticles));
        let rows = ceil(this.numParticles / cols);
        let spacingX = simWidth * 0.6 / cols;
        let spacingY = simHeight * 0.6 / rows;
        
        for (let i = 0; i < this.numParticles; i++) {
            let col = i % cols;
            let row = floor(i / cols);
            let x = simWidth * 0.2 + col * spacingX + random(-1, 1);
            let y = simHeight * 0.2 + row * spacingY + random(-1, 1);
            this.particles.push(new Particle(x, y));
        }
    }

    update() {
        // Calculate gravity based on tilt
        let gravityStrength = 0.15;  // Reduced gravity strength
        let gravityAngle = radians(currentTilt);
        let gravity = createVector(
            sin(gravityAngle) * gravityStrength,
            gravityStrength  // Constant downward force
        );

        // Update particles and handle collisions
        for (let i = 0; i < this.particles.length; i++) {
            let particle = this.particles[i];
            
            // Check collisions with nearby particles
            for (let j = i + 1; j < this.particles.length; j++) {
                particle.interact(this.particles[j]);
            }
            
            particle.update(gravity);
        }
    }

    draw(graphics) {
        graphics.background(0);
        
        // Draw particles
        graphics.noStroke();
        for (let particle of this.particles) {
            // Draw glow effect
            for (let i = 3; i > 0; i--) {
                let alpha = map(i, 3, 0, 50, 150);
                graphics.fill(0, 0, 255, alpha);
                graphics.circle(particle.pos.x, particle.pos.y, particle.radius * (i * 0.7));
            }
            
            // Draw core
            graphics.fill(100, 100, 255, 200);
            graphics.circle(particle.pos.x, particle.pos.y, particle.radius);
        }
    }
}

function setup() {
    createCanvas(640, 320);
    
    if (!navigator.serial) {
        alert("WebSerial is not supported. Try Chrome.");
        return;
    }
    
    // Serial event handlers
    serial.on('connect', () => {
        console.log('Serial port connected');
        isConnected = true;
        portButton.hide();
        debugText = "Port opened successfully";
    });
    
    serial.on('disconnect', () => {
        console.log('Serial port disconnected');
        isConnected = false;
        debugText = "Port closed";
        makePortButton();
    });
    
    serial.on('data', serialEvent);
    
    makePortButton();
    
    fluidSimulation = new FluidSimulation();
    pixelatedOutput = createGraphics(simWidth, simHeight);
}

function draw() {
    // Update simulation
    fluidSimulation.update();
    
    // Draw to high-res buffer
    fluidSimulation.draw(pixelatedOutput);
    
    // Display scaled simulation
    image(pixelatedOutput, 0, 0, width, height);
    
    if (isConnected && millis() - lastSendTime > sendInterval) {
        sendVideoData();
        lastSendTime = millis();
    }
    
    // Debug display
    fill(255);
    noStroke();
    rect(0, height - 40, width, 40);
    fill(0);
    text(debugText, 10, height - 20);
    text("Tilt: " + nf(currentTilt, 0, 2) + "°", 10, height - 5);
}

function serialEvent() {
    let inString = serial.readStringUntil('\n');
    if (inString && inString.trim()) {
        try {
            let data = split(inString, ",");
            if (data[0] === "R" && data.length >= 2) {
                // Just use the X rotation for tilt
                currentTilt = float(data[1]);
                debugText = "Received tilt: " + currentTilt;
            }
        } catch (error) {
            console.error("Error parsing serial data:", error);
        }
    }
}

function sendVideoData() {
    let dataToSend = '';
    pixelatedOutput.loadPixels();
    
    // Downsample to LED grid
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            let r = 0, g = 0, b = 0, count = 0;
            let startX = floor(map(x, 0, gridWidth, 0, simWidth));
            let endX = floor(map(x + 1, 0, gridWidth, 0, simWidth));
            let startY = floor(map(y, 0, gridHeight, 0, simHeight));
            let endY = floor(map(y + 1, 0, gridHeight, 0, simHeight));
            
            for (let py = startY; py < endY; py++) {
                for (let px = startX; px < endX; px++) {
                    let idx = (py * simWidth + px) * 4;
                    r += pixelatedOutput.pixels[idx];
                    g += pixelatedOutput.pixels[idx + 1];
                    b += pixelatedOutput.pixels[idx + 2];
                    count++;
                }
            }
            
            if (count > 0) {
                r = floor(r / count);
                g = floor(g / count);
                b = floor(b / count);
            }
            
            dataToSend += `${r},${g},${b},`;
        }
    }
    
    if (dataToSend.length > 0) {
        dataToSend = dataToSend.slice(0, -1) + 'E';
        serial.write(dataToSend);
    }
}

function makePortButton() {
    portButton = createButton('Choose Serial Port');
    portButton.position(10, 10);
    portButton.mousePressed(async () => {
        try {
            await serial.requestPort();
            await serial.open({ baudRate: 115200 });
            debugText = "Requesting port...";
        } catch (err) {
            console.error(err);
            debugText = "Error opening port: " + err.message;
        }
    });
}