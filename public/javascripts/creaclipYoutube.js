var googleApiClientReady = function () {
    gapi.auth.init(function () {
        window.setTimeout(checkAuth, 1);
    });
};

function checkAuth() {
    gapi.auth.authorize({
            client_id: /* Add client id */,
            scope: "https://www.googleapis.com/auth/youtube.force-ssl",
            immediate: true
        }, handleAuthResult
        );
}

function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        loadAPIClientInterfaces();
    }
}

var playlistId;

function loadAPIClientInterfaces() {
    gapi.client.load("youtube", "v3", function () {
        var request = gapi.client.youtube.channels.list({
            mine: true,
            part: "contentDetails"
        });
        request.execute(function (response) {
            playlistId =
                response.result.items[0].contentDetails.relatedPlaylists.uploads;
            requestVideoPlaylist(playlistId);
        });
    });
}

// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(playlistId, pageToken) {
    var requestOptions = {
        playlistId: playlistId,
        part: "snippet , status",
        maxResults: 50
    };

    if (pageToken) {
        requestOptions.pageToken = pageToken;
    }

    var request = gapi.client.youtube.playlistItems.list(requestOptions);
    request.execute(function (response) {
        try {
            showDatas(response.result);
        } catch (e) {
            console.log(e);
        }
    });
}

var alreadyPutInMap = [];

function showDatas(res) {
    $("#loader").hide();

    // Fa vedere tutti i dati
    if (res.items && res.items.length > 0) {
        console.log("Trovati " + res.pageInfo.totalResults + " video");

        res.items.forEach((item, i) => {
            var id = item.snippet.resourceId.videoId;
            var descr = item.snippet.description;
            var description = descr.split(":");
            var tempOLC;

            tempOLC = correctOLC(description[0]);

            if (tempOLC === undefined || tempOLC.indexOf(" ") !== -1) {
                tempOLC = correctOLC(description[2]);
                if (tempOLC === undefined || tempOLC.indexOf(" ") !== -1) {
                    console.log("OLC non valido");
                } else {
                    var OOLC = tempOLC.split("+");
                    var OOOLC = OOLC[0];
                    if (OOOLC.length === 8 && !alreadyPutInMap.includes(id)) {
                        try {
                            var popup;
                            popup = document.createElement("div");
                            popup.id = id + "Pop";

                            $(".leaflet-popup-content").css({
                                padding: "1.3em"
                            });

                            window.positionMarkerClip(tempOLC, popup);

                            alreadyPutInMap.push(id);

                            var popupPlayer = `
                            <iframe src= "https://www.youtube.com/embed/` + id + `?rel=0"></iframe>
                            <p style="margin-bottom:12px; margin-top:12px; background-color:yellow; font-size:15px" class="col text-center"><b>
                                Per modificare la descrizione e lo stato della clip visita la pagina seguente:</b></p>
                            <a style="font-size:15px" class="col text-center" href="https://site181903.tw.cs.unibo.it/caricati" target="_blank">
                                Clip Caricate</a>
                            `;
                            popup.innerHTML = popupPlayer;

                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            } else {
                var OOLC = tempOLC.split("+");
                var OOOLC = OOLC[0];
                if (OOOLC.length === 8 && !alreadyPutInMap.includes(id)) {
                    try {
                        var popup;
                        popup = document.createElement("div");
                        popup.id = id + "Pop";

                        $(".leaflet-popup-content").css({
                            padding: "1.3em"
                        });

                        window.positionMarkerClip(tempOLC, popup);

                        alreadyPutInMap.push(id);

                        var popupPlayer = `
              <iframe src= "https://www.youtube.com/embed/` + id + `?rel=0"></iframe>
              <p style="margin-bottom:12px; margin-top:12px; background-color:yellow; font-size:15px" class="col text-center"><b>
                Per modificare la descrizione e lo stato della clip visita la pagina seguente:</b></p>
              <a style="font-size:15px" class="col text-center" href="https://site181903.tw.cs.unibo.it/caricati" target="_blank">
                Clip Caricate</a>
            `;
                        popup.innerHTML = popupPlayer;
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        });
    }
}

function correctOLC(olcc) {
    try {
        if (olcc.length < 11) {
            olcc = undefined;
        } else if (olcc.length === 11) {
            if (olcc[olcc.length - 1] === ".") {
                olcc = olcc.substring(0, olcc.length - 1);
            }
        } else if (olcc.length === 12) {
            if (olcc[olcc.length - 1] === ".") {
                olcc = olcc.substring(0, olcc.length - 1);
            }
        } else if (olcc.length === 13 && olcc[olcc.length - 1] === ".") {
            if (olcc[olcc.length - 1] === ".") {
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

window.refreshCrea = function () {
    window.setTimeout(googleApiClientReady(), 4);
};
