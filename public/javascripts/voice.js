var lingue = window.speechSynthesis.getVoices();

function printLangList() {
  var lingue = window.speechSynthesis.getVoices();
  //console.log("Lunghezza array lingue: " + lingue.length);
  lingue.forEach((item, i) => {
    console.log("Nome voce: " + item.name + ", lingua voce: " + item.lang + ", numero: " + i);
  });
}

const italiano = lingue[10];

window.voice = function (text, siteLanguage) {
    var messaggio = new SpeechSynthesisUtterance(text);
    if (siteLanguage == "it") {
      messaggio.lang = "it-IT";
    } else {
      messaggio.lang = "us-US";
    }
    speechSynthesis.speak(messaggio);
};

function speechRecognition() {
    window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

    if ('SpeechRecognition' in window) {
        // Accesso al microfono
        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(function (stream) {
                console.log('Permesso dato al microfono');
            })
            .catch(function (err) {
                alert("Non hai dato il permesso di accedere al microfono");
                console.log('Permesso non dato al microfono')
            });

        var recognition = new window.SpeechRecognition();

        recognition.lang = 'us-US';

        recognition.start();

        recognition.onstart = function (event) {
            $('#mic').css('background-color', 'red');
        };

        recognition.onspeechend = function (event) {
            recognition.stop();
            $('#mic').css('background-color', 'white');
        };

        recognition.onresult = function (event) {
            var risultato = event.results[0][0].transcript;
            console.log(risultato);

            switch (risultato.toUpperCase()) {
                case "WHERE AM I":
                    whereMI();
                    break;
                case "PREVIOUS":
                    previous();
                    break;
                case "NEXT":
                    next();
                    break;
                case "MORE":
                    more();
                    break;
                case "STOP":
                    player.pauseVideo();
                    break;
                case "CONTINUE":
                    player.playVideo();
                    break;
                default:
                var text;
                if (siteLanguage() == "it") {
                  text = "Non ho capito bene, ripeti per favore";
                } else {
                  text = "Sorry, I didn't understand, can you repeat please?";
                }
                    window.voice(text, siteLanguage());
            }
        };
    } else {
        alert("Il tuo browser non supporta il riconoscimento vocale");
    }
}
