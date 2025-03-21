//is it a Muse 1 (usePPG = false) or Muse 2 (usePPG = true)
let usePPG = true;
//let connectButton;

function setupMuse() {
  //this handles the bluetooth connection between the Muse and the computer
  bluetoothConnection = new webBLE();

  //create the connect button 
  //connectButton = createButton('Connect')
  //connectButton.mousePressed(connectButtonClicked);
}

//user clicks connect button
// function connectButtonClicked() {
//   connectToMuse();
// }

//when muse connects, this function fires
function museConnected(error, characteristics) {

  if (error) {
    console.log(error); //error connecting
  } else {

    //hide the connect button
    //connectButton.hide();

    //prepare muse to stream data
    let museIsReady = initMuseStreaming(characteristics);

    //if muse is ready for streaming
    if (museIsReady) {
      startMuse();
    }

    //add disconnection script
    bluetoothConnection.onDisconnected(onDisconnected);
  }
}

//if muse disconnects
function museDisconnected() {
  console.log('Muse Disconnected');

  //show the connect button
  //connectButton.show();
}