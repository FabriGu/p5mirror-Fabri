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
let inData = ["0", "0", "0", "0"];

class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.radius = 25;
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
        graphics.background(0);
        graphics.noStroke();
        
        for (let particle of this.particles) {
            for (let i = 4; i > 0; i--) {
                let alpha = map(i, 4, 0, 30, 150);
                graphics.fill(0, 0, 255, alpha);
                graphics.circle(particle.pos.x, particle.pos.y, particle.radius * (i * 0.8));
            }
            graphics.fill(100, 100, 255, 200);
            graphics.circle(particle.pos.x, particle.pos.y, particle.radius);
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
    fluidSimulation.update(float(inData[0]));
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
    text("Tilt: " + inData[0] + "°", 10, height - 20);
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
            
            // Ensure initial RGB values are integers
            let r = Math.floor(pixelatedOutput.pixels[index]);
            let g = Math.floor(pixelatedOutput.pixels[index + 1]);
            let b = Math.floor(pixelatedOutput.pixels[index + 2]);

            // Final safety check to ensure values are valid integers between 0-255
            r = Math.max(0, Math.min(255, Math.floor(r)));
            g = Math.max(0, Math.min(255, Math.floor(g)));
            b = Math.max(0, Math.min(255, Math.floor(b)));

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
            let newData = split(inString, ",");
            if (newData.length === 4) {
                inData = newData;
            }
        } catch (error) {
            console.error("Error parsing serial data:", error);
        }
    }
}

function openPort(selectedPort) {
    try {
        serial.open();
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
    portButton.mousePressed(() => {
        serial.requestPort();
        debugText = "Requesting port...";
    });
}