function initYouTube() {
    gapi.client.setApiKey(/* Add Api Key */);
    gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest");
}

var lastSmallSearch, lastMediumSearch;

var alreadyPutInMap = [];

$(window).on("load", async () => {
    $("#navigationButton").click(function () {
        $("#containerPercorso").toggle();
    });

    getCookie();

    window.setPositionChangedCallback(async function () {
        var tmpOLCSmall1 = window.getOLC();
        var tmpOLCSmall2 = tmpOLCSmall1.split("+");
        var olcSmall = tmpOLCSmall2[0];

        if (olcSmall !== lastSmallSearch) {
            await smallSearch();

            var tmpOLCMedium1 = window.getOLC();
            var tmpOLCMedium2 = tmpOLCMedium1.split("+");
            var tmpOLCMedium3 = tmpOLCMedium2[0];
            var olcMedium = tmpOLCMedium3.substring(0, 6) + "00";
            if (olcMedium !== lastMediumSearch) {
                await dbSearch();

                await mediumSearch();
            }
        }
        await filtra();
        firstClip = true;
        purposeMore = "what";
        nearVideos();
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//RICERCA
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Creo gli array per contenere tutti i dati
var geoloc = [];
var purpose = [];
var language = [];
var content = [];
var audience = [];
var detail = [];
var id = [];
var channelTitle = [];
var titleVideo = [];

// Ricerca dei video su youtube
function mediumSearch() {
    var tmpOLC1 = window.getOLC();
    var tmpOLC2 = tmpOLC1.split("+");
    var tmpOLC3 = tmpOLC2[0];
    var olc = tmpOLC3.substring(0, 6) + "00";

    var tempOLC;

    try {
        return gapi.client.youtube.search.list({
            "part": "snippet",
            "maxResults": 50,
            "q": olc,
            "type": "video"
        })
            .then(response => {
                lastMediumSearch = olc;

                console.log("OLC mediumSearch: " + olc);

                var res = response.result;
                console.log(res);

                res.items.forEach((el, index) => {
                    var description = res.items[index].snippet.description.split(':');

                    tempOLC = correctOLC(description[0]);

                    if (tempOLC === undefined || tempOLC.indexOf(' ') !== -1) {
                        tempOLC = correctOLC(description[2]);
                        if (tempOLC === undefined || tempOLC.indexOf(' ') !== -1) {
                            console.log("OLC non valido");
                        } else {
                            if (!id.includes(res.items[index].id.videoId) && !geoloc.includes(tempOLC)) {
                                var OOLC = tempOLC.split("+");
                                var OOOLC = OOLC[0];
                                if (OOOLC.length === 8) {
                                    channelTitle.push(res.items[index].snippet.channelTitle);
                                    titleVideo.push(res.items[index].snippet.title);
                                    id.push(res.items[index].id.videoId);
                                    geoloc.push(tempOLC);
                                    purpose.push(description[3]);
                                    language.push(description[4]);
                                    content.push(description[5]);
                                    audience.push(description[6]);

                                    if (description[3] === "why") {
                                        detail.push(description[7]);
                                    } else {
                                        detail.push("No Detail");
                                    }
                                }
                            }
                        }
                    } else {
                        if (!id.includes(res.items[index].id.videoId) && !geoloc.includes(tempOLC)) {
                            var OOLC = tempOLC.split("+");
                            var OOOLC = OOLC[0];
                            if (OOOLC.length === 8) {
                                channelTitle.push(res.items[index].snippet.channelTitle);
                                    titleVideo.push(res.items[index].snippet.title);
                                id.push(res.items[index].id.videoId);
                                geoloc.push(tempOLC);
                                purpose.push(description[1]);
                                language.push(description[2]);
                                content.push(description[3]);
                                audience.push(description[4]);

                                if (description[1] === "why") {
                                    detail.push(description[5]);
                                } else {
                                    detail.push("No Detail");
                                }
                            }
                        }
                    }
                });
            })
    } catch (e) {
        console.log(e);
    }
}

// Ricerca dei video su youtube
function smallSearch() {
    var tmpOLC1 = window.getOLC();
    var tmpOLC2 = tmpOLC1.split("+");
    var olc = tmpOLC2[0];
    console.log("Reg video "+window.getOLC());
    var tempOLC;

    try {
        return gapi.client.youtube.search.list({
            "part": "snippet",
            "maxResults": 50,
            "q": olc,
            "type": "video"
        })
            .then(response => {
                lastSmallSearch = olc;

                console.log("OLC smallSearch: " + olc);

                var res = response.result;

                res.items.forEach((el, index) => {
                    var description = res.items[index].snippet.description.split(':');

                    tempOLC = correctOLC(description[0]);

                    if (tempOLC === undefined || tempOLC.indexOf(' ') !== -1) {
                        tempOLC = correctOLC(description[2]);
                        if (tempOLC === undefined || tempOLC.indexOf(' ') !== -1) {
                            console.log("OLC non valido");
                        } else {
                            if (!id.includes(res.items[index].id.videoId) && !geoloc.includes(tempOLC)) {
                                var OOLC = tempOLC.split("+");
                                var OOOLC = OOLC[0];
                                if (OOOLC.length === 8) {
                                    channelTitle.push(res.items[index].snippet.channelTitle);
                                    titleVideo.push(res.items[index].snippet.title);
                                    id.push(res.items[index].id.videoId);
                                    geoloc.push(tempOLC);
                                    purpose.push(description[3]);
                                    language.push(description[4]);
                                    content.push(description[5]);
                                    audience.push(description[6]);

                                    if (description[3] === "why") {
                                        detail.push(description[7]);
                                    } else {
                                        detail.push("No Detail");
                                    }
                                }
                            }
                        }
                    } else {
                        if (!id.includes(res.items[index].id.videoId) && !geoloc.includes(tempOLC)) {
                            var OOLC = tempOLC.split("+");
                            var OOOLC = OOLC[0];
                            if (OOOLC.length === 8) {
                                channelTitle.push(res.items[index].snippet.channelTitle);
                                    titleVideo.push(res.items[index].snippet.title);
                                id.push(res.items[index].id.videoId);
                                geoloc.push(tempOLC);
                                purpose.push(description[1]);
                                language.push(description[2]);
                                content.push(description[3]);
                                audience.push(description[4]);

                                if (description[1] === "why") {
                                    detail.push(description[5]);
                                } else {
                                    detail.push("No Detail");
                                }
                            }
                        }
                    }
                });
            })
    } catch (e) {
        console.log(e);
    }
}

function correctOLC(olcc) {
    try {
        if (olcc.length < 11) {
            olcc = undefined;
        } else if (olcc.length === 11) {
            if (olcc[olcc.length - 1] === '.') {
                olcc = olcc.substring(0, olcc.length - 1);
            }
        } else if (olcc.length === 12) {
            if (olcc[olcc.length - 1] === '.') {
                olcc = olcc.substring(0, olcc.length - 1);
            }
        } else if (olcc.length === 13 && olcc[olcc.length - 1] === '.') {
            if (olcc[olcc.length - 1] === '.') {
                olcc = olcc.substring(0, olcc.length - 1);
            }
        } else {
            var nuovoGeoloc = olcc.substring(olcc.length - 11, olcc.length);
            if (nuovoGeoloc.length === 11 || nuovoGeoloc.length === 12) {
                olcc = nuovoGeoloc;
            } else {
                nuovoGeoloc = olcc.substring(olcc.length - 14, olcc.length);
                if (nuovoGeoloc.length === 11 || nuovoGeoloc.length === 12) {
                    olcc = nuovoGeoloc;
                } else {
                    olcc = undefined;
                }

            }
        }
        return olcc;
    } catch (e) {
        return undefined;
    }
}

// Dati filtrati
var filteredIDs = [], filteredOLC = [], filteredContents = [], filteredAudiences = [], filteredDetails = [],
    filteredPurposes = [], filteredLanguages = [], filteredChannelName = [], filteredTitle = [];

// Filtri scelti dall'utente
var chosenContents = [], chosenAudiences = [], chosenLanguage;

async function filtra() {
    //Azzero tutti gli array per contenere i nuovi dati
    filteredOLC.splice(0, filteredOLC.length);
    filteredIDs.splice(0, filteredIDs.length);
    filteredAudiences.splice(0, filteredAudiences.length);
    filteredContents.splice(0, filteredContents.length);
    filteredDetails.splice(0, filteredDetails.length);
    filteredPurposes.splice(0, filteredPurposes.length);
    filteredLanguages.splice(0, filteredLanguages.length);
    filteredTitle.splice(0, filteredTitle.length);
    filteredChannelName.splice(0, filteredChannelName.length);
    chosenContents.splice(0, chosenContents.length);
    chosenAudiences.splice(0, chosenAudiences.length);

    $("input:checkbox[name=Contenuto]:checked").each(function () {
        chosenContents.push($(this).val());
    });
    //console.log("Content scelto: " + chosenContents.join(", "));

    $("input:checkbox[name=Pubblico]:checked").each(function () {
        chosenAudiences.push($(this).val());
    });
    //console.log("Audience scelto: " + chosenAudiences.join(", "));

    chosenLanguage = $("#Lingua option:selected").val();
    //console.log("Lingua scelta: " + chosenLanguage);

    chosenDirection = $("input:radio[name=Percorso]:checked").val();
    //console.log("Percorso scelto: " + chosenDirection);

    setCookie(chosenLanguage, chosenContents, chosenAudiences, chosenDirection);

    //Indice degli elementi da tenere
    var z = 0;

    id.forEach((el, c) => {
        if (chosenLanguage === language[c]) {
            if (chosenAudiences.includes(audience[c]) || chosenAudiences.length === 0) {
                if (chosenContents.includes(content[c]) || chosenContents.length === 0) {
                    try {
                        //if (purpose[c] === "what" && !alreadyPutInMap.includes(el)) {
                        if (!alreadyPutInMap.includes(el)) {
                            try {

                                var popup;
                                popup = document.createElement('div');
                                popup.id = el + "Pop";

                                //window.positionMarker(el, geoloc[c], popup);

                                switch (purpose[c]) {
                                    case "what":
                                        window.OLCtoMarkerWhat(el, geoloc[c], popup);
                                        break;
                                    case "why":
                                        window.OLCtoMarkerWhy(el, geoloc[c], popup);
                                        break;
                                    case "how":
                                        window.OLCtoMarkerHow(el, geoloc[c], popup);
                                }

                                alreadyPutInMap.push(geoloc[c]);

                                popup.innerHTML = `
                                   <div class="card" style="width: 22rem;">
                                   <h5 style="margin-top:0.5em">`+titleVideo[c]+`</h5>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-3">
                                                <img src="../images/language.png" width="50" height="50" title="Language">
                                                <p>`+language[c]+`</p>
                                                </div>
                                                <div class="col-3">
                                                <img src="../images/audience.png" width="50" height="50" title="Audience">
                                                <p>`+audience[c]+`</p>
                                                </div>
                                                <div class="col-3">
                                                <img src="../images/content.png" width="50" height="50" title="Content">
                                                <p>`+content[c]+`</p>
                                                </div>
                                                <div class="col-3">
                                                <img src="../images/purpose.png" width="50" height="50" title="Purpose">
                                                <p>`+purpose[c]+`</p>
                                                </div>
                                            </div>
                                            <hr>
                                            <h6 style="float: right; margin:0">Autore: `+channelTitle[c]+`</h6>
                                        </div>
                                    </div>
                                `;
                                //$('#' + el + 'Pop').append(popupAction);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                        filteredTitle.push(titleVideo[c]);
                        filteredChannelName.push(channelTitle[c]);
                        filteredIDs.push(el);
                        filteredOLC.push(geoloc[c]);
                        filteredAudiences.push(audience[c]);
                        filteredContents.push(content[c]);
                        filteredDetails.push(detail[c]);
                        filteredPurposes.push(purpose[c]);
                        filteredLanguages.push(language[c]);
                        z++;
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    window.removeMarker(el);
                }
            } else {
                window.removeMarker(el);
            }
        } else {
            window.removeMarker(el);
        }
    });
}

async function filterAndNear() {
    await filtra();
    nearVideos();
}

// Creo gli array per contentere i dati delle clip vicine
var nearVideoID = [], nearOLC = [], nearContent = [], nearAudience = [], nearDetail = [],
    nearPurpose = [], nearLanguage = [];

function nearVideos() {
    nearVideoID.splice(0, nearVideoID.length);
    nearOLC.splice(0, nearOLC.length);
    nearAudience.splice(0, nearAudience.length);
    nearContent.splice(0, nearContent.length);
    nearDetail.splice(0, nearDetail.length);
    nearPurpose.splice(0, nearPurpose.length);
    nearLanguage.splice(0, nearLanguage.length);

    filteredIDs.forEach((el, index) => {
        try {
            //if (flteredOLC[index].substring(0, filteredOLC[index].length - 3) === window.getOLC().substring(0, window.getOLC().length - 3)) {
            if (window.isLessThan(50, window.getOLC(), filteredOLC[index])) {
                nearVideoID.push(el);
                nearOLC.push(filteredOLC[index]);
                nearContent.push(filteredContents[index]);
                nearAudience.push(filteredAudiences[index]);
                nearDetail.push(filteredDetails[index]);
                nearPurpose.push(filteredPurposes[index]);
                nearLanguage.push(filteredLanguages[index]);
            }
        } catch (e) {
            console.log(e);
        }
    });

    console.log(nearVideoID);
    snackMessage(siteLanguage(), nearVideoID.length);

}

function snackMessage(lang, numberVideo){
    var x = document.getElementById("snackbar");

    if (lang === "en"){
        if(numberVideo === 1){
            x.textContent = "There is " + numberVideo + " near clip";
        }else{
            x.textContent = "There are " + numberVideo + " near clips";
        }
    } else {
        if(numberVideo === 1){
            x.textContent = "C'è " + numberVideo + " clip vicina";
        }else{
            x.textContent = "Ci sono " + numberVideo + " clips vicine";
        }
    }

        x.className = "show";
        setTimeout(function(){
            x.className = x.className.replace("show", "");
        }, 2000);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PLAYER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var tag = document.createElement('script');

tag.src = "https://youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: 1,
        width: 1,
        events: {
            'onReady': onPlayerReady,
        }
    });
}

function onPlayerReady(event) {
    if (player.getVolume() !== 100) {
        player.setVolume(100);
    }
}

var firstClip, purposeMore;

var alreadyVisited = [];

function whereMI() {
    player.pauseVideo();

    if (nearVideoID.length === 0 && firstClip === true) {
      var text;
      if (siteLanguage() == "it") {
        text = "Non ci sono clip in questo luogo, premi il pulsante next per recarti al prossimo luogo";
      } else {
        text = "No available cli here, clic the button to go to the next place";
      }
        window.voice(text, siteLanguage());
    } else if (nearVideoID.length > 0 && !nearPurpose.includes("what")) {
      if (siteLanguage() == "it") {
        text = "Premi il tasto more per sapere di più su questo luogo";
      } else {
        text = "Press more to know more about this place";
      }
        window.voice(text, siteLanguage());
    } else if (nearVideoID.length === 0 && firstClip === false) {
      if (siteLanguage() == "it") {
        text = "Clip terminate, premi il pulsante next per recarti al prossimo luogo"
      } else {
        text = "No more clips, press next to go to the next place";
      }
        window.voice(text, siteLanguage());
    } else {
        player.loadVideoById(nearVideoID[nearPurpose.indexOf("what")]);
        nearOLC.forEach((el, index) => {
            alreadyVisited.push(el);
        });
        previousLocation = lastLastPrevious;
        lastLastPrevious = window.getOLC();
        alreadyPlayed.push(nearVideoID[nearPurpose.indexOf("what")]);
        nearVideoID.splice(nearPurpose.indexOf("what"), 1);
        nearOLC.splice(nearPurpose.indexOf("what"), 1);
        nearPurpose.splice(nearPurpose.indexOf("what"), 1);
        nearContent.splice(nearPurpose.indexOf("what"), 1);
        nearAudience.splice(nearPurpose.indexOf("what"), 1);
        nearDetail.splice(nearPurpose.indexOf("what"), 1);
        nearLanguage.splice(nearPurpose.indexOf("what"), 1);
        purposeMore = "how";
        firstClip = false;
    }

}

function more() {
    player.pauseVideo();
    if (firstClip === true && nearPurpose.includes("what")) {
        whereMI();
    } else {
        if (purposeMore === "how") {
            if (nearPurpose.indexOf("how") === -1) {
                player.loadVideoById(nearVideoID[nearPurpose.indexOf("why")]);
                nearOLC.forEach((el, index) => {
                    alreadyVisited.push(el);
                });
                previousLocation = lastLastPrevious;
                lastLastPrevious = window.getOLC();
                alreadyPlayed.push(nearVideoID[nearPurpose.indexOf("why")]);
                nearVideoID.splice(nearPurpose.indexOf("why"), 1);
                nearOLC.splice(nearPurpose.indexOf("why"), 1);
                nearPurpose.splice(nearPurpose.indexOf("why"), 1);
                nearContent.splice(nearPurpose.indexOf("why"), 1);
                nearAudience.splice(nearPurpose.indexOf("why"), 1);
                nearDetail.splice(nearPurpose.indexOf("why"), 1);
                nearLanguage.splice(nearPurpose.indexOf("why"), 1);
                purposeMore = "why";
                firstClip = false;
            } else {
                player.loadVideoById(nearVideoID[nearPurpose.indexOf("how")]);
                nearOLC.forEach((el, index) => {
                    alreadyVisited.push(el);
                });
                previousLocation = lastLastPrevious;
                lastLastPrevious = window.getOLC();
                alreadyPlayed.push(nearVideoID[nearPurpose.indexOf("how")]);
                nearVideoID.splice(nearPurpose.indexOf("how"), 1);
                nearOLC.splice(nearPurpose.indexOf("how"), 1);
                nearPurpose.splice(nearPurpose.indexOf("how"), 1);
                nearContent.splice(nearPurpose.indexOf("how"), 1);
                nearAudience.splice(nearPurpose.indexOf("how"), 1);
                nearDetail.splice(nearPurpose.indexOf("how"), 1);
                nearLanguage.splice(nearPurpose.indexOf("how"), 1);
                purposeMore = "why";
                firstClip = false;
            }
        } else {
            if (nearPurpose.indexOf("why") === -1) {
                if (nearPurpose.indexOf("how") === -1) {
                  var text;
                  if (siteLanguage() == "it") {
                    text = "Clip terminate, premi il pulsante next per recarti al prossimo luogo";
                  } else {
                    text = "No more clip, press the button next to go to the next place";
                  }
                    window.voice(text, siteLanguage());
                } else {
                    player.loadVideoById(nearVideoID[nearPurpose.indexOf("how")]);
                    nearOLC.forEach((el, index) => {
                        alreadyVisited.push(el);
                    });
                    previousLocation = lastLastPrevious;
                    lastLastPrevious = window.getOLC();
                    alreadyPlayed.push(nearVideoID[nearPurpose.indexOf("how")]);
                    nearVideoID.splice(nearPurpose.indexOf("how"), 1);
                    nearOLC.splice(nearPurpose.indexOf("how"), 1);
                    nearPurpose.splice(nearPurpose.indexOf("how"), 1);
                    nearContent.splice(nearPurpose.indexOf("how"), 1);
                    nearAudience.splice(nearPurpose.indexOf("how"), 1);
                    nearDetail.splice(nearPurpose.indexOf("how"), 1);
                    nearLanguage.splice(nearPurpose.indexOf("how"), 1);
                    purposeMore = "why";
                    firstClip = false;
                }
            } else {
                player.loadVideoById(nearVideoID[nearPurpose.indexOf("why")]);
                nearOLC.forEach((el, index) => {
                    alreadyVisited.push(el);
                });
                previousLocation = lastLastPrevious;
                lastLastPrevious = window.getOLC();
                alreadyPlayed.push(nearVideoID[nearPurpose.indexOf("why")]);
                nearVideoID.splice(nearPurpose.indexOf("why"), 1);
                nearOLC.splice(nearPurpose.indexOf("why"), 1);
                nearPurpose.splice(nearPurpose.indexOf("why"), 1);
                nearContent.splice(nearPurpose.indexOf("why"), 1);
                nearAudience.splice(nearPurpose.indexOf("why"), 1);
                nearDetail.splice(nearPurpose.indexOf("why"), 1);
                nearLanguage.splice(nearPurpose.indexOf("why"), 1);
                purposeMore = "why";
                firstClip = false;
            }
        }
    }
}

var nextLocation;

async function next() {
    player.pauseVideo();

    try {
        await nextPositionOLC(alreadyPutInMap);
        window.route(window.getOLC(), nextLocation);
        /*if(nearVideoID.length > 0){
            previousLocation = window.getOLC();
        }*/
        var text;
        if (siteLanguage() == "it") {
          text = "Segui le indicazioni per andare nel prossimo luogo";
        } else {
          text = "Follow directions to go to the enxt place";
        }
        window.voice(text, siteLanguage());
    } catch (e) {
        console.log(e);
    }
}

function nextPositionOLC(tmpOLC) {
    var actualOLC = window.getOLC();

    tmpOLC.forEach(() =>{
        var closOLC = window.getCloserOLC(actualOLC, tmpOLC);
        if (!window.isLessThan(100, actualOLC, tmpOLC[closOLC]) && !alreadyVisited.includes(tmpOLC[closOLC])){
            return nextLocation = tmpOLC[closOLC];
        } else {
            tmpOLC.splice(closOLC, 1);
        }
    });
}

var previousLocation, lastLastPrevious;

function previous() {
    player.pauseVideo();
    if(previousLocation === undefined){
      var text;
      if (siteLanguage() == "it") {
        text = "Non hai visitato luoghi precedentemente";
      } else {
        text = "No places previously visited";
      }
        window.voice(text, siteLanguage());
    } else {
        try {
            window.route(window.getOLC(), previousLocation);
            var text;
            if (siteLanguage() == "it") {
              text = "Segui le indicazioni per ritornare nel luogo precedente";
            } else {
              text = "Follow directions to go to the previous place";
            }
            window.voice(text, siteLanguage());
        } catch (e) {
          var text;
          if (siteLanguage() == "it") {
            text = "Non hai visitato luoghi precedentemente";
          } else {
            text = "No places previously visited";
          }
            window.voice(text, siteLanguage());
        }
    }
}

function pause() {
    player.pauseVideo();
}

function continueAction() {
    player.playVideo();
}

var alreadyPlayed = [];
var alreadyPutInPlaylist = [];

function insertInPlaylist() {
    if (alreadyPlayed.length > 0) {
        $('#noVideo').hide();

        alreadyPlayed.forEach((el, index) => {
            if (!alreadyPutInPlaylist.includes(el)) {

                var myPanel = $('<iframe src="https://www.youtube.com/embed/' + el + '?rel=0">');

                $('#corpo').append(myPanel);

                alreadyPutInPlaylist.push(el);
            }
        })
    }
}

window.refreshMap = async function refresh() {
    alreadyPutInMap.splice(0, alreadyPutInMap.length);
    alreadyVisited.splice(0, alreadyVisited.length);
    geoloc.splice(0, geoloc.length);
    id.splice(0, id.length);
    audience.splice(0, audience.length);
    content.splice(0, content.length);
    detail.splice(0, detail.length);
    purpose.splice(0, purpose.length);
    language.splice(0, language.length);
    channelTitle.splice(0, channelTitle.length);
    titleVideo.splice(0, titleVideo.length);

    await dbSearch();
    await smallSearch();
    await mediumSearch();
    await filtra();
    firstClip = true;
    purposeMore = "what";
    nearVideos();
};


function setCookie(language, content, pubblico, direction) {
    try{
    var cookie = "firstName=prefer; data=" + encodeURIComponent(language) + "-" + encodeURIComponent(direction) + "-";

    content.forEach((el, index) => {
        if (index === 0) {
            cookie += encodeURIComponent(el);
        } else {
            cookie += "." + encodeURIComponent(el);
        }
    });

    cookie += "-";

    pubblico.forEach((el, index) => {
        if (index === 0) {
            cookie += encodeURIComponent(el);
        } else {
            cookie += "." + encodeURIComponent(el);
        }
    });

    cookie += "; max-age=10000000";

    $.cookie("pref", cookie);
    }catch(e){
        console.log(e);
    }
}

function getCookie() {
    try {

    var cookieValue = $.cookie("pref");

        var cookieArr = cookieValue.split(";");
        var cookieArr1 = cookieArr[1].split("=");
        var cookieArr2 = cookieArr1[1].split("-");

        $('#Lingua option[value="' + cookieArr2[0] + '"]').prop('selected', true);

        $('input:radio[value="' + cookieArr2[1] + '"]').prop('checked', true);

        var tempCont = cookieArr2[2].split(".");
        tempCont.forEach(el => {
            $('input[value="' + el + '"]').prop('checked', true);
        });

        var tempPubb = cookieArr2[3].split(".");
        tempPubb.forEach(el => {
            $('input[value="' + el + '"]').prop('checked', true);
        });
    } catch (e) {
        console.log(e);
    }
}

window.returnDir = function () {
    return $("input:radio[name=Percorso]:checked").val();
};

async function dbpedia(position, approx) {
    var lat = OpenLocationCode.decode(position).latitudeLo;
    var long = OpenLocationCode.decode(position).longitudeLo;
    var lang = siteLanguage();
    console.log(lang);

    var lang = siteLanguage();

    var queryPlaces = [
        "  PREFIX dbo: <http://dbpedia.org/ontology/>",
        "  PREFIX dbr: <http://dbpedia.org/resource/>",
        "  PREFIX dbp: <http://dbpedia.org/property/>",
        "  PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
        "  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "  SELECT  DISTINCT ?name ?lat ?long ?abstract ?img",
        "    where {",
        "       ?place rdfs:label ?name .",
        "       FILTER (lang(?name) = '" + lang + "')",
        "       ?place dbo:thumbnail ?img.",
        "       ?place geo:lat ?lat . ",
        "       ?place geo:long ?long . ",
        "       OPTIONAL {?place dbo:abstract ?abstract.}",
        "       FILTER (?lat > " + (lat - approx) + " && ?lat < " + (lat + approx) + ")",
        "       FILTER (?long > " + (long - approx) + " && ?long <" + (long + approx) + ") ",
        "       FILTER (lang(?abstract) = '" + lang + "')",
        "     }",
        " limit 1500"
    ].join(" ");

    var url = 'https://dbpedia.org/sparql?query=' + encodeURIComponent(queryPlaces) + '&format=json';

    console.log(url);

    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            resolve(JSON.parse(xhr.response).results);
        };
        xhr.send();
    });
}

async function dbSearch() {
    var dbSearch = await dbpedia(window.getOLC(), 0.02);

    dbSearch.bindings.forEach((elm, index) => {
        var id = elm.lat.value.toString() + elm.long.value.toString();

        var olcDB = window.encode(elm.lat.value, elm.long.value);

        if (!alreadyPutInMap.includes(olcDB)) {

            var popup;
            popup = document.createElement('div');
            popup.id = id + "Pop";

            alreadyPutInMap.push(olcDB);

            popup.innerHTML = `
                                <h5>` + elm.name.value + `</h5>
                                <div class="media" style="margin-bottom: 1.2em">
                                    <img id="`+id+`Img" src="`+elm.img.value+`" class="align-self-end mr-3" alt="`+elm.name.value+`" width="300" height="200">
                                    <div class="media-body">
                                        <div class="container">
                                            <p>` + elm.abstract.value + `</p>
                                        </div>
                                    </div>
                                </div>
                                `;

            window.positionMarkerInterestPoint(elm.lat.value, elm.long.value, popup);

        }
    });
}

function siteLanguage() {
  var pathArray = window.location.pathname.split('/');
  if (pathArray[pathArray.length - 2] == "en") {
    return "en";
  } else {
    return "it";
  }
}
