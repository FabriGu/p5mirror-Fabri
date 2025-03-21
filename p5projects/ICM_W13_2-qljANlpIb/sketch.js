// Part of the sketch was taken from Mimi Yin's example provided in the github

// Array of words
let words = [];

// Variable to hold the random string being built
let str = '';

// Paragraph element to hold the text
let p;

let indexArr;
let c = 0;

function preload() {
  loadStrings('tongue-twister.txt', process);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  p = createP();
  // alter frameRate to make the tongue twister still generate sequentially but quick
  frameRate(20);
  // create a random sequence of index values that are non repeating
  indexArr = [];
  for (let i = 0; i < words.length; i++) {
    indexArr[i] = i;
  }
  indexArr = shuffleArr(indexArr);
}

function draw() {
  if (c < words.length) {
    // Add another word to the string and a whitespace
    str += words[indexArr[c]] + ' ';
    // Update paragraph element
    p.html(str);   
    c++;
  }
}

function process(lines) {
  // Go line by line by value
  for (let line of lines) {
    // Turn each line into an array of words
    let tokens = splitTokens(line);
    // Add it to 1 big array
    words = words.concat(tokens);
  }
  // Go word by word, by index
  // Clean up each word
  for (let w = words.length-1; w >= 0; w--) {
    let word = words[w];
    // Remove punctuation
    word = word.replace(/[-_:;.,!?()''``""]/g, "");
    // Make it all lowercase
    word = word.toLowerCase();
    // Get rid of whitespace around the word
    word = word.trim();
    // If nothing is left, get rid of it
    if (word.length < 1) words.splice(w, 1);
    // Otherwise put cleaned up word back in array
    else words[w] = word;
  }
}
  
// Function to apply the Fisher-Yates Shuffle taken from https://www.geeksforgeeks.org/how-to-shuffle-an-array-using-javascript/ 
function shuffleArr(array) {

    // Iterate over the array in reverse order
    for (let i = array.length - 1; i > 0; i--) {

        // Generate Random Index
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}