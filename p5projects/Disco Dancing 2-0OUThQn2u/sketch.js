// paste the url of the model you trained in teachablemachine here
let URL = "https://teachablemachine.withgoogle.com/models/p3-QeSwvd/";
let modelURL = URL + "model.json";
let metadataURL = URL + "metadata.json";

let model, webcam, ctx, labelContainer, maxPredictions;

//MY CODE
let colors = [];
let colorDirNum = 1;
let colorDir = [-colorDirNum, colorDirNum, -colorDirNum];
let d;

let isFirstFrame = true;

async function setup() {
    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds 'tmPose' object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    document.getElementById('status').innerHTML = "Setting up camera";

    // Convenience function to setup a webcam
    const size = 600;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop1);
  
    // append/get elements to the DOM
    const canvas = document.getElementById('canvas');
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext('2d');
    labelContainer = document.getElementById('label-container');
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement('div'));
        
    }
    document.getElementById('status').innerHTML = "Ready";
  
  
    //MY CODE
    colors[0] = parseInt(random(0,256));
    colors[1] = parseInt(random(0,256));
    colors[2] = parseInt(random(0,256));
    
}

async function loop1(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop1);
    
}

async function predict() {
  
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ': ' + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
      
      // if (classPrediction == )
    }
    console.log(prediction[0].probability.toFixed(2))
    if (prediction[2].probability.toFixed(2)>0.95) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, webcam.canvas.width, webcam.canvas.height);
    }
    if (prediction[1].probability.toFixed(2) > 0.95) {
      colorDirNum += 1
    } 
    if (prediction[2].probability.toFixed(2) > 0.95) {
      if (colorDirNum >= 2){
        colorDirNum -= 1
      }
    }
    console.log(colorDirNum)

    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    
    // let c = color();
    
    if (webcam.canvas) {
        if (isFirstFrame) {
            // If it's the first frame, draw a black background
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, webcam.canvas.width, webcam.canvas.height);
            isFirstFrame = false; // Update the flag
        }
        // ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            // console.log(pose.keypoints[3].position.x)
            // window.canvas.stroke(colors[0],colors[1],colors[2])
            let c = color(colors[0],colors[1],colors[2])
            const minPartConfidence = 0;
//             console.log(tmPose)
//             let d = dist(pose.keypoints[3].position.x, pose.keypoints[3].position.y, pose.keypoints[4].position.x, pose.keypoints[4].position.y)
//             console.log(dist)
            
            let v1 = createVector(pose.keypoints[3].position.x, pose.keypoints[3].position.y);
            let v2 = createVector(pose.keypoints[4].position.x, pose.keypoints[4].position.y);
            
            if ((v1.dist(v2)) > 30) {
            // Calculate the distance between them.
            d = v1.dist(v2);
            // console.log(d)
            }
          
            // console.log(pose.keypoints[0].position.x)
            // console.log(ellipse(pose.keypoints[0].position.x, pose.keypoints[0].position.y, d+30, d+30))
//             tmPose.drawKeypoints
            // (pose.keypoints[0].position.x, pose.keypoints[0].position.y, d+30, d+30)
            // tmPose.drawKeypoints((pose.keypoints[0], pose.keypoints[0]), minPartConfidence, ctx, 50, c, c );
            // console.log(pose.keypoints)
            let subsetK = []
            for (let i = 5; i < pose.keypoints.length; i++) {
              subsetK = pose.keypoints[i]
            }
            // Draw the ellipse on the canvas
            ctx.beginPath();
            ctx.lineWidth = 10;
            ctx.fillStyle = c; // Fill color
            ctx.ellipse(pose.keypoints[0].position.x, pose.keypoints[0].position.y, d-30, d-30, 0, 0, 2 * Math.PI);
            ctx.stroke();
            
          
            tmPose.drawKeypoints(subsetK, minPartConfidence, ctx, 10, c, c );
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx, 30, c );
        }
    }
  
    
  //MY CODE ---------------------------------------------------------
  for (let j = 0; j < colors.length; j++) {
    if ((colors[j] < 256 && colors[j] >= 0)) {
      colors[j] += colorDir[j];
    } else {
      colorDir[j] *= -1;
      colors[j] += colorDir[j];
    }
    // console.log(colors[j]);
  }
  
  //MY CODE ---------------------------------------------------------

}
