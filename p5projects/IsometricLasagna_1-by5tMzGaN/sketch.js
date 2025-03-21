let layers = [];
const LAYER_COUNT = 8;
const SQRT3 = Math.sqrt(3);

class LasagnaLayer {
    constructor(z, type, state = 'active') {
        this.z = z;
        this.type = type;
        this.width = 200;  // Increased size
        this.height = 200;
        this.depth = 25;
        this.offset = 0;
        this.state = state;
        
        // Animation properties
        this.entryProgress = (state === 'entering') ? 0 : 1;
        this.exitProgress = (state === 'exiting') ? 0 : 1;
        this.xOffset = (state === 'entering') ? -400 : 0;
    }

    isoProject(x, y, z) {
        return {
            x: (SQRT3 * x - SQRT3 * z) / 2,
            y: (x + 2 * y + z) / 2
        };
    }

    drawShape(points) {
        beginShape();
        for (let p of points) {
            let iso = this.isoProject(
                p.x + this.xOffset, 
                p.y, 
                p.z + this.z + this.offset
            );
            vertex(iso.x, iso.y);
        }
        endShape(CLOSE);
    }

    draw() {
        noStroke();
        
        // Set colors based on layer type
        let mainColor, sideColor;
        switch(this.type) {
            case 'pasta':
                mainColor = color(255, 223, 148);
                sideColor = color(220, 190, 125);
                break;
            case 'meat':
                mainColor = color(165, 42, 42);
                sideColor = color(139, 35, 35);
                break;
            case 'cheese':
                mainColor = color(255, 255, 190);
                sideColor = color(255, 255, 160);
                break;
            case 'sauce':
                mainColor = color(178, 34, 34);
                sideColor = color(139, 26, 26);
                break;
        }

        // Apply opacity for entering/exiting animations
        let opacity = 255;
        if (this.state === 'entering') {
            opacity = map(this.entryProgress, 0, 1, 100, 255);
        } else if (this.state === 'exiting') {
            opacity = map(this.exitProgress, 0, 1, 255, 100);
        }
        
        mainColor.setAlpha(opacity);
        sideColor.setAlpha(opacity);

        // Top face
        fill(mainColor);
        this.drawShape([
            {x: -this.width/2, y: 0, z: 0},
            {x: this.width/2, y: 0, z: 0},
            {x: this.width/2, y: this.height, z: 0},
            {x: -this.width/2, y: this.height, z: 0}
        ]);

        // Right face
        fill(sideColor.levels[0] * 0.9, sideColor.levels[1] * 0.9, sideColor.levels[2] * 0.9, opacity);
        this.drawShape([
            {x: this.width/2, y: 0, z: 0},
            {x: this.width/2, y: 0, z: -this.depth},
            {x: this.width/2, y: this.height, z: -this.depth},
            {x: this.width/2, y: this.height, z: 0}
        ]);

        // Left face
        fill(sideColor.levels[0] * 0.8, sideColor.levels[1] * 0.8, sideColor.levels[2] * 0.8, opacity);
        this.drawShape([
            {x: -this.width/2, y: this.height, z: 0},
            {x: -this.width/2, y: this.height, z: -this.depth},
            {x: -this.width/2, y: 0, z: -this.depth},
            {x: -this.width/2, y: 0, z: 0}
        ]);

        // Add texture details
        if (this.type === 'cheese') {
            this.drawTextureDetails(mainColor, 20, 5);
        } else if (this.type === 'meat') {
            this.drawTextureDetails(sideColor, 30, 6);
        } else if (this.type === 'sauce') {
            this.drawTextureDetails(color(200, 34, 34, opacity), 25, 5);
        }
    }

    drawTextureDetails(baseColor, count, size) {
        fill(red(baseColor) + 20, green(baseColor) + 20, blue(baseColor) + 20, baseColor.levels[3]);
        for (let i = 0; i < count; i++) {
            let x = random(-this.width/2 + 10, this.width/2 - 10);
            let y = random(10, this.height - 10);
            let iso = this.isoProject(x + this.xOffset, y, this.z + this.offset);
            circle(iso.x, iso.y, size);
        }
    }

    update() {
        // Handle entry animation
        if (this.state === 'entering') {
            this.entryProgress = min(this.entryProgress + 0.05, 1);
            this.xOffset = lerp(-400, 0, this.entryProgress);
            if (this.entryProgress >= 1) {
                this.state = 'active';
            }
        }
        
        // Handle exit animation
        if (this.state === 'exiting') {
            this.exitProgress = min(this.exitProgress + 0.05, 1);
            this.xOffset = lerp(0, 400, this.exitProgress);
        }
    }
}

function setup() {
    createCanvas(800, 800);
    
    // Create initial lasagna layers
    let z = 0;
    let layerTypes = ['pasta', 'meat', 'cheese', 'sauce'];
    for (let i = 0; i < LAYER_COUNT; i++) {
        layers.push(new LasagnaLayer(z, layerTypes[i % 4]));
        z += 25;
    }
}

function draw() {
    background(42);
    translate(width/2, height/2);
    
    // Update and manage layers
    for (let i = layers.length - 1; i >= 0; i--) {
        layers[i].update();
        
        // Remove fully exited layers
        if (layers[i].state === 'exiting' && layers[i].exitProgress >= 1) {
            layers.splice(i, 1);
            continue;
        }
        
        layers[i].draw();
    }
    
    // Add new layer when needed
    if (frameCount % 120 === 0) {  // Adjust timing here
        // Start exit animation for bottom layer
        if (layers.length >= LAYER_COUNT) {
            layers[0].state = 'exiting';
        }
        
        // Create new layer at top
        let newZ = (layers.length > 0) ? layers[layers.length - 1].z + 25 : 0;
        let newType = ['pasta', 'meat', 'cheese', 'sauce'][layers.length % 4];
        layers.push(new LasagnaLayer(newZ, newType, 'entering'));
        
        // Adjust all layers' z positions
        for (let i = 0; i < layers.length - 1; i++) {
            layers[i].z -= 25;
        }
    }
}