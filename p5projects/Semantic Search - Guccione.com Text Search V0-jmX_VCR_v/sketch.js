// ML for Creative Coding
// https://github.com/shiffman/ML-for-Creative-Coding

// Store answers and their embeddings
let answers = [];
let answerEmbeddings = [];
let questionInput;
let askButton;
let resultsDiv;
let statusDiv;
let isModelLoaded = false;

let extractor;

// Function to load transformers.js dynamically
async function loadTransformers() {
  console.log("Loading transformers.js...");
  const module = await import(
    "https://cdn.jsdelivr.net/npm/@huggingface/transformers"
  );
  const { pipeline } = module;
  console.log("Transformers.js loaded successfully.");
  return pipeline;
}

async function setup() {
  noCanvas();

  // Create UI elements
  statusDiv = createP("Loading answers...");

  questionInput = createInput("Who painted the Mona Lisa?");
  questionInput.attribute("placeholder", "Ask a question");
  questionInput.size(300);

  askButton = createButton("Ask");
  askButton.mousePressed(processQuestion);

  resultsDiv = createDiv("");

  // Load answers from file
  answers = await loadAnswers();

  statusDiv.html(
    `Loaded ${answers.length} answers. Loading embedding model...`
  );

  let pipeline = await loadTransformers();
  extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  statusDiv.html("Calculating embeddings...");

  // Calculate embeddings for all answers
  answerEmbeddings = await getEmbeddings(answers);

  statusDiv.html("Ready! Ask a question.");
}

// Function to get embeddings for a list of texts
async function getEmbeddings(texts) {
  // Store embeddings for each text
  let embeddings = [];
  for (let text of texts) {
    let output = await extractor(text, { pooling: "mean", normalize: true });
    embeddings.push(output.data);
  }
  console.log(embeddings);
  return embeddings;
}

// Load answers from a text file
async function loadAnswers() {
  try {
    const response = await fetch("answers.txt");
    if (!response.ok) {
      throw new Error("Failed to load answers.txt");
    }
    const text = await response.text();

    // Split the text file by lines and filter out empty lines
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return lines;
  } catch (error) {
    console.error("Error loading answers:", error);
    statusDiv.html("Error loading answers file. Check console for details.");
    return [];
  }
}

// Calculate cosine similarity between two embedding vectors
function cosineSimilarity(vecA, vecB) {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

// Function to calculate dot product of two vectors
function dotProduct(vecA, vecB) {
  return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
}

// Function to calculate the magnitude of a vector
function magnitude(vec) {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

// Process a user question
async function processQuestion() {
  const question = questionInput.value().trim();
  if (question.length === 0) return;
  statusDiv.html("Processing question...");

  // Get embedding for the question
  let questionEmbedding = await getEmbeddings([question]);

  // Calculate similarity scores with all answers
  let similarities = [];
  for (let i = 0; i < answers.length; i++) {
    let score = cosineSimilarity(questionEmbedding[0], answerEmbeddings[i]);
    similarities.push({
      answer: answers[i],
      score: score,
    });
  }

  // Sort by similarity (highest first)
  similarities.sort((a, b) => b.score - a.score);

  // Display results
  let resultsHTML = "";

  for (let i = 0; i < 5; i++) {
    const result = similarities[i];
    resultsHTML += `
      <p>
        <strong>${result.answer}</strong><br>
        <em>Similarity: ${result.score.toFixed(4)}</em>
      </p>
    `;
  }

  resultsDiv.html(resultsHTML);
  statusDiv.html("Ready for next question");
}
