const replicateProxy = "https://replicate-api-proxy.glitch.me";

// Variables for File 1
let feedback;
let feedback_txt;
let img;
let input_p;
let sys_p;
let button_ml;

// Variables for File 2
let input_text_field;
let button_speech;

function setup() {
    createCanvas(512, 512);

    // File 1 elements
    feedback = createP("");
    feedback.position(0, 20);

    input_p = createInput("");
    sys_p = createInput("")
    button_ml = createButton("Send to ML");
    button_ml.mousePressed(() => {
        ask(input_p.value());
    });

    // File 2 elements
    // input_text_field = createInput("Hello, how are you?");
    // input_text_field.size(600);
    // input_text_field.id("input_text_prompt");

    button_speech = createButton("Convert to Speech");
    button_speech.mousePressed(() => {
        convertToSpeech(feedback_txt);
    });
}

function draw() {
    background(255);

    // Display image if available (from File 1)
    if (img) image(img, 0, 0, width, height);

    // Display text (from File 2)
    textSize(32);
    textAlign(CENTER, CENTER);
    // text("Enter text and click the button to convert it to speech.", width / 2, height / 2);
}

async function ask(p_prompt) {
  // console.log(str(p_prompt))
    const imageDiv = select("#resulting_image");
    feedback.html("Waiting for reply");
    let data = {
        version: "b3546aeec6c9891f0dd9929c2d3bedbf013c12e02e7dd0346af09c37e008c827",
        input: {
           top_k: 50,
            top_p: 1,
            prompt: "Analyze the emotional weight of the following text. Use the following guidelines: Identify any emotions present in the text (e.g., anger, sadness, fear, joy, etc.). Assign a numerical weight to each detected emotion: Negative emotions (e.g., anger, sadness, fear, disgust): Contribute a positive weight between 0 (low intensity) and 1 (high intensity) based on their intensity. Positive emotions (e.g., joy, love, excitement): Contribute a weight of 0. Neutral emotions or absence of strong emotions: Contribute a weight of 0. Combine the weights of all detected emotions to calculate the total emotional weight of the text. Text to analyze: " 
          
          + p_prompt+

          "Expected Output: Detected emotions: [list of emotions and their intensities] Weights: [numerical values for each emotion] Total Emotional Weight: [single number representing the combined weight]",
            decoding: "top_p",
            max_length: 50,
            temperature: 0.75,
            repetition_penalty: 1.2
        }
    };
    console.log("Asking for Picture Info From Replicate via Proxy", data);
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    const url = replicateProxy + "/create_n_get/";
    const picture_info = await fetch(url, options);
    const proxy_said = await picture_info.json();
    if (proxy_said.output.length == 0) {
        feedback.html("Something went wrong, try it again");
    } else {
        feedback.html("");
        const stuffBackFromFetch = await fetch(url, options);
        let JSON_format = await stuffBackFromFetch.json();
        console.log(JSON_format);
        output_j = JSON_format.output.join("");
        console.log(output_j);
        feedback.html(output_j);
        feedback_txt = output_j;
    }
}
