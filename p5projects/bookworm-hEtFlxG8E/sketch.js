const threeLetterWords = [
  "ace", "act", "add", "age", "ago", "aid", "aim", "air", "all", "amp", "and", "any", "ape", "apt", "arc", "are", "ark", "arm", "art", "ash", "ask", "ass", "ate", "axe", "bad", "bag", "ban", "bar", "bat", "bay", "bed", "bee", "bet", "bid", "big", "bin", "bit", "boa", "bob", "bog", "boo", "bow", "box", "boy", "bra", "bud", "bug", "bum", "bun", "bus", "but", "buy", "bye", "cab", "cam", "can", "cap", "car", "cat", "caw", "chi", "cob", "cod", "cog", "con", "cop", "cot", "cow", "coy", "cry", "cub", "cue", "cup", "cut", "dad", "dam", "day", "den", "dew", "did", "die", "dig", "dim", "dip", "doe", "dog", "don", "dot", "dry", "dub", "due", "dug", "dun", "ear", "eat", "eel", "egg", "ego", "elf", "elk", "end", "era", "eve", "eye", "fan", "far", "fat", "fax", "fed", "fee", "few", "fib", "fig", "fin", "fit", "fix", "fly", "foe", "fog", "for", "fox", "fry", "fun", "fur", "gag", "gap", "gas", "gel", "gem", "get", "gin", "got", "gum", "gun", "gut", "guy", "gym", "had", "has", "hat", "hay", "her", "hey", "hid", "him", "hip", "his", "hit", "hog", "hop", "hot", "how", "hub", "hug", "hum", "hun", "hut", "ice", "icy", "ill", "imp", "ink", "inn", "ion", "its", "ivy", "jar", "jaw", "jet", "jig", "job", "jog", "joy", "jug", "keg", "key", "kid", "kin", "kit", "lab", "lad", "lag", "lap", "law", "lay", "lea", "led", "leg", "let", "lid", "lie", "lip", "lit", "lob", "log", "lot", "low", "mad", "man", "map", "mat", "may", "men", "met", "mew", "mix", "mob", "mod", "mom", "moo", "mop", "mud", "mug", "mum", "nap", "nay", "net", "new", "nil", "nip", "nod", "nor", "not", "now", "nut", "oak", "oar", "oat", "odd", "off", "oil", "old", "one", "opt", "orb", "ore", "our", "out", "owl", "own", "pad", "pal", "pan", "paw", "pay", "pea", "peg", "pen", "per", "pet", "pew", "pie", "pig", "pin", "pit", "ply", "pod", "pop", "pot", "pro", "pub", "pun", "pup", "put", "rag", "ran", "rap", "rat", "raw", "ray", "red", "rib", "rid", "rig", "rim", "rip", "rob", "rod", "roe", "rot", "row", "rub", "rug", "rum", "run", "rut", "sad", "sap", "sat", "saw", "say", "sea", "see", "set", "sex", "she", "shy", "sir", "sis", "sit", "ski", "sky", "sly", "sob", "son", "sow", "spa", "spy", "sub", "sum", "sun", "tab", "tad", "tag", "tan", "tap", "tar", "tax", "tea", "ten", "the", "tie", "tin", "tip", "toe", "too", "top", "toy", "try", "tub", "tug", "tun", "two", "urn", "use", "van", "vat", "vet", "vie", "vim", "wad", "wag", "wan", "war", "was", "way", "web", "wed", "wet", "who", "why", "wig", "win", "wit", "wok", "won", "woo", "wot", "wow", "yak", "yam", "yap", "yaw", "yea", "yen", "yes", "yet", "yew", "yip", "yuk", "yum", "zap", "zen", "zig", "zip", "zoo"
];



let ate = [];
let points = 0;
let correct = false;

// Copyright (c) 2023 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

//inspired by text rain
//https://camilleutterback.com/projects/text-rain/

let letters = [];
let alphabet = "abcdefghijklmnopqrstuvwxyz";

// Copyright (c) 2023 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

let facemesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: true };

// Copyright (c) 2023 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// let myMask;


function preload() {
  // Load the facemesh model
  facemesh = ml5.facemesh(options);
}

function setup() {

  createCanvas(640, 480);

  for (var i = 0; i < 25; i++) {
    let randomLetter = alphabet.charAt(random(alphabet.length));
    let thisLetterObject = {
      x: i * 50,
      y: random(height),
      letter: randomLetter,
      dir: 0.8,
      checkOverlap: function(otherX, otherY, dia) {
        let distance = Math.sqrt((this.x - otherX) ** 2 + (this.y - otherY) ** 2);
        // let radius = distance / 2;
        let radius = dia/2
        
        if (distance <= radius) {
          push()
          fill(255,0,0)
          // circle(this.x, this.y, 20)
          ate.push(this.letter)
          // console.log(letters.findIndex())
          console.log()
          letters.splice(letters.indexOf(this), 1)
          // letters[letters.indexOf(this)].remove()
          pop()
          // console.log(true)
            return true; 
        } else {
          push()
          // circle(this.x, this.y, 20)
          pop()
          // console.log(false)
            return false; 
        }
      }
    };
    letters.push(thisLetterObject);
  }
  textSize(40);
  
  // face mesh
  // createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  // Start detecting faces from the webcam video
  facemesh.detectStart(video, gotFaces);
  myMask = createGraphics(width,height);
}

function draw() {
  background(255);
  // Draw the webcam video
  // image(video, 0, 0, width, height);

  drawPartsKeypoints();
  // drawPartsBoundingBox();
  
  // letters
  for (var i = 0; i < letters.length; i++) {
    let thisLetter = letters[i];

    thisLetter.y = thisLetter.y + thisLetter.dir;
    if (thisLetter.y > height){
      // thisLetter.y = 0;
      // thisLetter.remove()
      letters.splice(letters.indexOf(thisLetter), 1)
      addLetter();
    }
    push()
    fill(100,100,100)
    text(thisLetter.letter, thisLetter.x, thisLetter.y);
    pop()
  }
  if (ate.length == 3) {
    if (threeLetterWords.includes(join(ate, ""))) {
      points++;
    }
  
    ate = []
  }
  
  push()
  fill("red")
  text(join(ate, ""), 10, 40)
  text(points, width-30, 40)
  pop()
}


// Draw keypoints for specific face element positions
function drawPartsKeypoints() {
  // If there is at least one face
  let circleDiameter = 40;
  
  let impDots = []

  impDots = [35,25]
  if (faces.length > 0) {

    let mouthOpeningX = faces[0].lips.keypoints[impDots[0]].x
    let mouthOpeningY = (faces[0].lips.keypoints[impDots[0]].y + faces[0].lips.keypoints[impDots[1]].y)/2


    if(!checkOverlap(faces[0].lips.keypoints[impDots[0]].x, faces[0].lips.keypoints[impDots[0]].y, faces[0].lips.keypoints[impDots[1]].x, faces[0].lips.keypoints[impDots[1]].y, 10)) {
      

      //check letters
      for (var k = 0; k < letters.length; k++) {
        let thisLetter = letters[k];

        if (thisLetter.checkOverlap(mouthOpeningX, mouthOpeningY, circleDiameter)) {
          push()
          fill(255,0,0)
          circle(mouthOpeningX, mouthOpeningY, circleDiameter)
          
          pop()
        } else {
          push()
          fill(255,0,0)
          circle(mouthOpeningX, mouthOpeningY, circleDiameter)
         
          pop()
        }
        // pop()
      }
    } else {
      push()
      fill(0,0,0)
      // circle(mouthOpeningX, mouthOpeningY, circleDiameter-30)
      line(faces[0].lips.keypoints[impDots[0]].x-15, faces[0].lips.keypoints[impDots[0]].y, faces[0].lips.keypoints[impDots[1]].x+15, faces[0].lips.keypoints[impDots[1]].y)
      pop()
    }
  }
  
  
//   head
  
  if (faces.length > 0){
    for (let i = 100; i > 0; i-=20) {
      push()
      noStroke()
      fill(0, 255, 0, 50)
        circle(faces[0].faceOval.keypoints[18].x,faces[0].faceOval.keypoints[20].y-i+100, i)
      pop()
      push()
      
      if (i == 20) {
        
        fill("maroon")
        circle(faces[0].faceOval.keypoints[18].x,faces[0].faceOval.keypoints[20].y+220, 300)
        fill("black")
        circle(faces[0].faceOval.keypoints[18].x,faces[0].faceOval.keypoints[20].y+90, 25)
      }
      pop()
    
    }
     myMask.clear();
        myMask.noStroke();
        myMask.fill(0, 255, 0, 50);//some nice alphaa in fourth number
        myMask.beginShape();
        // Note: API changed here to have the points in .keypoints
      // let c = 100;
        for (var i = 0; i < faces[0].faceOval.keypoints.length; i++) {
            myMask.curveVertex(faces[0].faceOval.keypoints[i].x, faces[0].faceOval.keypoints[i].y);
          
        }
        myMask.endShape(CLOSE);
  }
  image(myMask,0,0)
 
  let avg1 = drawPartsBoundingBox("rightEye");
  let avg2 =drawPartsBoundingBox("leftEye");
  stroke(10)
  // console.log(avg1,avgY1,avgX2, avgY2)
  line(avg1[0]+23,avg1[1],avg2[0]-23, avg2[1])
  // pop()
}

function checkOverlap (thisX, thisY, otherX, otherY, dia) {
    let distance = Math.sqrt((thisX - otherX) ** 2 + (thisY - otherY) ** 2);
    // let radius = distance / 2;
    let radius = dia/2

    if (distance <= radius) {
      push()
      fill(255,0,0)
      circle(this.x, this.y, 20)
      pop()
      // console.log(true)
        return true; 
    } else {
      push()
      circle(this.x, this.y, 20)
      pop()
      // console.log(false)
        return false; 
    }
}

// Draw bounding box for specific face element positions
function drawPartsBoundingBox(option) {
  // If there is at least one face
  let glassDia = 50
  let avgX;
  let avgY;
  if (faces.length > 0) 
    if (option=="rightEye") {
      let lipsX = [];
      let lipsY = [];
      for (let i = 0; i < faces[0].rightEye.keypoints.length; i++) {
        // Find the lips
        let lips = faces[0].rightEye.keypoints[i];
        lipsX.push(lips.x);
        lipsY.push(lips.y);
      }
      // noFill();
      
      avgX= ((min(lipsX)+max(lipsX))/2)
      avgY=((min(lipsY)+max(lipsY))/2)
      push()
      fill("lightblue")
      circle(avgX, avgY, glassDia)
      fill("black")
      circle(avgX, avgY, 10)
      pop()
    } else if (option=="leftEye") {
      let lipsX = [];
      let lipsY = [];
      for (let i = 0; i < faces[0].leftEye.keypoints.length; i++) {
        // Find the lips
        let lips = faces[0].leftEye.keypoints[i];
        lipsX.push(lips.x);
        lipsY.push(lips.y);
      }
      // noFill();
      
      avgX= ((min(lipsX)+max(lipsX))/2)
      avgY=((min(lipsY)+max(lipsY))/2)
      push()
      fill("lightblue")
      
      circle(avgX, avgY, glassDia)
      fill("black")
      circle(avgX, avgY, 15)
      pop()
    }
    return [avgX, avgY]
    
  
}

// Callback function for when facemesh outputs data
function gotFaces(results) {
  // Save the output to the faces variable
  faces = results;
  // console.log(faces);
}

function addLetter() {
  let randomLetter = alphabet.charAt(random(alphabet.length));
    let thisLetterObject = {
      x: Math.random() * (width),
      y: 0,
      letter: randomLetter,
      dir: 0.8,
      checkOverlap: function(otherX, otherY, dia) {
        let distance = Math.sqrt((this.x - otherX) ** 2 + (this.y - otherY) ** 2);
        // let radius = distance / 2;
        let radius = dia/2
        
        if (distance <= radius) {
          push()
          fill(255,0,0)
          // circle(this.x, this.y, 20)
          ate.push(this.letter)
          // console.log(letters.findIndex())
          console.log()
          letters.splice(letters.indexOf(this), 1)
          // letters[letters.indexOf(this)].remove()
          pop()
          // console.log(true)
            return true; 
        } else {
          push()
          // circle(this.x, this.y, 20)
          pop()
          // console.log(false)
            return false; 
        }
      }
    };
    letters.push(thisLetterObject);
}


