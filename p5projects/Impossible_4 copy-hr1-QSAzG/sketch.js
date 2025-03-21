const serial = new p5.WebSerial();
const gridWidth = 16;
const gridHeight = 8;
const numLEDs = gridWidth * gridHeight;
let lastSendTime = 0;
const sendInterval = 200;
let portButton;
let isConnected = false;
let debugText = "";
let pixelatedOutput;
let ledGrid = [];

// Simulation settings
const simWidth = 640;
const simHeight = 360;
let fluidSimulation;

// Data handling
let dataSend = [];
let currentTilt = 0;

class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.radius = 22;
        this.mass = 1;
    }

    interact(other) {
        let d = p5.Vector.dist(this.pos, other.pos);
        let minDist = this.radius + other.radius;
        
        if (d < minDist) {
            let angle = atan2(other.pos.y - this.pos.y, other.pos.x - this.pos.x);
            let targetX = this.pos.x + cos(angle) * minDist;
            let targetY = this.pos.y + sin(angle) * minDist;
            
            let ax = (targetX - other.pos.x) * 0.05;
            let ay = (targetY - other.pos.y) * 0.05;
            
            this.vel.x -= ax;
            this.vel.y -= ay;
            other.vel.x += ax;
            other.vel.y += ay;
            
            let avgVelX = (this.vel.x + other.vel.x) * 0.5;
            let avgVelY = (this.vel.y + other.vel.y) * 0.5;
            
            this.vel.x = lerp(this.vel.x, avgVelX, 0.1);
            this.vel.y = lerp(this.vel.y, avgVelY, 0.1);
            other.vel.x = lerp(other.vel.x, avgVelX, 0.1);
            other.vel.y = lerp(other.vel.y, avgVelY, 0.1);
        }
    }

    update(tilt) {
        let gravityStrength = 0.3;
        let gravityAngle = radians(tilt);
        let gravity = createVector(
            sin(gravityAngle) * gravityStrength,
            gravityStrength
        );

        this.acc.add(gravity);
        this.vel.add(this.acc);
        this.vel.mult(0.99);
        this.pos.add(this.vel);
        this.acc.mult(0);

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

        let maxSpeed = 8;
        let speed = this.vel.mag();
        if (speed > maxSpeed) {
            this.vel.mult(maxSpeed / speed);
        }
    }
}

class FluidSimulation {
    constructor() {
        this.particles = [];
        this.numParticles = 100;
        
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

    update(tilt) {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                this.particles[i].interact(this.particles[j]);
            }
            this.particles[i].update(tilt);
        }
    }

    draw(graphics) {
        // Start with white background
        graphics.background(255);
        graphics.noStroke();
        
        // Draw particles with sharp blue color
        for (let particle of this.particles) {
            // Draw main glow
            for (let i = 3; i > 0; i--) {
                let alpha = map(i, 3, 0, 200, 255);
                graphics.fill(0, 0, 255, alpha);
                graphics.circle(particle.pos.x, particle.pos.y, particle.radius * (i * 0.9));
            }
            
            // Draw solid core
            graphics.fill(0, 0, 255, 255);
            graphics.circle(particle.pos.x, particle.pos.y, particle.radius * 0.7);
        }
    }
}

function setup() {
    createCanvas(simWidth, simHeight);
    if (!navigator.serial) {
        alert("WebSerial is not supported. Try Chrome.");
        return;
    }
    
    serial.on("portavailable", openPort);
    serial.on("data", serialEvent);
    serial.on("close", onPortClose);
    
    makePortButton();
    
    fluidSimulation = new FluidSimulation();
    pixelatedOutput = createImage(gridWidth, gridHeight);
    ledGrid = new Array(numLEDs).fill([0, 0, 0]);
}

function draw() {
    background(0);
    
    // Update and draw simulation to canvas
    fluidSimulation.update(currentTilt);
    fluidSimulation.draw({ background: background, noStroke: noStroke, fill: fill, circle: circle });
    
    if (isConnected && millis() - lastSendTime > sendInterval) {
        sendVideoData();
        lastSendTime = millis();
    }
    
    fill(255);
    rect(0, height - 60, width, 60);
    fill(0);
    textSize(16);
    text(debugText, 10, height - 40);
    text("Tilt: " + nf(currentTilt, 0, 2) + "°", 10, height - 20);
}

function sendVideoData() {
    let dataToSend = '';
    loadPixels();
    pixelatedOutput.copy(this, 0, 0, width, height, 0, 0, gridWidth, gridHeight);
    pixelatedOutput.loadPixels();

    // Process pixels using same logic as camera code
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            let index = (y * gridWidth + x) * 4;
            
            // Get initial RGB values
            let r = pixelatedOutput.pixels[index];
            let g = pixelatedOutput.pixels[index + 1];
            let b = pixelatedOutput.pixels[index + 2];
            let a = pixelatedOutput.pixels[index + 3];

            // Calculate brightness
            let brightness = (r + g + b) / 3;

            // If pixel is mostly blue
            if (b > (r + g) * 0.7) {
                // Output blue
                r = 0;
                g = 0;
                b = 255;
            } else if (brightness > 200) {
                // If bright enough, make it pure white
                r = 255;
                g = 255;
                b = 255;
            } else {
                // Otherwise black
                r = 0;
                g = 0;
                b = 0;
            }

            // Ensure values are integers
            r = Math.floor(r);
            g = Math.floor(g);
            b = Math.floor(b);

            dataToSend += `${r},${g},${b},`;
        }
    }

    if (dataToSend.length > 0) {
        dataToSend = dataToSend.slice(0, -1) + 'E';
        serial.write(dataToSend);
    }
}

function serialEvent() {
    let inString = serial.readStringUntil("\r\n");
    if (inString && inString.trim()) {
        try {
            let data = split(inString, ",");
            if (data[0] === "R" && data.length >= 2) {
                // Extract tilt value from Arduino data
                currentTilt = float(data[1]);
                debugText = "Received tilt: " + currentTilt;
            }
        } catch (error) {
            console.error("Error parsing serial data:", error);
        }
    }
}

function openPort(selectedPort) {
    try {
        serial.open({ baudRate: 115200 });
        isConnected = true;
        portButton.hide();
        debugText = "Port opened successfully";
    } catch (error) {
        console.error("Error opening port:", error);
        debugText = "Error opening port";
        isConnected = false;
    }
}

function onPortClose() {
    isConnected = false;
    debugText = "Port closed";
    makePortButton();
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