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
    const imageDiv = select("#resulting_image");
    feedback.html("Waiting for reply");
    let data = {
        version: "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
        input: {
            prompt: p_prompt,
            system_prompt: "Analyze the emotional weight of the following text. Use the following guidelines: Identify any emotions present in the text (e.g., anger, sadness, fear, joy, etc.). Assign a numerical weight to each detected emotion: Negative emotions (e.g., anger, sadness, fear, disgust): Contribute a positive weight between 0 (low intensity) and 1 (high intensity) based on their intensity. Positive emotions (e.g., joy, love, excitement): Contribute a weight of 0. Neutral emotions or absence of strong emotions: Contribute a weight of 0. Combine the weights of all detected emotions to calculate the total emotional weight of the text. Text to analyze: " 
          
          + sys_p.value() +

          "Expected Output: Detected emotions: [list of emotions and their intensities] Weights: [numerical values for each emotion] Total Emotional Weight: [single number representing the combined weight]"
  
        },
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

async function convertToSpeech(p_prompt) {
    let data = {
        version: "684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
        input: {
            text: p_prompt,
            speaker: "./james.mp3",
            language: "en",
            cleanup_voice: false,
        },
    };

    console.log("Requesting Speech Conversion From Replicate via Proxy", data);
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };

    const url = replicateProxy + "/create_n_get/";
    console.log("url", url, "options", options);

    try {
        const response = await fetch(url, options);
        const proxy_said = await response.json();

        console.log("Full Response:", proxy_said);

        if (proxy_said && proxy_said.output) {
            console.log("Output object:", proxy_said.output);

            if (proxy_said.output.audio) {
                console.log("proxy_said", proxy_said.output.audio);
                playAudio(proxy_said.output.audio);
            } else {
                console.error("No audio URL found in output:", proxy_said.output);
                playAudio(proxy_said.output);
                downloadAudio(proxy_said.output);
            }
        } else {
            console.error("Unexpected response format or missing 'output' field:", proxy_said);
            alert("An error occurred while generating speech. Please check the console for more details.");
        }
    } catch (error) {
        console.error("Error during the request:", error);
        alert("An error occurred while generating speech. Please check the console for more details.");
    }
}

async function playAudio(audioUrl) {
    try {
        const ctx = new AudioContext();
        let response = await fetch(audioUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
        }
        let arrayBuffer = await response.arrayBuffer();
        let decodedAudio = await ctx.decodeAudioData(arrayBuffer);
        const source = ctx.createBufferSource();
        source.buffer = decodedAudio;
        source.connect(ctx.destination);
        source.start();
    } catch (error) {
        console.error("Error playing the audio:", error);
        alert("Failed to play the audio. Please check the console for more details.");
    }
}

function downloadAudio(audioUrl) {
    let a = createA(audioUrl, 'Download Audio');
    a.attribute('download', '');
    a.elt.click();
    a.remove(); // Clean up the link element after download
}
