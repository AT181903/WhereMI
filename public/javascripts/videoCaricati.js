var googleApiClientReady = function () {
    gapi.auth.init(function () {
        window.setTimeout(checkAuth, 1);
    });
};

function checkAuth() {
    gapi.auth.authorize({
        client_id: /* Add Client ID */,
        scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
        immediate: true
    }, handleAuthResult);
}

function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        loadAPIClientInterfaces();
    }
}

var playlistId;

function loadAPIClientInterfaces() {
    gapi.client.load('youtube', 'v3', function () {
        var request = gapi.client.youtube.channels.list({
            mine: true,
            part: 'contentDetails'
        });
        request.execute(function (response) {
            playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
            requestVideoPlaylist(playlistId);
        });
    });
}


// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(playlistId, pageToken) {
    var requestOptions = {
        playlistId: playlistId,
        part: 'snippet , status',
        maxResults: 50
    };

    if (pageToken) {
        requestOptions.pageToken = pageToken;
    }

    var request = gapi.client.youtube.playlistItems.list(requestOptions);
    request.execute(function (response) {
        showDatas(response.result)
    })

}

function showDatas(res) {
    console.log("Video", res);

    $("#loader").hide();

    if (res.items && res.items.length > 0) {
        console.log("Trovati " + res.pageInfo.totalResults + " video");

        $.each(res.items, function (i, item) {
            try{
            console.log(item);
            var nome = item.snippet.title;
            //var image = item.snippet.thumbnails.default.url;
            var descr = item.snippet.description;
            //var link = 'https://www.youtube.com/watch?v=' + item.snippet.resourceId.videoId;
            var stat = item.snippet.resourceId.videoId;
            var vis = item.status.privacyStatus;
            var newVisibility = vis;
            console.log("Descr video " + i + ": " + descr);
            var descrizione = descr.split(":");
            var geoloc = descrizione[0];
            var purpose = descrizione[1];
            var language = descrizione[2];
            var content = descrizione[3];
            var pubblico = descrizione[4];

            try {
                var detailTmp = descrizione[5];
                var carAt2 = detailTmp.charAt(2);
                var detailTmp2 = detailTmp.split(carAt2);
                var detail = detailTmp2[0];
            } catch (e) {
                console.log(e);
            }

            gapi.client.youtube.videos.list({
                "part": "statistics",
                "id": stat
                })
                .then(function(response) {
                    console.log(response.result.items[0].statistics);
                    var item = response.result.items[0].statistics;
                    var visual = item.viewCount;
                    var like = item.likeCount;
                    var dislike = item.dislikeCount;
                

            var myCol = $('<div class="col-sm-3 col-md-3 pb-2"></div>');
            var myPanel = $(`
            <div id="` + i + `V" class="card border-primary mb-3">

            <iframe class="card-img-top" src= "https://www.youtube.com/embed/` + stat + `?rel=0"></iframe>
            
            <div class="card-body text-center" id="` + geoloc + `Panel" text-primary>

            <div class="row">
                <div class="col">
                    <h5 class="card-title"><img src="../images/macro-influencer.png" width="40" height="40" style="margin-right: 0.1em" title="Visualizzazioni">` + visual + `</h5>
                </div>
                <div class="col">
                    <h5 class="card-title"><img src="../images/like.png" width="40" height="40" style="margin-right: 0.1em" title="Like">` + like +`</h5>
                </div>
                <div class="col">
                    <h5 class="card-title"><img src="../images/finger.png" width="40" height="40" style="margin-right: 0.1em" title="Dislike">` + dislike + `</h5>
                </div>
                <div class="col">
                    <button type="button" class="btn btn-primary" onclick="changeEdit('` + i + `')">Edit</button>
                </div>
            </div>
            <div id="` + i + `">
            <p class="card-text">
            <label>
            <p>Lingua</p><select name="scelta" id="` + i + `L" class="custom-select">
              <option value="ita">Italiano</option>
              <option value="eng">English</option>
              <option value="deu">Deutsch</option>
              <option value="fra">Français</option>
              <option value="esp">Español</option>
            </select>
            </label>
            </p><hr>
            <p class="card-text">
            <label>
            <p>Contenuto</p><select name="contenuto" id="` + i + `C" class="custom-select">
              <option value="art">Arte</option>
              <option value="his">Storia</option>
              <option value="flk">Folklore</option>
              <option value="mod">Cultura Moderna</option>
              <option value="rel">Religione</option>
              <option value="cui">Cucina e Drink</option>
              <option value="spo">Sport</option>
              <option value="mus">Musica</option>
              <option value="mov">Film</option>
              <option value="fas">Moda</option>
              <option value="shp">Shopping</option>
              <option value="tec">Tecnologia</option>
              <option value="pop">Cultura Pop e Gossip</option>
              <option value="prs">Esperienza Personale</option>
              <option value="nat">Natura</option>
              <option value="oth">Altro</option>
            </select>
            </label>
            </p><hr>
            <p class="card-text">
            <label>
            <p>Pubblico</p><select name="pubblico" id="` + i + `P" class="custom-select">
              <option value="Agen">Pubblico Generico</option>
              <option value="Apre">Pre-Scuola</option>
              <option value="Aelm">Scuola Primaria</option>
              <option value="Amid">Scuola Media</option>
              <option value="Alic">Scuola Superiore</option>
            </select>
            </label>
            </p><hr>
            <p class="card-text">
            <label>
            <p>Scopo</p><select name="scopo" id="` + i + `S" class="custom-select">
              <option value="what">What</option>
              <option value="how">How</option>
              <option value="why">Why</option>
            </select>
            </label>
            </p>
            <hr>
            <p class="card-text">
            <div id="` + i + `DD">
            <label>
            <p>Livello di Dettaglio</p>
            <select name="dettaglio" id="` + i + `D" class="custom-select">
              <option value="P1">1</option>
              <option value="P2">2</option>
              <option value="P3">3</option>
            </select>
            </label>
            </p><hr>
            </div>
            <div class="custom-control custom-switch">
              <input type="checkbox" class="custom-control-input" id="` + i + `Statu">
              <label class="custom-control-label" for="` + i + `Stat">Private</label>
            </div>
            <hr>
            <button class="btn btn-warning" type="button" onclick="saveButton('` + stat + `','` + i + `', '` + nome + `', '` + descrizione[0] + `')">Salva</button>
            <button class="btn btn-danger" type="button" onclick="deleteButton('` + stat + `','` + i + `')">Elimina</button>
            </div>
            </div></div>
            `);
            myPanel.appendTo(myCol);
            myCol.appendTo('#contentPanel');
            $('#' + i + '').hide();

            try {
                $('#' + i + 'L option[value=' + language + ']').attr('selected', 'selected');
            } catch (e) {
                console.log(e);
            }
            try {
                $('#' + i + 'S option[value=' + purpose + ']').attr('selected', 'selected');
            } catch (e) {
                console.log(e);
            }
            try {
                $('#' + i + 'D option[value=' + detail + ']').attr('selected', 'selected');
            } catch (e) {
                console.log(e);
            }
            try {
                $('#' + i + 'C option[value=' + content + ']').attr('selected', 'selected');
            } catch (e) {
                console.log(e);
            }
            try {
                $('#' + i + 'P option[value=' + pubblico + ']').attr('selected', 'selected');
            } catch (e) {
                console.log(e);
            }

            if (vis === "private") {
                $("label[for='" + i + "Stat']").text("Privato");
                $('input[id="' + i + 'Statu"]').val('private');
                $('input[id="' + i + 'Statu"]').attr('checked', false);
            } else {
                $("label[for='" + i + "Stat']").text("Pubblico");
                $('input[id="' + i + 'Statu"]').val('public');
                $('input[id="' + i + 'Statu"]').attr("checked", "checked");
            }

            $("label[for='" + i + "Stat']").click('change', function () {
                if (newVisibility === "private") {
                    newVisibility = "public";
                    $("label[for='" + i + "Stat']").text("Pubblico");
                    $('input[id="' + i + 'Statu"]').val('public');
                    $('input[id="' + i + 'Statu"]').attr("checked", "checked");
                } else {
                    newVisibility = "private";
                    $("label[for='" + i + "Stat']").text("Privato");
                    $('input[id="' + i + 'Statu"]').val('private');
                    $('input[id="' + i + 'Statu"]').attr('checked', false);
                }
            });

            if ($('#' + i + 'S option:selected').val() !== "why") {
                $('#' + i + 'DD').hide();
            }

            $('#' + i + 'S').on('change', function () {
                if ($('#' + i + 'S option:selected').val() === "why") {
                    $('#' + i + 'DD').show();
                } else {
                    $('#' + i + 'DD').hide();
                }
            });
        })
    }catch(e){
        console.log(e);
    }
        })
   
    } else {
        console.log("Nessun video in questo canale");
        $('#ifNoVideo').show();
    }
}

function changeEdit(i) {
    if ($('#' + i + '').is(':visible')) {
        $('#' + i + '').hide();
    } else {
        $('#' + i + '').show();
    }
}

function saveButton(videoID, id, nome, olc) {
    var description = olc + ':' + $('#' + id + 'S option:selected').val() + ':' + $('#' + id + 'L option:selected').val() + ':' + $('#' + id + 'C option:selected').val() + ':' + $('#' + id + 'P option:selected').val() + ':' + $('#' + id + 'D option:selected').val();
    var status = $('input[id="' + id + 'Statu"]').val();
    console.log(description);
    console.log(status);

    return gapi.client.youtube.videos.update({
        "part": "snippet, status",
        "resource": {
            "id": videoID,
            "snippet": {
                "title": nome,
                "description": description,
                "categoryId": "22"
            },
            "status": {
                "privacyStatus": status
            }
        }
    })
        .then(function (response) {
                console.log("Response", response);
                $('#' + id + '').hide();
            },
            function (err) {
                console.error("Execute error", err);
            });
}

function deleteButton(videoID, i) {
    if (confirm("Sei sicuro di voler cancellare il video?")) {
        $("#loader").css('z-index', 3000);
        $("#loader").show();
        $('#' + i + '').remove();
        $("#primoContainer").hide();
        return gapi.client.youtube.videos.delete({
            "id": videoID
        })
            .then(function (response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log("Response", response);
                    setTimeout(function () {
                        location.reload();
                    }, 10000);
                },
                function (err) {
                    console.error("Execute error", err);
                });
    }


}