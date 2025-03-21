<!DOCTYPE html>
<html>
<head>
    <title>Teachable Machine Outline</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js"></script>
</head>
<body>
    <script>
        // Replace this with your Teachable Machine model URL
        const modelURL = 'YOUR_MODEL_URL_HERE';
        let model, webcam, ctx, labelContainer;

        async function init() {
            const modelURL = "YOUR_MODEL_URL_HERE";
            const model = await tmImage.load(modelURL + "model.json", modelURL + "weights.bin");
            
            // Set up webcam
            webcam = createCapture(VIDEO);
            webcam.size(640, 480);
            webcam.hide();
            
            // Create canvas
            createCanvas(640, 480);
            
            // Start prediction loop
            loop();
        }

        async function draw() {
            // White background
            background(255);
            
            // Predict using the model
            const prediction = await model.predict(webcam.elt);
            
            // Only draw if we detect something with high confidence
            prediction.forEach(pred => {
                if (pred.probability > 0.8) { // Adjust threshold as needed
                    // Get the pixels from the video
                    loadPixels();
                    
                    // Draw simple outline
                    stroke(0);
                    noFill();
                    strokeWeight(2);
                    
                    // Find edges in the image
                    for (let y = 1; y < height-1; y += 2) {
                        for (let x = 1; x < width-1; x += 2) {
                            let index = (x + y * width) * 4;
                            let brightness = (pixels[index] + pixels[index+1] + pixels[index+2]) / 3;
                            
                            // Check neighboring pixels
                            let neighborBrightness = (
                                (pixels[((y-1) * width + x) * 4] +
                                 pixels[((y-1) * width + x) * 4 + 1] +
                                 pixels[((y-1) * width + x) * 4 + 2]) / 3
                            );
                            
                            // If there's a significant difference, draw a point
                            if (Math.abs(brightness - neighborBrightness) > 30) {
                                point(x, y);
                            }
                        }
                    }
                }
            });
        }

        // Start everything
        init();
    </script>
</body>
</html>