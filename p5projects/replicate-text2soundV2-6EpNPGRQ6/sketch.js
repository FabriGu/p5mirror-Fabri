const replicateProxy = "https://replicate-api-proxy.glitch.me";

function setup() {
    createCanvas(512, 512);
    let input_text_field = createInput("Hello, how are you?");
    input_text_field.size(600);
    input_text_field.id("input_text_prompt");

    let button = createButton("Convert to Speech");
    button.mousePressed(() => {
        convertToSpeech(input_text_field.value());
    });
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

        // Manually inspect the output object to see what it contains
        if (proxy_said && proxy_said.output) {
            console.log("Output object:", proxy_said.output);

            // If 'audio' key exists, proceed; otherwise, log a message
            if (proxy_said.output.audio) {
                console.log("proxy_said", proxy_said.output.audio);
                playAudio(proxy_said.output.audio);
            } else {
                console.error("No audio URL found in output:", proxy_said.output);
//                 alert("Failed to generate speech. Please try again.");
              playAudio(proxy_said.output)
              downloadAudio(proxy_said.output)
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
        let incomingData = await fetch(audioUrl);
        let arrayBuffer = await incomingData.arrayBuffer();
        let decodedAudio = await ctx.decodeAudioData(arrayBuffer);
        const playSound = ctx.createBufferSource();
        playSound.buffer = decodedAudio;
        playSound.connect(ctx.destination);
        playSound.start(ctx.currentTime);
    } catch (error) {
        console.error("Error playing the audio:", error);
        alert("Failed to play the audio. Please check the console for more details.");
    }
}

function draw() {
    background(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Enter text and click the button to convert it to speech.", width / 2, height / 2);
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
