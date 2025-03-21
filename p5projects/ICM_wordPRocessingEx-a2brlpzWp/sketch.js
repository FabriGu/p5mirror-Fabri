let p;
let str = "";

let words = [];
let turkeyTale;

function preload() {
  turkeyTale = loadStrings('turkey.txt', parseWords);
  console.log(turkeyTale)
}

function setup() {
  // createCanvas(400, 400);
  noCanvas();
  p = createP();
  
  
}

function draw() {
  background(220);
  if (frameCount % 5 == 1) {
    str += random(words) + " ";
    p.html(str);
    
  }
}

function parseWords(lines) {
  for (let line of lines) {
    let tokens = splitTokens(line)
        console.log(tokens)
   
      words.push(...tokens);
    // words.concat(tokens);
    
    // words.push(tokens);
  }
  
  for (let w in words) {
    let word = words[w]
    word = word.trim();
    word = word.toLowerCase();
    word = word.replace(/[-_?.!:;,()]/g, '')
    words[w] = word
  }
}