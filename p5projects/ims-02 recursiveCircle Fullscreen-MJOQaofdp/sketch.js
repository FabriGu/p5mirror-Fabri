// The Nature of Code
// Daniel Shiffman
// https://natureofcode.com/fractals/
// Example 8.3: Recursive Circles Four Times

// Global variables to track recursion settings
let maxDepth = 8;
// Variables to keep track of where we are going for transitions
let targetDepth = 0;
let currentDepth = 0;
let numActiveFaces = null;
// Speed of transition
let direction = 1;
let magnitude = 0;
// Variables for fullscreen functionality
let my = {};

function setup() {
  // Initialize fullscreen settings
  my.width = windowWidth;
  my.height = windowHeight;
  my.changeTime = 5.0;
  my.debug = 0;
  
  // Create a full-screen canvas
  createCanvas(my.width, my.height);
  colorMode(HSB);
  
  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  background(0);
  
  // Setup fullscreen button
  setup_fullScreenButton();
}

function draw() {
  // Clear the background to black each frame
  background(0, 0, 0, 0.01);
  translate(width/2, height/2);
  
  // change the recursion depth based on the number of people present
  if (poses.length == 0) {
    targetDepth = 0;
  } else if (poses.length > 0 && poses.length <= maxDepth) {
    numActiveFaces = poses.length;
    targetDepth = 0 + numActiveFaces; 
  } else {
    targetDepth = 8;
  }
  
  // get radius from min of width and height of canvas and then divide by the frameCount (also slowed further for cooler effect)
  let radius = min(width/2, height/2) / abs(sin(frameCount/80));
  
  drawCircles(0, 0, radius, 0);
  
  currentDepth = targetDepth;
}

// Recursive function that draws circles
function drawCircles(x, y, radius, depth) {
  // Since we are in HSB mode we can make the stroke color based on the depth
  // Change the hue based on depth
  stroke((depth * 20) % 360, 60, 70);
  
  // We can also increase the stroke weight with depth
  strokeWeight(8 - depth);
  noFill();
  
  // Draw the current circle
  circle(x, y, radius * 2);
  
  // Added the check for depth vs currentdepth to make sure that we do not recurse infinitely
  if (radius > 16 && depth < currentDepth) {
    // Calculate the new radius for the next level of recursion
    let newRadius = radius / 2;
    let nextDepth = depth + 1;
    
    // Recursively draw four more circles in the four directions
    // Each call creates a new circle at the calculated radius
    
    // Right circle
    drawCircles(x + radius / 2, y, newRadius, nextDepth);
    
    // Left circle
    drawCircles(x - radius / 2, y, newRadius, nextDepth);
    
    // Bottom circle
    drawCircles(x, y + radius / 2, newRadius, nextDepth);
    
    // Top circle
    drawCircles(x, y - radius / 2, newRadius, nextDepth);
  }
}

// This function handles keyboard input (commented out in original code)
// function keyPressed() {
//   // Increase the recursion depth when UP arrow is pressed
//   if (keyCode === UP_ARROW) {
//     // Don't go beyond 8 levels to prevent the browser from freezing
//     targetDepth = min(targetDepth + 1, 8);
//   } 
//   // Decrease the recursion depth when DOWN arrow is pressed
//   else if (keyCode === DOWN_ARROW) {
//     // Don't go below 0 levels
//     targetDepth = max(targetDepth - 1, 0);
//   }
//   console.log("Target:", targetDepth, "Current:", currentDepth);
// }

// Fullscreen functionality from the second sketch
function setup_fullScreenButton() {
  my.fullScreenButton = createButton("?=v7 Full Screen");
  my.fullScreenButton.mousePressed(fullScreen_action);
  my.fullScreenButton.style("font-size:42px");
}

function fullScreen_action() {
  my.fullScreenButton.remove();
  fullscreen(1);
  let delay = 3000;
  setTimeout(ui_present_window, delay);
}

function ui_present_window() {
  resizeCanvas(windowWidth, windowHeight);
}

// This function resizes the canvas when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}