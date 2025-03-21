// Animation speed control (lower = faster)
const ANIMATION_INTERVAL = 60; // Frames between new layers
const TRANSITION_SPEED = 0.1;   // Speed of layer movement (0-1)

let layers = [];
const LAYER_COUNT = 8;
const SQRT3 = Math.sqrt(3);

// Store static meat textures
let meatTextures = [];

class LasagnaLayer {
    constructor(z, type, state = 'active') {
        this.z = z;
        this.type = type;
        this.width = 400;
        this.height = 300;
        this.depth = 25;
        this.state = state;
        this.xOffset = (state === 'entering') ? -1800 : 0;
        this.targetXOffset = 0;
        
        // Generate static texture positions if it's a meat layer and textures aren't set
        if (type === 'meat' && meatTextures.length === 0) {
            for (let i = 0; i < 30; i++) {
                meatTextures.push({
                    x: random(-this.width/2 + 10, this.width/2 - 10),
                    y: random(10, this.height - 10),
                    size: random(4, 8)
                });
            }
        }
    }

    isoProject(x, y, z) {
        return {
            x: (SQRT3 * (x + this.xOffset) - SQRT3 * z) / 2,
            y: (x + this.xOffset + 2 * y + z) / 2
        };
    }

    drawShape(points) {
        beginShape();
        for (let p of points) {
            let iso = this.isoProject(p.x, p.y, p.z + this.z);
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
        }

        // Bottom face
        fill(sideColor.levels[0] * 0.7, sideColor.levels[1] * 0.7, sideColor.levels[2] * 0.7);
        this.drawShape([
            {x: -this.width/2, y: 0, z: -this.depth},
            {x: this.width/2, y: 0, z: -this.depth},
            {x: this.width/2, y: this.height, z: -this.depth},
            {x: -this.width/2, y: this.height, z: -this.depth}
        ]);

        // Back face
        fill(sideColor.levels[0] * 0.85, sideColor.levels[1] * 0.85, sideColor.levels[2] * 0.85);
        this.drawShape([
            {x: -this.width/2, y: 0, z: 0},
            {x: this.width/2, y: 0, z: 0},
            {x: this.width/2, y: 0, z: -this.depth},
            {x: -this.width/2, y: 0, z: -this.depth}
        ]);

        // Front face
        fill(sideColor.levels[0] * 0.9, sideColor.levels[1] * 0.9, sideColor.levels[2] * 0.9);
        this.drawShape([
            {x: -this.width/2, y: this.height, z: 0},
            {x: this.width/2, y: this.height, z: 0},
            {x: this.width/2, y: this.height, z: -this.depth},
            {x: -this.width/2, y: this.height, z: -this.depth}
        ]);

        // Left face
        fill(sideColor.levels[0] * 0.8, sideColor.levels[1] * 0.8, sideColor.levels[2] * 0.8);
        this.drawShape([
            {x: -this.width/2, y: 0, z: 0},
            {x: -this.width/2, y: this.height, z: 0},
            {x: -this.width/2, y: this.height, z: -this.depth},
            {x: -this.width/2, y: 0, z: -this.depth}
        ]);

        // Right face
        fill(sideColor.levels[0] * 0.95, sideColor.levels[1] * 0.95, sideColor.levels[2] * 0.95);
        this.drawShape([
            {x: this.width/2, y: 0, z: 0},
            {x: this.width/2, y: this.height, z: 0},
            {x: this.width/2, y: this.height, z: -this.depth},
            {x: this.width/2, y: 0, z: -this.depth}
        ]);

        // Top face
        fill(mainColor);
        this.drawShape([
            {x: -this.width/2, y: 0, z: 0},
            {x: this.width/2, y: 0, z: 0},
            {x: this.width/2, y: this.height, z: 0},
            {x: -this.width/2, y: this.height, z: 0}
        ]);

        // Add texture details based on layer type
        if (this.type === 'cheese') {
            this.drawCheeseTexture(mainColor);
        } else if (this.type === 'meat') {
            this.drawMeatTexture(mainColor);
        }
    }

    drawCheeseTexture(baseColor) {
        fill(red(baseColor) + 20, green(baseColor) + 20, blue(baseColor) + 20);
        for (let i = 0; i < 20; i++) {
            let x = random(-this.width/2 + 10, this.width/2 - 10);
            let y = random(10, this.height - 10);
            let iso = this.isoProject(x, y, this.z);
            circle(iso.x, iso.y, 5);
        }
    }

    drawMeatTexture(baseColor) {
        fill(red(baseColor) + 20, green(baseColor) + 20, blue(baseColor) + 20);
        for (let texture of meatTextures) {
            let iso = this.isoProject(texture.x, texture.y, this.z);
            circle(iso.x, iso.y, texture.size);
        }
    }

    update() {
        if (this.state === 'entering') {
            this.xOffset += (this.targetXOffset - this.xOffset) * TRANSITION_SPEED;
            if (abs(this.xOffset - this.targetXOffset) < 1) {
                this.state = 'active';
                this.xOffset = this.targetXOffset;
            }
        } else if (this.state == 'exiting') {
            this.xOffset += (1800 - this.xOffset) * TRANSITION_SPEED;
        }
    }
}

function setup() {
    createCanvas(1080, 1080);
    
    // Create initial lasagna layers
    let z = 0;
    let layerTypes = ['pasta', 'meat', 'cheese'];
    for (let i = 0; i < LAYER_COUNT; i++) {
        layers.push(new LasagnaLayer(z, layerTypes[i % 3]));
        z += 25;
    }
}

function draw() {
    background(42);
    translate(width/2, height/3);
    
    
    // Manage layer addition and removal
    if (frameCount % ANIMATION_INTERVAL == 0) {
        // Make the top (oldest) layer exit
//         if (layers.length > 0) {
            layers[layers.length - 1].state = 'exiting';
            console.log(layers[layers.length - 1].state)
            layers[layers.length-1].update()
        
        // }
        
        // Add new layer at bottom
        const layerTypes = ['pasta', 'meat', 'cheese'];
        let newType = layerTypes[frameCount / ANIMATION_INTERVAL % 3];
        let newLayer = new LasagnaLayer(0, newType, 'entering');
        layers.unshift(newLayer);
        
        // Adjust z positions for all other layers
        for (let i = 1; i < layers.length; i++) {
            layers[i].z += 25;
        }
    }
  
    // Update and manage layers
    for (let i = layers.length - 1; i >= 0; i--) {
        layers[i].update();
        
        // Remove fully exited layers
        if (layers[i].state == 'exiting' && abs(layers[i].xOffset - 1800) < 1) {
            layers.splice(i, 1);
            continue;
        }
        
        layers[i].draw();
    }
}