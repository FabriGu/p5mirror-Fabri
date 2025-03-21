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

// Sensor data from Arduino
let inData = ["0", "0", "0"];  // accelX, accelY, accelZ

class FluidParticle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.prevPos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.color = color(0, 0, 255, 150);  // Semi-transparent blue
    }

    update(gravity) {
        this.acc.add(gravity);
        this.vel.add(this.acc);
        this.vel.mult(0.99); // Dampening
        
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
        this.pos.add(this.vel);
        this.acc.mult(0);

        // Boundary collision
        if (this.pos.x < 0) {
            this.pos.x = 0;
            this.vel.x *= -0.5;
        }
        if (this.pos.x > simWidth) {
            this.pos.x = simWidth;
            this.vel.x *= -0.5;
        }
        if (this.pos.y < 0) {
            this.pos.y = 0;
            this.vel.y *= -0.5;
        }
        if (this.pos.y > simHeight) {
            this.pos.y = simHeight;
            this.vel.y *= -0.5;
        }
    }
}

class FluidSimulation {
    constructor() {
        this.particles = [];
        this.numParticles = 2000;  // Much more particles for higher detail
        
        // Initialize particles in a water-like distribution
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push(new FluidParticle(
                random(simWidth * 0.2, simWidth * 0.8),
                random(simHeight * 0.2, simHeight * 0.8)
            ));
        }
    }

    update(accelX, accelY) {
        let gravity = createVector(
            map(accelX, -1, 1, -0.3, 0.3),
            map(accelY, -1, 1, -0.3, 0.3)
        );

        // Update all particles
        for (let particle of this.particles) {
            particle.update(gravity);
        }
    }

    draw(graphics) {
        graphics.background(0);
        graphics.noStroke();
        
        // Draw particles with blur effect
        for (let particle of this.particles) {
            graphics.fill(particle.color);
            graphics.circle(particle.pos.x, particle.pos.y, 3);
        }
    }
}

function setup() {
    createCanvas(640, 320);
    
    if (!navigator.serial) {
        alert("WebSerial is not supported. Try Chrome.");
        return;
    }
    
    serial.on("portavailable", openPort);
    serial.on("data", serialEvent);
    serial.on("close", onPortClose);
    
    makePortButton();
    
    // Create high-res simulation buffer
    fluidSimulation = new FluidSimulation();
    pixelatedOutput = createGraphics(simWidth, simHeight);
}

function draw() {
    // Update fluid simulation
    fluidSimulation.update(float(inData[0]), float(inData[1]));
    
    // Draw high-res simulation
    fluidSimulation.draw(pixelatedOutput);
    
    // Display high-res simulation scaled to canvas
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
    text("Accel: " + inData.join(", "), 10, height - 5);
}

function sendVideoData() {
    let dataToSend = '';
    pixelatedOutput.loadPixels();
    
    // Downsample the high-res simulation to LED grid resolution
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            // Calculate average color for this grid cell
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
            
            // Average the colors
            if (count > 0) {
                r = floor(r / count);
                g = floor(g / count);
                b = floor(b / count);
            }
            
            dataToSend += `${r},${g},${b},`;
        }
    }
    
    // Send to Arduino
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
            if (newData.length === 3) {
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