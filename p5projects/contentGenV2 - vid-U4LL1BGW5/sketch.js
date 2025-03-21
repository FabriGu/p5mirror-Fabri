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
  
    button_vid = createButton("Convert to vid");
    button_vid.mousePressed(() => {
        makeVideo(feedback_txt);
    })
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
    let data = {
        version: "684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
        input: {
            text: "Become my disciple! You cant resist the pigeons. pigeons are better than people. live the way of the pigeon. PIGEONS! I know you love them. They can be your friends. Join US!",
            // text: p_prompt,
            speaker: "./bird.m4a",
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
        // body: JSON.stringify(data),
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
async function makeVideo(p_prompt) {
  // let data = {
  //       version: "e22e77495f2fb83c34d5fae2ad8ab63c0a87b6b573b6208e1535b23b89ea66d6",
  //       input: {
  //         fps: 15,
  //         zoom: "0: (1.04)",
  //         angle: "0:(0)",
  //         sampler: "plms",
  //         max_frames: 100,
  //         translation_x: "0: (0)",
  //         translation_y: "0: (0)",
  //         color_coherence: "Match Frame 0 LAB",
  //         animation_prompts: "0: a beautiful portrait of a woman by Artgerm, trending on Artstation"
  //       }
  //   };
  
  //-------------------------------
  
    let data = {
      version: "02edcff3e9d2d11dcc27e530773d988df25462b1ee93ed0257b6f246de4797c8",
      input: {
        prompt: feedback_txt,
        save_fps: 10,
        ddim_steps: 50,
        unconditional_guidance_scale: 12
      }
    }
  //-------------------------------
  // let data = {
  //   version: "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
  //   input: {
  //     fps: 24,
  //     model: "xl",
  //     width: 1024,
  //     height: 576,
  //     prompt: feedback_txt,
  //     batch_size: 1,
  //     num_frames: 24,
  //     init_weight: 0.5,
  //     guidance_scale: 17.5,
  //     negative_prompt: "very blue, dust, noisy, washed out, ugly, distorted, broken",
  //     remove_watermark: false,
  //     num_inference_steps: 50
  //   }
  // }
  //-------------------------------
  
    console.log("Asking for video From Replicate via Proxy", data);
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    const url = replicateProxy + "/create_n_get/";
    try {
        const response = await fetch(url, options);
        const proxy_said = await response.json();

        console.log("Full Response:", proxy_said);

        if (proxy_said && proxy_said.output) {
            console.log("Output object:", proxy_said.output);

            // Check if the output contains the video URL or binary data
            if (proxy_said.output.video) {
                // Assuming the API returns a video URL
                console.log("Video URL:", proxy_said.output.video);
                createDownloadLink(proxy_said.output.video);
            } else {
                console.error("No video URL found in output:", proxy_said.output);
                alert("An error occurred while generating the video. Please check the console for more details.");
                createDownloadLink(proxy_said.output.video);
            }
        } else {
            console.error("Unexpected response format or missing 'output' field:", proxy_said);
            alert("An error occurred while generating the video. Please check the console for more details.");
        }
    } catch (error) {
        console.error("Error during the request:", error);
        createDownloadLink(proxy_said.output.video);
        console.log("Video URL:", proxy_said.output.video);
    }
}

function createDownloadLink(videoUrl) {
    let a = createA(videoUrl, 'Download Video');
    a.attribute('download', '');
    a.elt.click();
    a.remove(); // Clean up the link element after download
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
