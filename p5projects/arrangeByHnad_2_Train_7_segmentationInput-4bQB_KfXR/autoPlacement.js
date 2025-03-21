// Auto Shape Placement Algorithm
// This file should be included after your main sketch.js file

// Main function to automatically place shapes on the segmentation mask
function autoPlaceShapes(numSquares, numTriangles) {
  // Clear existing shapes
  shapes = [];
  
  // Get the total number of shapes to place
  const totalShapes = numSquares + numTriangles;
  if (totalShapes <= 0) return;
  
  // 1. Extract valid positions from the BLACK areas of the mask
  const validPositions = extractBlackAreaPositions();
  if (validPositions.length === 0) {
    console.log("No suitable positions found in the BLACK areas of the mask");
    return;
  }
  
  // 2. Place the first shape at a good position in the BLACK area
  const firstPosition = findGoodStartingPosition(validPositions);
  if (!firstPosition) {
    console.log("Could not find a good starting position in the BLACK area");
    return;
  }
  
  // Create first shape (square if any requested, otherwise triangle)
  const firstShapeType = numSquares > 0 ? 'square' : 'triangle';
  const firstShape = new Shape(firstShapeType, firstPosition.x, firstPosition.y);
  shapes.push(firstShape);
  
  // Update counters
  if (firstShapeType === 'square') numSquares--;
  else numTriangles--;
  
  // 3. Place remaining shapes by growing from existing ones
  let shapesRemaining = numSquares + numTriangles;
  let attempts = 0;
  const maxAttempts = 1000; // Prevent infinite loops
  
  while (shapesRemaining > 0 && attempts < maxAttempts) {
    attempts++;
    
    // Choose a random existing shape to grow from
    const baseShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    // Choose which type to place next (prioritize squares if any left)
    const nextShapeType = numSquares > 0 ? 'square' : 'triangle';
    
    // Try to add a connected shape
    if (placeConnectedShape(baseShape, nextShapeType, validPositions)) {
      // Update counters
      if (nextShapeType === 'square') numSquares--;
      else numTriangles--;
      
      shapesRemaining--;
      attempts = 0; // Reset attempts counter after success
    }
  }
  
  console.log(`Auto-placed ${shapes.length} shapes (${shapes.filter(s => s.type === 'square').length} squares, ${shapes.filter(s => s.type === 'triangle').length} triangles)`);
}

// Extract positions where shapes can be placed (in BLACK areas)
function extractBlackAreaPositions() {
  const validPositions = [];
  const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
  // Loop through the downsampled mask grid
  for (let y = 0; y < GRID_SIZE_H; y++) {
    for (let x = 0; x < GRID_SIZE_W; x++) {
      const index = y * GRID_SIZE_W + x;
      
      // Check if this cell is BLACK (alpha value is low)
      // Note: In the visualizations, black represents areas where alpha is high,
      // but in the actual alpha values, black is where alpha is low (0 or close to 0)
      if (downsampledMaskActualAlphaArray[index] < 50) { // Black areas have low alpha values
        // Add this position if it's far enough from the edge of the black area
        if (isDeepEnoughInBlackArea(x, y, 2)) {
          validPositions.push({
            x: x * cellWidth + cellWidth/2,
            y: y * cellHeight + cellHeight/2,
            gridX: x,
            gridY: y
          });
        }
      }
    }
  }
  
  return validPositions;
}

// Check if a position is deep enough inside the black area (not near the edge)
function isDeepEnoughInBlackArea(gridX, gridY, minDistance) {
  // Check surrounding cells to make sure we're not too close to the edge
  for (let y = Math.max(0, gridY - minDistance); y <= Math.min(GRID_SIZE_H - 1, gridY + minDistance); y++) {
    for (let x = Math.max(0, gridX - minDistance); x <= Math.min(GRID_SIZE_W - 1, gridX + minDistance); x++) {
      const index = y * GRID_SIZE_W + x;
      
      // If any surrounding cell is not black, this position is too close to the edge
      if (downsampledMaskActualAlphaArray[index] >= 50) {
        return false;
      }
    }
  }
  
  return true;
}

// Find a good starting position from the valid positions
function findGoodStartingPosition(validPositions) {
  if (validPositions.length === 0) return null;
  
  // Find a position near the center of the BLACK area
  // First calculate center of mass of all valid positions
  let sumX = 0, sumY = 0;
  for (const pos of validPositions) {
    sumX += pos.x;
    sumY += pos.y;
  }
  
  const centerX = sumX / validPositions.length;
  const centerY = sumY / validPositions.length;
  
  // Find position closest to center of mass
  let closestPos = null;
  let minDist = Infinity;
  
  for (const pos of validPositions) {
    const dist = Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2));
    if (dist < minDist) {
      minDist = dist;
      closestPos = pos;
    }
  }
  
  return closestPos;
}

// Try to place a new shape connected to an existing one
function placeConnectedShape(baseShape, newShapeType, validPositions) {
  // Get attachment points of the base shape
  const basePoints = baseShape.getTransformedPoints();
  
  // Try attachment points in random order
  const pointIndices = shuffleArray([...Array(basePoints.length).keys()]);
  
  for (const pointIndex of pointIndices) {
    // Skip if this point already has a connection
    if (baseShape.connections.has(pointIndex)) continue;
    
    const basePoint = basePoints[pointIndex];
    
    // Find valid positions near this attachment point
    const nearPositions = findNearbyValidPositions(basePoint, validPositions);
    
    // Try to create a new shape at these positions
    for (const pos of nearPositions) {
      const newShape = new Shape(newShapeType, pos.x, pos.y);
      
      // Try different rotations to find a connection
      if (tryToConnectShapes(baseShape, pointIndex, newShape)) {
        // If the new shape is completely within the BLACK area, add it
        if (isShapeCompletelyInBlackArea(newShape)) {
          shapes.push(newShape);
          return true;
        }
      }
    }
  }
  
  return false;
}

// Find valid positions near an attachment point
function findNearbyValidPositions(point, validPositions) {
  // Find positions within a reasonable distance of the attachment point
  const maxDistance = SHAPE_SIZE * 1.5;
  const nearPositions = validPositions.filter(pos => {
    const distance = Math.sqrt(Math.pow(pos.x - point.x, 2) + Math.pow(pos.y - point.y, 2));
    return distance < maxDistance;
  });
  
  // Sort by distance (closest first)
  return nearPositions.sort((a, b) => {
    const distA = Math.sqrt(Math.pow(a.x - point.x, 2) + Math.pow(a.y - point.y, 2));
    const distB = Math.sqrt(Math.pow(b.x - point.x, 2) + Math.pow(b.y - point.y, 2));
    return distA - distB;
  });
}

// Try to connect two shapes by adjusting rotation and position
function tryToConnectShapes(baseShape, basePointIndex, newShape) {
  const basePoint = baseShape.getTransformedPoints()[basePointIndex];
  
  // Try different rotations
  for (let rotation = 0; rotation < 2*Math.PI; rotation += Math.PI/8) {
    newShape.rotation = rotation;
    const newPoints = newShape.getTransformedPoints();
    
    // Try to connect each point of the new shape
    for (let newPointIndex = 0; newPointIndex < newPoints.length; newPointIndex++) {
      const newPoint = newPoints[newPointIndex];
      
      // Calculate position adjustment to align attachment points
      const dx = basePoint.x - newPoint.x;
      const dy = basePoint.y - newPoint.y;
      
      // Apply adjustment
      newShape.x += dx;
      newShape.y += dy;
      
      // Check if shapes overlap after adjustment
      let overlaps = false;
      for (const existingShape of shapes) {
        if (shapesOverlap(newShape, existingShape)) {
          overlaps = true;
          break;
        }
      }
      
      if (!overlaps) {
        // Create connection between shapes
        if (!baseShape.connections.has(basePointIndex)) {
          baseShape.connections.set(basePointIndex, []);
        }
        baseShape.connections.get(basePointIndex).push({
          shape: newShape,
          pointIndex: newPointIndex
        });
        
        if (!newShape.connections.has(newPointIndex)) {
          newShape.connections.set(newPointIndex, []);
        }
        newShape.connections.get(newPointIndex).push({
          shape: baseShape,
          pointIndex: basePointIndex
        });
        
        return true;
      }
      
      // Reset position if connection failed
      newShape.x -= dx;
      newShape.y -= dy;
    }
  }
  
  return false;
}

// Check if a shape is completely inside the BLACK area
function isShapeCompletelyInBlackArea(shape) {
  // Get all points of the shape including corners and edges
  const points = getSamplePointsFromShape(shape);
  
  // Check if all points are in BLACK area
  for (const point of points) {
    // Convert to grid coordinates
    const gridX = Math.floor(point.x / (CANVAS_SIZE_W / GRID_SIZE_W));
    const gridY = Math.floor(point.y / (CANVAS_SIZE_H / GRID_SIZE_H));
    
    // Skip if outside grid bounds
    if (gridX < 0 || gridX >= GRID_SIZE_W || gridY < 0 || gridY >= GRID_SIZE_H) {
      return false;
    }
    
    // Check if this point is in BLACK area (low alpha value)
    const index = gridY * GRID_SIZE_W + gridX;
    if (downsampledMaskActualAlphaArray[index] >= 50) {
      return false;
    }
  }
  
  return true;
}

// Get sample points from a shape including corners, edges and some internal points
function getSamplePointsFromShape(shape) {
  const points = [];
  
  // Get corner points
  const corners = shape.getTransformedPoints();
  points.push(...corners);
  
  // Add midpoints of edges
  for (let i = 0; i < corners.length; i++) {
    const nextI = (i + 1) % corners.length;
    points.push({
      x: (corners[i].x + corners[nextI].x) / 2,
      y: (corners[i].y + corners[nextI].y) / 2
    });
  }
  
  // Add center point
  points.push({ x: shape.x, y: shape.y });
  
  return points;
}

// Check if two shapes overlap
function shapesOverlap(shapeA, shapeB) {
  // Check if any corner of shape A is inside shape B
  const pointsA = shapeA.getTransformedPoints();
  for (const point of pointsA) {
    if (shapeB.contains(point.x, point.y)) {
      return true;
    }
  }
  
  // Check if any corner of shape B is inside shape A
  const pointsB = shapeB.getTransformedPoints();
  for (const point of pointsB) {
    if (shapeA.contains(point.x, point.y)) {
      return true;
    }
  }
  
  // Also check for edge intersections (simplified)
  // This is a simple approximation - for a complete solution we'd need full edge-edge intersection tests
  const centerDist = Math.sqrt(Math.pow(shapeA.x - shapeB.x, 2) + Math.pow(shapeA.y - shapeB.y, 2));
  if (centerDist < SHAPE_SIZE * 0.8) {
    // If centers are very close, likely to overlap
    return true;
  }
  
  return false;
}

// Utility function to shuffle an array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Create UI controls for auto placement
function setupAutoPlacementUI() {
  const buttonY = CANVAS_SIZE_H + 40; // Position below other controls
  
  // Input for number of squares
  createSpan('Squares: ').position(10, buttonY);
  const squaresInput = createInput('5', 'number');
  squaresInput.position(70, buttonY);
  squaresInput.size(30);
  squaresInput.attribute('min', '0');
  squaresInput.attribute('max', '10');
  
  // Input for number of triangles
  createSpan('Triangles: ').position(120, buttonY);
  const trianglesInput = createInput('5', 'number');
  trianglesInput.position(180, buttonY);
  trianglesInput.size(30);
  trianglesInput.attribute('min', '0');
  trianglesInput.attribute('max', '10');
  
  // Auto-place button
  const autoPlaceButton = createButton('Auto-Place Shapes [a]');
  autoPlaceButton.position(230, buttonY);
  autoPlaceButton.mousePressed(() => {
    if (isCapturingMode) return;
    
    const numSquares = parseInt(squaresInput.value());
    const numTriangles = parseInt(trianglesInput.value());
    
    autoPlaceShapes(numSquares, numTriangles);
  });
  
  // Add keyboard shortcut
  const originalKeyPressed = window.keyPressed;
  window.keyPressed = function() {
    if (originalKeyPressed) originalKeyPressed();
    
    if (!isCapturingMode && key === 'a') {
      const numSquares = parseInt(squaresInput.value());
      const numTriangles = parseInt(trianglesInput.value());
      autoPlaceShapes(numSquares, numTriangles);
    }
  };
}

// Call this function after your original setup
function initAutoPlacement() {
  // Add auto placement UI
  setupAutoPlacementUI();
  
  console.log("Auto placement initialized - Press 'a' to auto-place shapes");
}

// Call this at the end of your setup function:
// initAutoPlacement();