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
            speaker: "https://replicate.delivery/pbxt/Jt79w0xsT64R1JsiJ0LQRL8UcWspg5J4RFrU6YwEKpOT1ukS/male.wav",
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
        if (response.status === 404) {
            console.error("404 Error: The requested resource could not be found. Please check the URL and model version.");
            alert("404 Error: The requested resource could not be found. Please check the console for details.");
            return;
        }

        const proxy_said = await response.json();
        console.log("Full Response:", proxy_said);

        if (proxy_said && proxy_said.output && proxy_said.output.audio) {
            const audioUrl = proxy_said.output.audio;
            console.log("Audio URL:", audioUrl);
            playAudio(audioUrl);
        } else {
            console.error("No audio URL found in response:", proxy_said);
            alert("Failed to generate speech. Please check the console for details.");
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
        if (!incomingData.ok) {
            throw new Error(`Failed to fetch audio: ${incomingData.status} ${incomingData.statusText}`);
        }
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
