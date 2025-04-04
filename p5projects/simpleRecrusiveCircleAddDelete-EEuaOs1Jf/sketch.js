// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
// Simple Recursion with Interactive Depth Control
// Modified for beginners by Claude

// Global variables to track recursion settings
let maxDepth = 3;           // Current maximum depth of recursion
let targetDepth = 3;        // Target depth we're transitioning to
let currentDepth = 3;       // Actual depth with decimal values for smooth transitions
let transitionSpeed = 0.1;  // How fast the transition occurs (smaller = slower)

function setup() {
  // Create a full-screen canvas
  createCanvas(windowWidth, windowHeight);
  
  // Add instructions text at the top
  textAlign(CENTER);
  textSize(16);
}

function draw() {
  // Clear the background to white each frame
  background(255);
  
  // Display instructions at the top of the screen
  fill(0);  // Black text
  text("Press UP ARROW to increase depth, DOWN ARROW to decrease depth", width / 2, 30);
  text("Current Depth: " + targetDepth, width / 2, 60);
  
  // Calculate the smooth transition between depth levels
  // This makes the change gradual rather than instant
  if (currentDepth !== targetDepth) {
    // Move currentDepth closer to targetDepth by a small amount each frame
    currentDepth = currentDepth + (targetDepth - currentDepth) * transitionSpeed;
    
    // If we're very close to the target, just snap to it
    if (Math.abs(currentDepth - targetDepth) < 0.01) {
      currentDepth = targetDepth;
    }
  }
  
  // Start drawing circles from the center of the screen
  drawCircles(width / 2, height / 2, min(width, height) / 3, 0);
  
  // We want this to run continuously (don't use noLoop())
  // This allows our animation and keyboard interactions to work
}

// The recursive function that draws circles
// Parameters:
// - x, y: The center position of the circle
// - radius: The radius of the circle
// - depth: The current depth level of recursion (starts at 0)
function drawCircles(x, y, radius, depth) {
  // Set the stroke color to black and don't fill the circle
  stroke(0);
  noFill();
  
  // Draw the current circle
  circle(x, y, radius * 2);
  
  // Check if we should continue recursion
  // We compare with currentDepth (which may have decimal values during transition)
  // This will create the pull-back effect during transitions
  if (radius > 2 && depth < currentDepth) {
    // Calculate the new radius for the next level of recursion
    let newRadius = radius / 2;
    
    // Calculate how much to fade out circles as we go deeper
    // This makes the transition more noticeable
    let nextDepth = depth + 1;
    
    // If the next depth is within our transition zone, fade it
    if (nextDepth > currentDepth - 1 && nextDepth <= currentDepth) {
      // Calculate how "visible" this level should be (0-1)
      let visibility = 1 - (nextDepth - (currentDepth - 1));
      
      // Make the stroke more transparent for levels that are fading in/out
      stroke(0, 255 * visibility);
    }
    
    // Recursively draw four more circles in the four directions
    // Each call creates a new circle at half the radius
    
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

// This function handles keyboard input
function keyPressed() {
  // Increase the recursion depth when UP arrow is pressed
  if (keyCode === UP_ARROW) {
    // Don't go beyond 8 levels to prevent the browser from freezing
    targetDepth = min(targetDepth + 1, 8);
  } 
  // Decrease the recursion depth when DOWN arrow is pressed
  else if (keyCode === DOWN_ARROW) {
    // Don't go below 0 levels
    targetDepth = max(targetDepth - 1, 0);
  }
}

// This function resizes the canvas when the window is resized
function windowResized() {
  // Update the canvas size to match the new window size
  resizeCanvas(windowWidth, windowHeight);
}