// Machine Learning for Creative Coding
// https://github.com/shiffman/ML-for-Creative-Coding

let conversationHistory = [];
let inputBox;
let chatLog = "";
let chatP;
let generator;
let progress = 0;

async function setup() {
  createCanvas(300, 10);
  inputBox = createInput();
  inputBox.size(300);
  let sendButton = createButton("Send");
  sendButton.mousePressed(sendMessage);
  chatP = createP();
  conversationHistory.push({
    role: "system",
    content: "You are ",
  });

  // Load the Transformers.js model pipeline
  let pipeline = await loadTransformers();
  generator = await pipeline(
    "text-generation",
    "onnx-community/Llama-3.2-1B-Instruct-q4f16",
    {
      dtype: "q4f16",
      device: "webgpu",
      progress_callback: (x) => {
        //console.log(x);
        progress = x.progress / 100;
        if (x.status !== "progress") {
          progress = 1;
        }
      },
    }
  );
}

async function sendMessage() {
  let userInput = inputBox.value();
  conversationHistory.push({ role: "user", content: userInput });
  chatLog = `You: ${userInput}</br></br>` + chatLog;
  chatP.html(chatLog);

  if (generator) {
    // Generate a response based on the input prompt
    const output = await generator(conversationHistory, {
      max_new_tokens: 128,
    });
    const reply = output[0].generated_text.at(-1).content;
    conversationHistory.push({ role: "assistant", content: reply });
    chatLog = `Chatbot: ${reply}</br></br>` + chatLog;
    chatP.html(chatLog);
  } else {
    console.log("Model not loaded yet, try again in a minute.");
  }
}

function draw() {
  background(240);
  fill(100, 100, 255);
  rect(0, 0, progress * width, height);
  noFill();
  stroke(0);
  rect(0, 0, progress * width, height);
}
