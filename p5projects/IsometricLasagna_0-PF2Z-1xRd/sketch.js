
let layers = [];
let hoveredLayer = -1;

// Isometric angle constants
const SQRT3 = Math.sqrt(3);
const isoMatrix = [
    [SQRT3/2, 0, -SQRT3/2],
    [0.5, 1, 0.5],
    [1/SQRT3, -2/SQRT3, 1/SQRT3]
];

class LasagnaLayer {
    constructor(z, type) {
        this.z = z;
        this.type = type;
        this.width = 120;
        this.height = 120;
        this.depth = 15;
        this.offset = 0;
        this.targetOffset = 0;
    }

    isoProject(x, y, z) {
        // Apply isometric transformation
        return {
            x: (SQRT3 * x - SQRT3 * z) / 2,
            y: (x + 2 * y + z) / 2
        };
    }

    drawShape(points) {
        beginShape();
        for (let p of points) {
            let iso = this.isoProject(p.x, p.y, p.z + this.z + this.offset);
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

        // Top face
        fill(mainColor);
        this.drawShape([
            {x: -this.width/2, y: 0, z: 0},
            {x: this.width/2, y: 0, z: 0},
            {x: this.width/2, y: this.height, z: 0},
            {x: -this.width/2, y: this.height, z: 0}
        ]);

        // Right face
        fill(sideColor.levels[0] * 0.9, sideColor.levels[1] * 0.9, sideColor.levels[2] * 0.9);
        this.drawShape([
            {x: this.width/2, y: 0, z: 0},
            {x: this.width/2, y: 0, z: -this.depth},
            {x: this.width/2, y: this.height, z: -this.depth},
            {x: this.width/2, y: this.height, z: 0}
        ]);

        // Left face
        fill(sideColor.levels[0] * 0.8, sideColor.levels[1] * 0.8, sideColor.levels[2] * 0.8);
        this.drawShape([
            {x: -this.width/2, y: this.height, z: 0},
            {x: -this.width/2, y: this.height, z: -this.depth},
            {x: -this.width/2, y: 0, z: -this.depth},
            {x: -this.width/2, y: 0, z: 0}
        ]);

        // Add texture details
        if (this.type === 'cheese') {
            this.drawTextureDetails(mainColor, 20, 3);
        } else if (this.type === 'meat') {
            this.drawTextureDetails(sideColor, 30, 4);
        } else if (this.type === 'sauce') {
            this.drawTextureDetails(color(200, 34, 34), 25, 3);
        }
    }

    drawTextureDetails(baseColor, count, size) {
        fill(red(baseColor) + 20, green(baseColor) + 20, blue(baseColor) + 20);
        for (let i = 0; i < count; i++) {
            let x = random(-this.width/2 + 10, this.width/2 - 10);
            let y = random(10, this.height - 10);
            let iso = this.isoProject(x, y, this.z + this.offset);
            circle(iso.x, iso.y, size);
        }
    }

    update() {
        this.offset = lerp(this.offset, this.targetOffset, 0.1);
    }
}

function setup() {
    createCanvas(600, 600);
    
    // Create lasagna layers
    let z = 0;
    let layerTypes = ['pasta', 'meat', 'cheese', 'sauce'];
    for (let i = 0; i < 21; i++) {
        layers.push(new LasagnaLayer(z, layerTypes[i % 4]));
        z += 15;
    }
}

function draw() {
    background(42);
    translate(width/2, height/2 - 100);
    
    // Draw layers from back to front
    for (let i = layers.length - 1; i >= 0; i--) {
        layers[i].update();
        
        // Mouse interaction
        let d = dist(mouseX - width/2, mouseY - (height/2 - 100), 0, 0);
        if (d < 100 && mouseY < height/2) {
            hoveredLayer = i;
            layers[i].targetOffset = 20;
        } else {
            layers[i].targetOffset = 0;
        }
        
        layers[i].draw();
    }
}