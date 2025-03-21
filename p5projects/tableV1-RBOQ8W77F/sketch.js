class Cut {
    constructor(cubeSize) {
        this.cubeSize = cubeSize;
        this.knifeState = 'idle'; // Possible states: 'idle', 'cutting'
        this.knifePositionX = -300; // Initial position of the knife blade along x-axis
        this.knifeMaxWidth = 300; // Maximum width the knife blade travels
        this.knifePositionY = 0; // Initial position of the knife blade along y-axis

        this.knifeYOffset = 20; // Offset for positioning the knife above the loaf
        this.knifeSpeed = 0.01; // Speed of the knife blade moving into the loaf
        this.knifeZigZagSpeed = 0.08; // Speed of the zigzag movement
        this.knifeDirection = 1; // Direction of the knife blade movement
        this.knifeTravelTime = 200; // Time to traverse the loaf

        this.knifeBladeWidth = 8; // Depth of the knife blade
        this.knifeBladeHeight = 200; // Length of the knife blade
        this.knifeHandleWidth = 70; // Width of the knife handle
        this.knifeHandleHeight = 30; // Height of the knife handle
        this.knifeHandleDepth = 20; // Depth of the knife handle
        this.knifeDepth = 20; // Width of the knife blade into the loaf

        this.triangleHeight = 10; // Height of the serrated triangles
        this.triangleBase = 10; // Base width of the serrated triangles
    }

    create() {
        push();
        rotateY(-PI / 2);
        translate(0, 0, this.cubeSize / 2);
        rotateX(PI);

        // Draw loaf of bread
        push();
        translate(0, 0, -this.loafDepth / 2);
        fill(244, 164, 96); // Light brown color for bread
        box(this.loafWidth, this.loafHeight, this.loafDepth);
        pop();

        // Update knife behavior based on mouse position
        let isMouseInCenter = abs(mouseX - width / 2) < 100; // Adjust threshold as needed

        if (isMouseInCenter) {
            this.knifeState = 'cutting';
        } else {
            this.knifeState = 'idle';
        }

        if (this.knifeState === 'cutting') {
            // Calculate knife blade position for cutting
            this.knifePositionX = map(frameCount % this.knifeTravelTime, 0, this.knifeTravelTime, -this.knifeMaxWidth / 2, this.knifeMaxWidth / 2);
            this.knifePositionY = map(sin(frameCount * this.knifeZigZagSpeed), -1, 1, -this.knifeMaxWidth / 20, this.knifeMaxWidth / 20);
        } else {
            // Set knife to initial position
            this.knifePositionX = -300;
            this.knifePositionY = 0;
        }

        push();
        // Draw knife blade
        push();
        translate(this.knifePositionX, this.knifePositionY, -this.loafDepth / 2);

        fill(192, 192, 192); // Silver color for knife blade
        box(this.knifeDepth, this.knifeBladeHeight, this.knifeBladeWidth);

        // Draw serrated edge
        this.drawSerratedEdge();
        pop();

        // Draw knife handle
        push();
        translate(this.knifePositionX + 2, this.knifeYOffset + this.knifeBladeHeight / 2 + this.knifeHandleHeight / 2 + this.knifePositionY - 20, -this.loafDepth / 2);
        fill(139, 69, 19); // Dark brown color for knife handle
        box(this.knifeHandleHeight, this.knifeHandleWidth, this.knifeHandleDepth);
        pop();

        pop();
        pop();
    }

    drawSerratedEdge() {
        push();
        translate(this.knifeDepth / 2, -this.knifeBladeHeight / 2, -this.knifeBladeWidth / 2); // Move to the right edge of the blade
        fill(192, 192, 192); 
        for (let i = 0; i < this.knifeBladeHeight / this.triangleHeight; i++) {
            let yOffset = i * this.triangleHeight;
            beginShape();
            // Front face
            vertex(0, yOffset, 0);
            vertex(this.triangleBase / 2, yOffset + this.triangleHeight / 2, 0);
            vertex(0, yOffset + this.triangleHeight, 0);
            endShape(CLOSE);

            beginShape();
            // Back face
            vertex(0, yOffset, this.knifeBladeWidth);
            vertex(this.triangleBase / 2, yOffset + this.triangleHeight / 2, this.knifeBladeWidth);
            vertex(0, yOffset + this.triangleHeight, this.knifeBladeWidth);
            endShape(CLOSE);

            beginShape();
            // Top face
            vertex(0, yOffset, 0);
            vertex(this.triangleBase / 2, yOffset + this.triangleHeight / 2, 0);
            vertex(this.triangleBase / 2, yOffset + this.triangleHeight / 2, this.knifeBladeWidth);
            vertex(0, yOffset, this.knifeBladeWidth);
            endShape(CLOSE);

            beginShape();
            // Bottom face
            vertex(0, yOffset + this.triangleHeight, 0);
            vertex(this.triangleBase / 2, yOffset + this.triangleHeight / 2, 0);
            vertex(this.triangleBase / 2, yOffset + this.triangleHeight / 2, this.knifeBladeWidth);
            vertex(0, yOffset + this.triangleHeight, this.knifeBladeWidth);
            endShape(CLOSE);

            beginShape();
            // Left face
            vertex(0, yOffset, 0);
            vertex(0, yOffset + this.triangleHeight, 0);
            vertex(0, yOffset + this.triangleHeight, this.knifeBladeWidth);
            vertex(0, yOffset, this.knifeBladeWidth);
            endShape(CLOSE);

            beginShape();
            // Right face
            vertex(this.triangleBase / 2, yOffset + this.triangleHeight / 2, 0);
            vertex(this.triangleBase / 2, yOffset + this.triangleHeight / 2, this.knifeBladeWidth);
            vertex(0, yOffset + this.triangleHeight, this.knifeBladeWidth);
            vertex(0, yOffset + this.triangleHeight, 0);
            endShape(CLOSE);
        }

        pop();
    }
}
