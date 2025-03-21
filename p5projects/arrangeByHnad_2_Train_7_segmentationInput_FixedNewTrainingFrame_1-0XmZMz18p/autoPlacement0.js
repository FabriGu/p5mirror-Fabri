// Auto Shape Placement Algorithm
// This file should be included after your main sketch.js file

// Main function to automatically place shapes on the segmentation mask
function autoPlaceShapes(numSquares, numTriangles) {
  // Clear existing shapes
  shapes = [];
  
  // Get the total number of shapes to place
  const totalShapes = numSquares + numTriangles;
  if (totalShapes <= 0) return;
  
  // 1. First, find potential anchor points (pixels with high alpha values in the mask)
  const anchorPoints = findAnchorPoints();
  if (anchorPoints.length === 0) {
    console.log("No suitable anchor points found in the mask");
    return;
  }
  
  // 2. Place the first shape at a good starting position (center of mass)
  const centerPoint = findCenterOfMass(anchorPoints);
  const firstShape = createShape(numSquares > 0 ? 'square' : 'triangle', centerPoint.x, centerPoint.y);
  shapes.push(firstShape);
  
  // 3. Place remaining shapes using a growing algorithm
  placeRemainingShapes(numSquares - (numSquares > 0 ? 1 : 0), numTriangles - (numTriangles > 0 && numSquares === 0 ? 1 : 0), anchorPoints);
  
  // 4. Optimize the arrangement to better fit the silhouette
  optimizeShapePlacement(anchorPoints);
  
  console.log(`Auto-placed ${shapes.length} shapes (${shapes.filter(s => s.type === 'square').length} squares, ${shapes.filter(s => s.type === 'triangle').length} triangles)`);
}

// Find suitable anchor points in the segmentation mask
function findAnchorPoints() {
  const points = [];
  const cellWidth = CANVAS_SIZE_W / GRID_SIZE_W;
  const cellHeight = CANVAS_SIZE_H / GRID_SIZE_H;
  
  // We'll sample from the downsampled mask for efficiency
  for (let y = 0; y < GRID_SIZE_H; y++) {
    for (let x = 0; x < GRID_SIZE_W; x++) {
      const index = y * GRID_SIZE_W + x;
      const alphaValue = downsampledMaskActualAlphaArray[index];
      
      // Only consider points with high alpha (person pixels)
      if (alphaValue > 128) {
        points.push({
          x: x * cellWidth + cellWidth/2,
          y: y * cellHeight + cellHeight/2,
          weight: alphaValue / 255 // Normalize to 0-1
        });
      }
    }
  }
  
  return points;
}

// Find center of mass from anchor points
function findCenterOfMass(points) {
  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;
  
  points.forEach(point => {
    totalWeight += point.weight;
    weightedX += point.x * point.weight;
    weightedY += point.y * point.weight;
  });
  
  if (totalWeight === 0) {
    // Fallback if no weights
    return { 
      x: CANVAS_SIZE_W / 2, 
      y: CANVAS_SIZE_H / 2 
    };
  }
  
  return {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight
  };
}

// Create a new shape with appropriate attributes
function createShape(type, x, y) {
  const shape = new Shape(type, x, y);
  // Add some randomization to rotation
  shape.rotation = random(-PI/4, PI/4);
  return shape;
}

// Place the remaining shapes using a growing structure algorithm
function placeRemainingShapes(squaresLeft, trianglesLeft, anchorPoints) {
  // Keep track of shapes we've tried to connect from
  const shapesToTryFrom = [...shapes];
  const shapesUsedAsAnchors = new Set();
  
  // For skeleton-like structures, we want to prioritize certain growth patterns
  // 1. Start from the center (already done)
  // 2. Grow outward, with preference to growing toward high-density areas
  
  while ((squaresLeft > 0 || trianglesLeft > 0) && shapesToTryFrom.length > 0) {
    // Get the next shape to try connections from
    const baseShape = shapesToTryFrom.shift();
    shapesUsedAsAnchors.add(baseShape);
    
    // Find the best connection point on this shape
    const connectionPoints = baseShape.getTransformedPoints();
    
    // Try each connection point
    for (let i = 0; i < connectionPoints.length; i++) {
      // Skip if we've placed all shapes
      if (squaresLeft <= 0 && trianglesLeft <= 0) break;
      
      const point = connectionPoints[i];
      
      // Skip points that already have connections
      if (baseShape.connections[i] && baseShape.connections[i].length > 0) continue;
      
      // Decide which type of shape to place
      const shapeType = squaresLeft > trianglesLeft ? 'square' : 'triangle';
      
      // Determine a good direction to grow (toward mask density)
      const growthDirection = findGrowthDirection(point, anchorPoints);
      
      // Create a new shape at the connection point
      const newX = point.x + growthDirection.x * SHAPE_SIZE;
      const newY = point.y + growthDirection.y * SHAPE_SIZE;
      
      // Check if this position is valid (within mask and not overlapping)
      if (isPositionValid(newX, newY, anchorPoints)) {
        const newShape = createShape(shapeType, newX, newY);
        
        // Try to connect it to the base shape
        connectShapes(baseShape, i, newShape);
        
        // Update counters
        if (shapeType === 'square') squaresLeft--;
        else trianglesLeft--;
        
        // Add to shapes and to the queue for further connections
        shapes.push(newShape);
        shapesToTryFrom.push(newShape);
      }
    }
  }
  
  // If we still have shapes to place but couldn't connect them naturally,
  // try forced placement
  if (squaresLeft > 0 || trianglesLeft > 0) {
    forcePlaceRemainingShapes(squaresLeft, trianglesLeft, anchorPoints);
  }
}

// Find growth direction based on mask density
function findGrowthDirection(point, anchorPoints) {
  // Default direction (random)
  let dx = random(-1, 1);
  let dy = random(-1, 1);
  
  // Search radius
  const radius = SHAPE_SIZE * 2;
  
  // Find nearby anchor points
  const nearbyPoints = anchorPoints.filter(anchor => {
    const dist = Math.sqrt(Math.pow(anchor.x - point.x, 2) + Math.pow(anchor.y - point.y, 2));
    return dist < radius;
  });
  
  if (nearbyPoints.length > 0) {
    // Calculate weighted average direction
    let weightedDx = 0;
    let weightedDy = 0;
    let totalWeight = 0;
    
    nearbyPoints.forEach(anchor => {
      const dx = anchor.x - point.x;
      const dy = anchor.y - point.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Weight inversely by distance and by anchor weight
      const weight = anchor.weight / Math.max(1, dist);
      
      weightedDx += dx * weight;
      weightedDy += dy * weight;
      totalWeight += weight;
    });
    
    if (totalWeight > 0) {
      dx = weightedDx / totalWeight;
      dy = weightedDy / totalWeight;
      
      // Normalize
      const len = Math.sqrt(dx*dx + dy*dy);
      if (len > 0) {
        dx /= len;
        dy /= len;
      }
    }
  }
  
  return { x: dx, y: dy };
}

// Check if a position is valid for placing a shape
function isPositionValid(x, y, anchorPoints) {
  // Check if within canvas bounds with padding
  const padding = SHAPE_SIZE;
  if (x < padding || x > CANVAS_SIZE_W - padding || 
      y < padding || y > CANVAS_SIZE_H - padding) {
    return false;
  }
  
  // Check if position overlaps with existing shapes
  for (const shape of shapes) {
    const dist = Math.sqrt(Math.pow(shape.x - x, 2) + Math.pow(shape.y - y, 2));
    if (dist < SHAPE_SIZE * 1.2) { // Allow some overlap
      return false;
    }
  }
  
  // Check if position is within the mask (at least somewhat)
  const nearbyPoints = anchorPoints.filter(anchor => {
    const dist = Math.sqrt(Math.pow(anchor.x - x, 2) + Math.pow(anchor.y - y, 2));
    return dist < SHAPE_SIZE;
  });
  
  // Require at least some nearby anchor points
  return nearbyPoints.length > 0;
}

// Connect two shapes together
function connectShapes(shapeA, pointIndexA, shapeB) {
  // Find the closest point on shape B to connect with
  const pointA = shapeA.getTransformedPoints()[pointIndexA];
  const pointsB = shapeB.getTransformedPoints();
  
  let closestIndex = 0;
  let closestDist = Infinity;
  
  for (let i = 0; i < pointsB.length; i++) {
    const dist = Math.sqrt(
      Math.pow(pointsB[i].x - pointA.x, 2) + 
      Math.pow(pointsB[i].y - pointA.y, 2)
    );
    
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  }
  
  // Add connections both ways
  if (!shapeA.connections[pointIndexA]) shapeA.connections[pointIndexA] = [];
  shapeA.connections[pointIndexA].push({ shape: shapeB, pointIndex: closestIndex });
  
  if (!shapeB.connections[closestIndex]) shapeB.connections[closestIndex] = [];
  shapeB.connections[closestIndex].push({ shape: shapeA, pointIndex: pointIndexA });
  
  // Move shape B to better align the connection points
  // This helps create more natural-looking connections
  const targetX = pointA.x;
  const targetY = pointA.y;
  const actualX = pointsB[closestIndex].x;
  const actualY = pointsB[closestIndex].y;
  
  shapeB.x += (targetX - actualX);
  shapeB.y += (targetY - actualY);
}

// Place remaining shapes if normal growth algorithm couldn't place them all
function forcePlaceRemainingShapes(squaresLeft, trianglesLeft, anchorPoints) {
  // Find unconnected points on existing shapes
  const unconnectedPoints = [];
  
  shapes.forEach(shape => {
    const points = shape.getTransformedPoints();
    for (let i = 0; i < points.length; i++) {
      if (!shape.connections[i] || shape.connections[i].length === 0) {
        unconnectedPoints.push({
          shape: shape,
          pointIndex: i,
          x: points[i].x,
          y: points[i].y
        });
      }
    }
  });
  
  // If no unconnected points, find good anchor points in the mask
  if (unconnectedPoints.length === 0) {
    // Get top anchor points by weight
    const sortedAnchorPoints = [...anchorPoints].sort((a, b) => b.weight - a.weight);
    const topAnchorPoints = sortedAnchorPoints.slice(0, 10); // Take top 10
    
    // Place shapes at these anchor points
    let shapesPlaced = 0;
    for (const anchor of topAnchorPoints) {
      if (squaresLeft <= 0 && trianglesLeft <= 0) break;
      
      const shapeType = squaresLeft > 0 ? 'square' : 'triangle';
      const newShape = createShape(shapeType, anchor.x, anchor.y);
      
      // Update counters
      if (shapeType === 'square') squaresLeft--;
      else trianglesLeft--;
      
      shapes.push(newShape);
      shapesPlaced++;
    }
    
    // Try to connect the isolated shapes if possible
    if (shapesPlaced > 0) {
      tryConnectIsolatedShapes();
    }
  } else {
    // Use unconnected points to place remaining shapes
    while ((squaresLeft > 0 || trianglesLeft > 0) && unconnectedPoints.length > 0) {
      const connectionPoint = unconnectedPoints.pop();
      const shapeType = squaresLeft > 0 ? 'square' : 'triangle';
      
      // Create new shape
      const newShape = createShape(shapeType, 
        connectionPoint.x + random(-SHAPE_SIZE, SHAPE_SIZE),
        connectionPoint.y + random(-SHAPE_SIZE, SHAPE_SIZE)
      );
      
      // Try to connect to the base shape
      connectShapes(connectionPoint.shape, connectionPoint.pointIndex, newShape);
      
      // Update counters
      if (shapeType === 'square') squaresLeft--;
      else trianglesLeft--;
      
      shapes.push(newShape);
    }
  }
}

// Try to connect shapes that were placed in isolation
function tryConnectIsolatedShapes() {
  for (let i = 0; i < shapes.length; i++) {
    const shapeA = shapes[i];
    const pointsA = shapeA.getTransformedPoints();
    
    // Check if this shape has any connections
    let hasConnections = false;
    for (let p = 0; p < pointsA.length; p++) {
      if (shapeA.connections[p] && shapeA.connections[p].length > 0) {
        hasConnections = true;
        break;
      }
    }
    
    // If no connections, try to connect to nearest shape
    if (!hasConnections) {
      let closestDist = Infinity;
      let closestShape = null;
      let closestPointA = 0;
      let closestPointB = 0;
      
      for (let j = 0; j < shapes.length; j++) {
        if (i === j) continue;
        
        const shapeB = shapes[j];
        const pointsB = shapeB.getTransformedPoints();
        
        for (let pa = 0; pa < pointsA.length; pa++) {
          for (let pb = 0; pb < pointsB.length; pb++) {
            const dist = Math.sqrt(
              Math.pow(pointsA[pa].x - pointsB[pb].x, 2) + 
              Math.pow(pointsA[pa].y - pointsB[pb].y, 2)
            );
            
            if (dist < closestDist) {
              closestDist = dist;
              closestShape = shapeB;
              closestPointA = pa;
              closestPointB = pb;
            }
          }
        }
      }
      
      // Connect to the closest shape if it's within a reasonable distance
      if (closestShape && closestDist < SHAPE_SIZE * 3) {
        connectShapes(shapeA, closestPointA, closestShape);
        
        // Move shape to better align with the connection
        const pointA = pointsA[closestPointA];
        const pointB = closestShape.getTransformedPoints()[closestPointB];
        
        // Move halfway to create a better connection
        shapeA.x += (pointB.x - pointA.x) / 2;
        shapeA.y += (pointB.y - pointA.y) / 2;
      }
    }
  }
}

// Optimize shape placement to better fit the silhouette
function optimizeShapePlacement(anchorPoints) {
  // Use a simple optimization: adjust each shape to better fit within the mask
  for (const shape of shapes) {
    // Sample mask at current position
    const shapeCoverage = calculateShapeCoverage(shape, anchorPoints);
    
    // Try small adjustments to improve coverage
    const adjustments = [
      { dx: 5, dy: 0 }, { dx: -5, dy: 0 }, 
      { dx: 0, dy: 5 }, { dx: 0, dy: -5 },
      { dr: PI/16 }, { dr: -PI/16 }
    ];
    
    for (const adj of adjustments) {
      // Apply adjustment
      if (adj.dx !== undefined) {
        shape.x += adj.dx;
        shape.y += adj.dy;
      } else {
        shape.rotation += adj.dr;
      }
      
      // Calculate new coverage
      const newCoverage = calculateShapeCoverage(shape, anchorPoints);
      
      // If not improved, revert
      if (newCoverage <= shapeCoverage) {
        if (adj.dx !== undefined) {
          shape.x -= adj.dx;
          shape.y -= adj.dy;
        } else {
          shape.rotation -= adj.dr;
        }
      }
    }
  }
}

// Calculate how well a shape covers the mask
function calculateShapeCoverage(shape, anchorPoints) {
  const points = shape.getTransformedPoints();
  let totalCoverage = 0;
  
  // Check each vertex of the shape
  for (const point of points) {
    // Find nearby anchor points
    const nearbyPoints = anchorPoints.filter(anchor => {
      const dist = Math.sqrt(Math.pow(anchor.x - point.x, 2) + Math.pow(anchor.y - point.y, 2));
      return dist < SHAPE_SIZE / 2;
    });
    
    // Add weights of nearby points to coverage
    for (const nearby of nearbyPoints) {
      totalCoverage += nearby.weight;
    }
  }
  
  return totalCoverage;
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