let posts = [];
let colors;
const numPosts = 12;
let scrollSpeed = 2;
let noiseOffset = 0;
let lastMouseY;
let momentum = 0;
const momentumDamping = 0.95;

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 1);
  
  // Create a color palette inspired by popular social media platforms
  colors = [
    color(214, 80, 95),  // Facebook blue
    color(340, 85, 95),  // Instagram pink
    color(195, 75, 95),  // Twitter blue
    color(0, 85, 95),    // Reddit orange
    color(145, 70, 95)   // Spotify green
  ];
  
  // Initialize posts with varied dimensions
  for (let i = 0; i < numPosts; i++) {
    createNewPost(random(height));
  }
  
  lastMouseY = mouseY;
}

function createNewPost(yPos) {
  posts.push({
    x: width * 0.1,
    y: yPos,
    width: random(width * 0.6, width * 0.8),
    height: random(100, 200),
    color: random(colors),
    noiseOffsetX: random(1000),
    noiseOffsetY: random(1000),
    likeCount: floor(random(1, 999)),
    shareCount: floor(random(1, 200)),
    hasImage: random() > 0.3,
    imageGrid: createImageGrid()
  });
}

function createImageGrid() {
  let grid = [];
  let divisions = floor(random(1, 4));
  for (let i = 0; i < divisions; i++) {
    grid.push(random(0.3, 1)); // Random height ratios
  }
  return grid;
}

function draw() {
  background(0, 0, 15);
  
  // Update scroll momentum
  scrollSpeed = momentum;
  momentum *= momentumDamping;
  
  // Update noise offset for subtle movement
  noiseOffset += 0.002;
  
  // Draw and update each post
  for (let post of posts) {
    // Add subtle floating movement
    let xOffset = map(noise(post.noiseOffsetX + noiseOffset), 0, 1, -1, 1);
    post.x = width * 0.1 + xOffset * 5;
    post.y += scrollSpeed;
    
    // Reset position when post goes off screen
    if (post.y > height + post.height) {
      post.y = -post.height;
      post.width = random(width * 0.6, width * 0.8);
      post.height = random(100, 200);
      post.color = random(colors);
      post.hasImage = random() > 0.3;
      post.imageGrid = createImageGrid();
      post.likeCount = floor(random(1, 999));
      post.shareCount = floor(random(1, 200));
    }
    
    // Draw post card with shadow
    drawPost(post);
    
    post.noiseOffsetX += 0.01;
    post.noiseOffsetY += 0.01;
  }
  
  // Draw scrollbar
  drawScrollbar();
}

function drawPost(post) {
  push();
  // Draw shadow
  fill(0, 0, 0, 0.1);
  rect(post.x + 5, post.y + 5, post.width, post.height, 10);
  
  // Draw main post background
  fill(0, 0, 95);
  rect(post.x, post.y, post.width, post.height, 10);
  
  // Draw header bar
  fill(post.color);
  rect(post.x, post.y, post.width, 40, 10, 10, 0, 0);
  
  // Draw profile circle
  fill(0, 0, 100);
  circle(post.x + 25, post.y + 20, 25);
  
  // Draw content
  if (post.hasImage) {
    let gridY = post.y + 50;
    let totalHeight = post.height - 90; // Space for header and footer
    for (let heightRatio of post.imageGrid) {
      fill(post.color);
      let imageHeight = totalHeight * heightRatio;
      rect(post.x + 10, gridY, post.width - 20, imageHeight - 5, 5);
      gridY += imageHeight + 5;
    }
  } else {
    // Draw text lines
    fill(0, 0, 60);
    for (let i = 0; i < 3; i++) {
      rect(post.x + 10, post.y + 50 + i * 20, post.width - 20, 10, 5);
    }
  }
  
  // Draw footer with engagement metrics
  fill(0, 0, 60);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(`${post.likeCount} likes • ${post.shareCount} shares`, post.x + 10, post.y + post.height - 20);
  pop();
}

function drawScrollbar() {
  let totalHeight = height + (posts.length * 200);
  let visibleRatio = height / totalHeight;
  let scrollbarHeight = height * visibleRatio;
  let scrollPosition = map(-posts[0].y, 0, totalHeight - height, 0, height - scrollbarHeight);
  
  fill(0, 0, 100, 0.2);
  rect(width - 20, scrollPosition, 10, scrollbarHeight, 5);
}

function mouseDragged() {
  momentum = (mouseY - lastMouseY) * 0.5;
  lastMouseY = mouseY;
}

function mouseWheel(event) {
  momentum = event.delta * 0.1;
  return false;
}

function mousePressed() {
  lastMouseY = mouseY;
  momentum = 0;
}