// paste the url of the model you trained in teachablemachine here
let URL = "https://teachablemachine.withgoogle.com/models/X_S4Bwai/";
let modelURL = URL + "model.json";
let metadataURL = URL + "metadata.json";

let model, webcam, ctx, labelContainer, maxPredictions;

//MY CODE
let colors = [];
let colorDir = [-1, 1, -1];

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
    }

    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    // let c = color();
   
    if (webcam.canvas) {
        // ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            for (var i = 0; i < pose.length; i++) {
            let x = pose[i].position.x;
            let y = pose[i].position.y;
            // ellipse(x, y, 5, 5);

            push()
            stroke(colors[0],colors[1],colors[2])
            strokeWeight(20)
            strokeCap(ROUND)
            if (i >= 7 && i < pose.length && i< 11) {

              line(pose[i-2].position.x, pose[i-2].position.y, pose[i].position.x, pose[i].position.y)
            }
            if (i >= 13 && i < pose.length) {
              line(pose[i-2].position.x, pose[i-2].position.y, pose[i].position.x, pose[i].position.y)
            }
            // console.log(i)
            if (i ==5) {
              line(pose[i].position.x, pose[i].position.y, pose[i+1].position.x, pose[i+1].position.y)
              line(pose[i].position.x, pose[i].position.y, pose[i+6].position.x, pose[i+6].position.y)
              line(pose[i+1].position.x, pose[i+1].position.y, pose[i+7].position.x, pose[i+7].position.y)
              line(pose[i+6].position.x, pose[i+6].position.y, pose[i+7].position.x, pose[i+7].position.y)
            }
            if (i == 0) {
              let d = dist(pose[3].position.x, pose[3].position.y, pose[4].position.x, pose[4].position.y)
              circle(pose[i].position.x, pose[i].position.y, d+30,d+30)
            }
            pop()
          }
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
