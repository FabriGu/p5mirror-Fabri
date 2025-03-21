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

// Variable to store the uploaded audio file
let uploadedAudioBlob;
var dropzone;
let uploadedAudio;

function setup() {
    let canvas = createCanvas(512, 512);
    canvas.drop(handleFileDrop); // Attach the file drop handler

    // File 1 elements
    feedback = createP("");
    feedback.position(0, 20);

    input_p = createInput("");
    sys_p = createInput("");
    button_ml = createButton("Send to ML");
    button_ml.mousePressed(() => {
        ask(input_p.value());
    });

    // File 2 elements
    button_speech = createButton("Convert to Speech");
    button_speech.mousePressed(() => {
        convertToSpeech(feedback_txt);
    });
}

function draw() {
    background(255);

    textSize(32);
    textAlign(CENTER, CENTER);
    text("Drop an audio file here", width / 2, height / 2);
}

function handleFileDrop(file) {
    // Check if the dropped item is an audio file
    console.log(file)
    if (file.type.startsWith('audio')) {
        // Create a URL for the dropped audio file
        // uploadedAudioBlob = file.file
        
        // uploadedAudioBlob = URL.createObjectURL(file.data);
        // createP(file.name + ' ' + file.size);
        // feedback.html('Audio file uploaded successfully!');
        // console.log(uploadedAudioBlob.slice(5));
      console.log("hi")
      save(file.data, "audio.mp3");
    } else {
        feedback.html('Please drop an audio file.');
    }
}

async function ask(p_prompt) {
    const imageDiv = select("#resulting_image");
    feedback.html("Waiting for reply");
    let data = {
        version: "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
        input: {
            prompt: p_prompt,
            system_prompt: sys_p.value()
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
    // if (!uploadedAudioBlob) {
    //     feedback.html('No audio file uploaded. Please upload an audio file first.');
    //     return;
    // }

    let data = {
        version: "684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
        input: {
            text: p_prompt,
            speaker: "./audio.mp3", // Use the uploaded audio file
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
