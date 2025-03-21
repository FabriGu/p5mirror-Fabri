const replicateProxy = "https://replicate-api-proxy.glitch.me";

function setup() {
    createCanvas(512, 512);
    let input_image_field = createInput("Grateful Dead meets Hip Hop");
    input_image_field.size(600);
    input_image_field.id("input_image_prompt");

    let button1 = createButton("Ask For Sound");
    button1.mousePressed(() => {
        askForSound(input_image_field.value());
    });

    askForSound("hello");
}

async function askForSound(p_prompt) {
    let data = {
        version: "684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
        input: {
            text: p_prompt,
            speaker: "https://replicate.delivery/pbxt/Jt79w0xsT64R1JsiJ0LQRL8UcWspg5J4RFrU6YwEKpOT1ukS/male.wav",
            language: "en",
            cleanup_voice: false,
        },
    };

    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };

    const url = replicateProxy + "/create_n_get/";
    try {
        let isProcessing = true;
        let proxy_said;

        while (isProcessing) {
            const response = await fetch(url, options);
            proxy_said = await response.json();

            console.log("Full response:", proxy_said);

            if (proxy_said.output && proxy_said.output.audio) {
                isProcessing = false;
            } else if (proxy_said.error) {
                console.error("API Error:", proxy_said.error);
                isProcessing = false;
                return;
            } else if (proxy_said.logs) {
                console.log("Processing Logs:", proxy_said.logs);
            } else {
                console.log("Processing not complete, waiting...");
                await new Promise(r => setTimeout(r, 3000)); // Wait 3 seconds before retrying
            }
        }

        if (!proxy_said.output || !proxy_said.output.audio) {
            console.error("Audio data is missing in the response");
            return;
        }

        const ctx = new AudioContext();
        let incomingData = await fetch(proxy_said.output.audio);

        if (!incomingData.ok) {
            throw new Error("Failed to fetch audio data: " + incomingData.statusText);
        }

        let arrayBuffer = await incomingData.arrayBuffer();
        let decodedAudio = await ctx.decodeAudioData(arrayBuffer);

        const playSound = ctx.createBufferSource();
        playSound.buffer = decodedAudio;
        playSound.connect(ctx.destination);
        playSound.start(ctx.currentTime);
        playSound.loop = true;

    } catch (error) {
        console.error("An error occurred:", error);
    }
}
