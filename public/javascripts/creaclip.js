import * as map from "../modules/streetmap.js";
import * as recorder from "../modules/microphone.js";

document.addEventListener("DOMContentLoaded", event => {
    window.getOLC = function (high_precision) {
        if (typeof high_precision === "undefined") {
            return OpenLocationCode.encode(
                map.getMarkerPosition().lat,
                map.getMarkerPosition().lng,
                OpenLocationCode.CODE_PRECISION_NORMAL
            );
        } else {
            return OpenLocationCode.encode(
                map.getMarkerPosition().lat,
                map.getMarkerPosition().lng,
                OpenLocationCode.CODE_PRECISION_EXTRA
            );
        }
    };
    window.setPositionChangedCallback = function (callback) {
        map.setPositionChangedCallback(callback);
    };
});

var recordingStateMachine = {
    state: {
        status: null,
        get value() {
            return this.status;
        },
        set value(val) {
            this.status = val;
            this.listener(val);
        },
        listener: function (state) {
            switch (state) {
                case recordingStateMachine.states.START_RECORDING:
                    $("#clipRecorded").hide();
                    $("#startClose").show();
                    $("#startRecording").show();
                    break;
                case recordingStateMachine.states.STOP_RECORDING:
                    $(".close").attr("disabled", true);
                    $("#returnM").attr("disabled", true);
                    $("#ferma").show();
                    $("#startRecording").hide();
                    $("#recordingInProgress").show();
                    break;
                case recordingStateMachine.states.SAVE_RECORDING:
                    $(".close").attr("disabled", false);
                    $("#returnM").attr("disabled", false);
                    $("#startClose").hide();
                    $("#recordingInProgress").hide();
                    $("#clipRecorded").show();

                    //blur del primo modale
                    $("#modify").click("change", function () {
                        $("#modaleClip").css({
                            "-webkit-filter": "blur(3px)",
                            "-moz-filter": "blur(3px)",
                            "-o-filter": "blur(3px)",
                            "-ms-filter": "blur(3px)",
                            filter: "blur(3px)"
                        });
                    });

                    $(".salvaMod").click("change", function () {
                        $("body.modal-open #modaleClip").css({
                            "-webkit-filter": "",
                            "-moz-filter": "",
                            "-o-filter": "",
                            "-ms-filter": "",
                            "filter": ""
                        });
                    });

                    //reset inizio e fine secondi (manca il reset del volume) e reimposto la classe per il body(per mobile)
                    $(".modal").on("hidden.bs.modal", function () {
                        $(this).find("form")[0].reset();
                        $("body").addClass("modal-open");
                    });

                    $("#ferma").hide();
                    $("#UploadButton").removeAttr("disabled");
                    break;
            }
        }
    },
    states: {
        START_RECORDING: "start",
        STOP_RECORDING: "stop",
        SAVE_RECORDING: "save"
    }
};

function delay(timer) {
    return new Promise(resolve => {
        timer = timer || 2000;
        setTimeout(function () {
            resolve();
        }, timer);
    });
}

var mediaRecorder = null;
var oldAudioURL;
(async () => {
    mediaRecorder = await recorder.mediaRecorderPrompt();

    $("#startRecording").click('change', function () {
        mediaRecorder.start();
        recordingStateMachine.state.value = recordingStateMachine.states.STOP_RECORDING;
    });

    $("#recordingInProgress").click('change', async function () {
        recordingStateMachine.state.value = recordingStateMachine.states.SAVE_RECORDING;
        mediaRecorder.stop();
        var audioTag = document.querySelector("#audioControls");

        while (!recorder.audioURL || recorder.audioURL === oldAudioURL) {
            await delay(200);
        }

        audioTag.src = recorder.audioURL;

        oldAudioURL = recorder.audioURL;
    });

    $("#newClip").click('change', async function () {
        recordingStateMachine.state.value = recordingStateMachine.states.START_RECORDING;
        $("#startSecond").removeAttr("max");
        $("#endSecond").removeAttr("max");
    })
})();

// Initialize the map
var mapLoaded = map.initEditorMap();
if (mapLoaded) {
    var popup = document.querySelector("#recordingPopup");
    popup.appendChild(wholePopup);
    map.marker.getPopup().update();
}

window.uploadToServer = async function uploadToServer() {
    let formData = new FormData();

    formData.append("audio", recorder.blob, "audio.ogg");

    let response = await fetch("/upload", {
        method: "POST",
        body: formData
    });
    let result = await response;

    return result.blob();
};

// Chrome fix in order to display the duration of the audio clip just recorder
window.calculateMediaDuration = function (media) {
    return new Promise((resolve, reject) => {
        media.onloadedmetadata = function () {
            // set the mediaElement.currentTime  to a high value beyond its real duration
            media.currentTime = Number.MAX_SAFE_INTEGER;
            // listen to time position change
            media.ontimeupdate = function () {
                media.ontimeupdate = function () {
                };
                // setting player currentTime back to 0 can be buggy too, set it first to .1 sec
                media.currentTime = 0.1;
                media.currentTime = 0;
                // media.duration should now have its correct value, return it...
                resolve(media.duration);
            }
        }
    });
};

window.audioTagDur = function (audioTag) {
    return Math.floor(audioTag.duration);
};