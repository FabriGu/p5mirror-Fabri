const replicateProxy = "https://replicate-api-proxy.glitch.me"
let feedback;

function setup() {
    feedback = createP("");
    let input_field = createInput("Why should learn to use a machine learning API?");
    input_field.id("input_prompt");
    input_field.size(450);
    let myButton = createButton("AskWords");
    myButton.mousePressed(() => {
        askForWords(input_field.value());
    });
}

function draw() {

}


async function askForWords(p_prompt) {
    document.body.style.cursor = "progress";
    feedback.html("Waiting for reply from API...");
    const data = {
        "version": "2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48",
        input: {
            prompt: "Analyze the emotional weight of the following text. Use the following guidelines: Identify any emotions present in the text (e.g., anger, sadness, fear, joy, etc.). Assign a numerical weight to each detected emotion: Negative emotions (e.g., anger, sadness, fear, disgust): Contribute a positive weight between 0 (low intensity) and 1 (high intensity) based on their intensity. Positive emotions (e.g., joy, love, excitement): Contribute a weight of 0. Neutral emotions or absence of strong emotions: Contribute a weight of 0. Combine the weights of all detected emotions to calculate the total emotional weight of the text. Text to analyze: " + p_prompt+ "Expected Output: Detected emotions: [list of emotions and their intensities] Weights: [numerical values for each emotion] Total Emotional Weight: [single number representing the combined weight]",
            max_tokens: 100,
            max_length: 100,
        },
    };
    console.log("Asking for Words From Replicate via Proxy", data);
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: 'application/json',
        },
        body: JSON.stringify(data),
    };
    const url = replicateProxy + "/create_n_get/"
    console.log("words url", url, "words options", options);
    const words_response = await fetch(url, options);
    //turn it into json
    const proxy_said = await words_response.json();
    console.log("words_json", proxy_said);
    if (proxy_said.output.length == 0) {
        feedback.html("Something went wrong, try it again");
    } else {
        feedback.html("");
        console.log("proxy_said", proxy_said.output.join(""));
        let incomingText = proxy_said.output.join("");
        createP(incomingText);
    }
    document.body.style.cursor = "auto";
}
