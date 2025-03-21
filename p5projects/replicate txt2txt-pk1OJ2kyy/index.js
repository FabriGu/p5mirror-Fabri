//THIS IS PROXY SERVER AS GO BETWEEN YOUR WEB PAGE AND REPLICATE API
const express = require("express");
const Datastore = require("nedb");
const fetch = require("node-fetch");
const Replicate = require("replicate");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors"); // importing the `cors` package
app.use(express.json({ limit: "4mb" }));
let uniqueFileNumber = 1;
let host;

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(cors()); // tells Express to use `cors`, and solves the issue

app.listen(port, () => {
  console.log(`Starting server at ${port}`);
});
app.use(express.static("public"));
app.use(express.json({ limit: "2mb" }));

const api_key = process.env.REPLICATE_API_KEY;
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  fetch: fetch,
});

var version = null;

//REPLICATE SEND PROMPT
app.post("/create_n_get", async (request, response) => {
  //START PREDICTION
  host = request.headers.host;
  let data_to_send = request.body;

  //this looks for field called 'fieldToConvertBase64ToURL' and hosts that the base64 data on this server and replaces base64 data with a url of hosted file
  data_to_send = await hostFiles(data_to_send);

  let replicate_url = "https://api.replicate.com/v1/predictions";
  //sometimes replicate uses a url to model instead of a version
  const modelURL = data_to_send.modelURL;
  if (modelURL) {
    replicate_url = modelURL;
    delete data_to_send.modelURL;
  }
  const options = {
    headers: {
      Authorization: `Token ${api_key}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data_to_send),
  };
  //console.log(data_to_send);
  const replicate_response = await fetch(replicate_url, options);
  const replicate_result = await replicate_response.json();
  const prediction_id = replicate_result.id;
  console.log("GOT A PREDICTION", replicate_result.id);

  //USE PREDICTION ID TO GET THE URL OF THE PICTURE
  const get_prediction_url =
    "https://api.replicate.com/v1/predictions/" + prediction_id;
  const header = {
    Authorization: `Token ${api_key}`,
    "Content-Type": "application/json",
    //Accept: "application/json",
  };

  let get_prediction_response = null;
  let predictionStatus = null;
  let get_prediction_result = null;
  //it will get back to you with a few interim status reports so use do loop to wait for real thing.
  //could update web page with these status changes but I don't
  do {
    get_prediction_response = await fetch(get_prediction_url, {
      headers: header,
    });
    get_prediction_result = await get_prediction_response.json();
    //console.log("got interim message", get_prediction_result);
    predictionStatus = get_prediction_result.status;
    await sleep(50);
  } while (["starting", "processing"].includes(predictionStatus));
  //console.log(get_prediction_result);
  response.json(get_prediction_result);
});

async function hostFiles(incomingJSON) {
  let fieldName = incomingJSON.fieldToConvertBase64ToURL;
  if (!fieldName) return incomingJSON;
  delete incomingJSON.fieldToConvertBase64ToURL;

  let fileFormat = incomingJSON.fileFormat;
  if (!(fileFormat == "png" || fileFormat == "jpg" || fileFormat == "wav")) {
    incomingJSON.error = "only works for png, jpg, and wav";
    return incomingJSON;
  }

  delete incomingJSON.fileFormat;
  //console.log(data_to_send.input.audio);
  //take the b64 and write it to a file on this server and send on the url that that replicate API wants
  var buf = Buffer.from(incomingJSON.input[fieldName], "base64");
  uniqueFileNumber++;
  let filename = "temp" + uniqueFileNumber + "." + fileFormat;

  fs.writeFileSync("public/" + filename, buf);
  incomingJSON.input[fieldName] = "https://" + host + "/" + filename;
    console.log("hosted file" , incomingJSON);
  //get rid of old hosted files
  //this will probably not work because of differing fileformats, should get list just go throughh and delete some
  const deleteNum = uniqueFileNumber - 5;
  if (deleteNum > 0) {
    fs.unlink("public/temp" + deleteNum + "." + fileFormat, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("File deleted successfully");
    });
  }
  return incomingJSON;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// ///THIS TAKES IN A FILE, WRITES IT HERE TO BE HOSTED AND THEN PASSES ALONG WITH A URL INSTEAD
// ///NEED TO SPECIFY WHICH FIELD IN THE JSON TO SWAP OUT FILE FOR A URL, FOR EXAMPLE 'audio' for transciption or another 'input' for vision embedding
// app.post("/askReplicateFileToUrl", async (request, response) => {
//   let data_to_send = request.body;
//   //console.log(data_to_send);
//   let fieldToConvertToHostedFile = data_to_send.fieldToConvertToHostedFile;
//   delete data_to_send.fieldToConvertToHostedFile;
//   let fileFormat = data_to_send.fileFormat;
//   if (!(fileFormat == "png" || fileFormat == "jpg" || fileFormat == "wav")) {
//     return;
//   }
//   delete data_to_send.fileFormat;
//   //console.log(data_to_send.input.audio);
//   //take the b64 and write it to a file on this server and send on the url that that replicate API wants
//   var buf = Buffer.from(
//     data_to_send.input[fieldToConvertToHostedFile],
//     "base64"
//   );
//   uniqueFileNumber++;
//   let filename = "temp" + uniqueFileNumber + "." + fileFormat;

//   fs.writeFileSync("public/" + filename, buf);
//   let host = request.headers.host;
//   data_to_send.input[fieldToConvertToHostedFile] =
//     "https://" + host + "/" + filename;
//   console.log(data_to_send);

//   const replicate_url = "https://api.replicate.com/v1/predictions";
//   const options = {
//     headers: {
//       Authorization: `Token ${api_key}`,
//       "Content-Type": "application/json",
//     },
//     method: "POST",
//     body: JSON.stringify(data_to_send),
//   };

//   const replicate_response = await fetch(replicate_url, options);
//   const replicate_result = await replicate_response.json();
//   const prediction_id = replicate_result.id;
//   console.log("GOT A PREDICTION", replicate_result.id);

//   //USE PREDICTION ID TO GET THE URL OF THE PICTURE
//   const get_prediction_url =
//     "https://api.replicate.com/v1/predictions/" + prediction_id;
//   const header = {
//     Authorization: `Token ${api_key}`,
//     "Content-Type": "application/json",
//     //Accept: "application/json",
//   };

//   let get_prediction_response = null;
//   let predictionStatus = null;
//   let get_prediction_result = null;
//   //it will get back to you with a few interim status reports so use do loop to wait for real thing.
//   //could update web page with these status changes but I don't
//   do {
//     get_prediction_response = await fetch(get_prediction_url, {
//       headers: header,
//     });
//     get_prediction_result = await get_prediction_response.json();
//     //console.log("got interim message", get_prediction_result);
//     predictionStatus = get_prediction_result.status;
//     await sleep(50);
//   } while (["starting", "processing"].includes(predictionStatus));
//   response.json(get_prediction_result);
//   //delete older files
//   const deleteNum = uniqueFileNumber - 5;
//   if (deleteNum > 0) {
//     fs.unlink("public/temp" + deleteNum + "." + fileFormat, (err) => {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       console.log("File deleted successfully");
//     });
//   }
// });

// //NOT TESTED  BUT SEEMS LIKE SOME MODELS DON"T USE VERSIONS BUT URLS INSTEAD
// app.post("/create_n_get_model_in_url", async (request, response) => {
//   //START PREDICTION
//   let data_to_send = request.body;
//   const replicate_url = data_to_send.modelURL;
//   delete data_to_send.modelURL;
//   const options = {
//     headers: {
//       Authorization: `Token ${api_key}`,
//       "Content-Type": "application/json",
//     },
//     method: "POST",
//     body: JSON.stringify(data_to_send),
//   };
//   //console.log(data_to_send);
//   const replicate_response = await fetch(replicate_url, options);
//   const replicate_result = await replicate_response.json();
//   const prediction_id = replicate_result.id;
//   console.log("GOT A PREDICTION", replicate_result.id);

//   //USE PREDICTION ID TO GET THE URL OF THE PICTURE
//   const get_prediction_url =
//     "https://api.replicate.com/v1/predictions/" + prediction_id;
//   const header = {
//     Authorization: `Token ${api_key}`,
//     "Content-Type": "application/json",
//     //Accept: "application/json",
//   };

//   let get_prediction_response = null;
//   let predictionStatus = null;
//   let get_prediction_result = null;
//   //it will get back to you with a few interim status reports so use do loop to wait for real thing.
//   //could update web page with these status changes but I don't
//   do {
//     get_prediction_response = await fetch(get_prediction_url, {
//       headers: header,
//     });
//     get_prediction_result = await get_prediction_response.json();
//     //console.log("got interim message", get_prediction_result);
//     predictionStatus = get_prediction_result.status;
//     await sleep(50);
//   } while (["starting", "processing"].includes(predictionStatus));
//   //console.log(get_prediction_result);
//   response.json(get_prediction_result);
// });




// //THIS SHOULD BE DEPRICATED AND USE THE MORE GENERIC "askReplicateFileToUrl" SPECIFYING "audio" as field to be hosted as a file and pass on url of that file
// app.post("/askReplicateAudio", async (request, response) => {
//   let data_to_send = request.body;
//   //console.log(data_to_send.input.audio);
//   //take the b64 and write it to a file on this server and send on the url that that replicate API wants
//   var buf = Buffer.from(data_to_send.input.audio, "base64");
//   uniqueFileNumber++;
//   let filename = "temp" + uniqueFileNumber + ".wav";

//   fs.writeFileSync("public/" + filename, buf);
//   let host = request.headers.host;
//   data_to_send.input.audio = "https://" + host + "/" + filename;

//   const replicate_url = "https://api.replicate.com/v1/predictions";

//   const options = {
//     headers: {
//       Authorization: `Token ${api_key}`,
//       "Content-Type": "application/json",
//     },
//     method: "POST",
//     body: JSON.stringify(data_to_send),
//   };

//   console.log(data_to_send);
//   const replicate_response = await fetch(replicate_url, options);
//   const replicate_result = await replicate_response.json();
//   const prediction_id = replicate_result.id;
//   console.log("GOT A PREDICTION", replicate_result.id);

//   //USE PREDICTION ID TO GET THE URL OF THE PICTURE
//   const get_prediction_url =
//     "https://api.replicate.com/v1/predictions/" + prediction_id;
//   const header = {
//     Authorization: `Token ${api_key}`,
//     "Content-Type": "application/json",
//     //Accept: "application/json",
//   };

//   let get_prediction_response = null;
//   let predictionStatus = null;
//   let get_prediction_result = null;
//   //it will get back to you with a few interim status reports so use do loop to wait for real thing.
//   //could update web page with these status changes but I don't
//   do {
//     get_prediction_response = await fetch(get_prediction_url, {
//       headers: header,
//     });
//     get_prediction_result = await get_prediction_response.json();
//     //console.log("got interim message", get_prediction_result);
//     predictionStatus = get_prediction_result.status;
//     await sleep(50);
//   } while (["starting", "processing"].includes(predictionStatus));
//   response.json(get_prediction_result);
//   //delete older files
//   const deleteNum = uniqueFileNumber - 5;
//   fs.unlink("public/temp" + deleteNum + ".wav", (err) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     console.log("File deleted successfully");
//   });
// });

// async (req, res) => {
//   const prediction = await replicate.predictions.create(req.body);
//   console.log(prediction)
//   res.json(prediction)
// });

// app.post("/use_lora", async (request, response) => {
//   let params = request.body;
//   console.log("params", params);
//   // const output = await replicate.run(
//   //   "cloneofsimo/lora:fce477182f407ffd66b94b08e761424cabd13b82b518754b83080bc75ad32466",
//   //   params
//   // );
//   response.json("hi");
// });

// app.post("/lora_training", async (request, response) => {
//   let params = request.body;
//   console.log("params", params);
//   //there are two models for training like this, this one is for face
//   const output = await replicate.run(
//     "cloneofsimo/lora-training:b2a308762e36ac48d16bfadc03a65493fe6e799f429f7941639a6acec5b276cc",
//     {
//       input: {
//         task: "style",
//         resolution: 512,
//         instance_data:
//           "https://replicate.delivery/pbxt/IFYJBZ8XoHFfXPkkk3ToCv2n2ccyJHjSo5avPWsXJqbwHs7N/pokemon.zip",
//       },
//     }
//   );
// });

// app.post("/fine_tuning_training", async (request, response) => {
//   let data_to_send = request.body;
//   let version = data_to_send.version;
//   const replicate_url =
//     "https://api.replicate.com/v1/models/itpnyu/test-fine-tune-dano/versions/" +
//     version +
//     "/trainings";
//   const options = {
//     headers: {
//       Authorization: `Token ${api_key}`,
//       "Content-Type": "application/json",
//     },
//     method: "POST",
//     body: JSON.stringify(data_to_send),
//   };
//   console.log("started training");
//   const replicate_response = await fetch(replicate_url, options);
//   const replicate_result = await replicate_response.json();
//   console.log("Did Training", replicate_result);
//   response.json(replicate_result);
// });

// app.post("/hello", async (request, response) => {
//   console.log("hellow");
//   response.json({ hello: "world" });
// });
// app.get("/hello", async (request, response) => {
//   console.log("hellow");
//   response.json({ hello: "world" });
// });

// async function getModel() {
//   //MOST OF THE TIME WE LOOK UP VERSION IDS ON THE REPLICATE DOCS BUT YOU CAN GET DYNAMICALLY
//   const model_url =
//     "https://api.replicate.com/v1/models/stability-ai/stable-diffusion";
//   let modelVersionOptions = {
//     headers: { Authorization: `Token ${api_key}` },
//     method: "GET",
//   };
//   const models_response = await fetch(model_url, modelVersionOptions);
//   const models_result = await models_response.json();
//   version = models_result.latest_version.id;
//   console.log("We will be using this model version: ", version);

// }

// //REPLICATE SEND PROMPT
// app.post("/replicate_api_id_from_prompt", async (request, response) => {
//   //await getModel(); //could be outside of this function but glitch restarts server alot while i debug.
//   //START PREDICTION
//   let data_to_send = request.body;

//   //data_to_send.version = version;
//   //console.log(version);
//   console.log("data_to_send", data_to_send);
//   const replicate_url = "https://api.replicate.com/v1/predictions";
//   const options = {
//     headers: {
//       Authorization: `Token ${api_key}`,
//       "Content-Type": "application/json",
//     },
//     method: "POST",
//     body: JSON.stringify(data_to_send),
//   };

//   const replicate_response = await fetch(replicate_url, options);
//   const replicate_result = await replicate_response.json();
//   const prediction_id = replicate_result.id;
//   console.log("GOT A PREDICTION", replicate_result.id);
//   response.json(replicate_result);

//   //USE PREDICTION ID TO GET THE URL OF THE PICTURE
//   const get_prediction_url =
//     "https://api.replicate.com/v1/predictions/" + prediction_id;
//   const header = {
//     Authorization: `Token ${api_key}`,
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   };

//   //console.log(get_prediction_url, { headers: header });

//   let get_prediction_response = null;
//   let predictionStatus = null;
//   let get_prediction_result = null;
//   //it will get back to you with a few interim status reports so use do loop to wait for real thing.
//   //could update web page with these status changes but I don't
//   do {
//     get_prediction_response = await fetch(get_prediction_url, {
//       headers: header,
//     });
//     get_prediction_result = await get_prediction_response.json();
//     predictionStatus = get_prediction_result.status;
//     await sleep(500);
//   } while (["starting", "processing"].includes(predictionStatus));
//   console.log(get_prediction_result);
//   response.json(get_prediction_result);
// });

// app.post("/replicate_prediction_output_from_id", async (request, response) => {
//   //USE PREDICTION ID TO GET THE URL OF THE PICTURE
//   let prediction_id = request.body.id;
//   console.log("prediction id", prediction_id);
//   const get_prediction_url =
//     "https://api.replicate.com/v1/predictions/" + prediction_id;
//   const header = {
//     Authorization: `Token ${api_key}`,
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   };

//   //console.log(get_prediction_url, { headers: header });

//   let get_prediction_response = null;
//   let predictionStatus = null;
//   let get_prediction_result = null;
//   //it will get back to you with a few interim status reports so use do loop to wait for real thing.
//   //could update web page with these status changes but I don't
//   do {
//     get_prediction_response = await fetch(get_prediction_url, {
//       headers: header,
//     });
//     get_prediction_result = await get_prediction_response.json();
//     predictionStatus = get_prediction_result.status;
//     await sleep(500);
//   } while (["starting", "processing"].includes(predictionStatus));
//   console.log(get_prediction_result);
//   response.json(get_prediction_result);
// });
