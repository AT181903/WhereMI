// This function is used to check if the permission has already been given (It works only in Chrome)
export var microphonePermissionState = async() => {
  let result = {};
  try {
    return result = await navigator.permissions.query({name:'microphone'});
  }
  catch (error) {
    console.warn(error);
    result.state = "unsupported";
    return result;
  }
};

// Asking only to access the microphone
let constrains = {
  audio: true
};

export var audioURL;
export var blob;

export async function mediaRecorderPrompt() {
  // If getUserMedia is supported by the browser I ask for permission ti use it
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return await navigator.mediaDevices.getUserMedia (constrains)
    .then(function(mediaStreamObj) {
      let chunks = [];
      var mediaRecorder;
      var libraryFallback = false;

      if (window.MediaRecorder) {
        mediaRecorder = new MediaRecorder(mediaStreamObj);
      }
      // To make Safari work...
      else {
        libraryFallback = true;
        console.log("Fallback");
        mediaRecorder = new Recorder({
           encoderPath: "./libraries/opus-recorder/waveWorker.min.js"
         });
      }

      mediaRecorder.ondataavailable = (event) => {
        if (!libraryFallback) {
          chunks.push(event.data);
        }
        else {
          var dataBlob = new Blob( [event], { type: 'audio/wav' } );
          audioURL = URL.createObjectURL( dataBlob );
        }
      };

      mediaRecorder.onstop = (event) => {
        if (!libraryFallback) {
          blob = new Blob(chunks, {type: 'audio/ogg; codecs=opus'});
          chunks = [];
          audioURL = window.URL.createObjectURL(blob);
        }

      };

      return mediaRecorder;
    })
    .catch(function(error) {
      alert("Errore! Controllare di avere consentito l'accesso al microfono dal browser");
    });
  }
  else {
    alert("La registrazione da microfono non è supportata dal tuo browser");
  }
}

window.blob = function(){
  return blob;
};
/*


    // ----------------------- recorder - DataAvailable --------------------------
    recorder.addEventListener("dataavailable", event => {
      chunks.push(event.data);
    });

    // ---------------------- recorder - Stop --------------------------
    var audio;

    recorder.addEventListener("stop", event => {
      audio = document.createElement("audio");
      var blob = new Blob(chunks, {type : mimeType});
      chunks = [];
      var audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
    });

    function startStopRecording() {
      if (recorder.state === "inactive") {
        recorder.start();
        myPopup.innerHTML = "Recording...";
      }
      else {
        stream.getTracks()[0].stop();
        recorder.stop();
        myPopup.innerHTML = ``;
        wholePopupEnabled = false;
        recordingPopup.style.cursor = "default";
        var recordNewClipElement = document.getElementById("newClip");
        recordNewClipElement.style.cursor = "pointer";
        recordNewClipElement.addEventListener("click", function(ev) {
          ev.stopPropagation();
          recordingPopup.style.cursor = "pointer";
          wholePopupEnabled = true;
          startStopRecording();
        });
        var playerButton = document.getElementById("playPause");
        playerButton.addEventListener("click", function(ev) {
          if(audio.paused || audio.ended) {
            audio.play();
            playerButton.src = "images/pause.svg";
          } else {
            audio.pause();
            playerButton.src = "images/play.svg";
          }
          ev.stopPropagation();
          audio.onended = function() {
            playerButton.src = "images/play.svg";
          }
        });
      }
    }

  */
