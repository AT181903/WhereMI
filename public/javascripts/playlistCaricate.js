
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
        loadClientPlaylist();
    }
}

function loadClientPlaylist() {
    gapi.client.load('youtube', 'v3', function() {
        var request = gapi.client.youtube.playlists.list({
            mine: true,
            part: 'snippet, contentDetails'
        });
        request.execute(function() {
            getPlaylists();
        })
    });
}

//take playlist from channel
function getPlaylists() {
    $("#loader").hide();
    var requestOptions = {
        "part": "snippet,contentDetails,status",
        "mine": true,
        "maxResults": 50
    };

    var request = gapi.client.youtube.playlists.list(requestOptions);

    request.execute(function(response) {
        showPlaylists(response.result);
    })
}

function showPlaylists(res) {
    // Fa vedere tutti i dati
    if (res.items && res.items.length > 0) {
        console.log("Trovate " + res.pageInfo.totalResults + " playlist");
        $.each(res.items, function(i, item) {
            try{
            console.log(item);
            var nome = item.snippet.title;
            var descrizione = item.snippet.description;
            var pID = item.id;
            var link = 'https://www.youtube.com/playlist?list=' + item.id;
            var thum = item.snippet.thumbnails.high.url;
            var stat= item.status.privacyStatus;
            var clip = item.contentDetails.itemCount; 
            var del = item.id;

            var myCol = $('<div class="col-sm-3 col-md-3 pb-2"></div>');
            var myPanel = $(`
            <div id="` + i + `V" class="card border-primary mb-3">
                <img src="`+thum+`" class="card-img-top" alt="thumbnail" height="300">
                <div class="card-body" id="` + i + `Panel" text-primary>
                    <h5 class="card-title">Titolo: ` + nome + `</h5>
                    <p class="card-text">Descrizione: ` + descrizione + `</p>
                </div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">Numero Clip: ` + clip + `</li>
                    <li class="list-group-item">
                        <div class="custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input" id="` + i + `Statu">
                            <label class="custom-control-label" for="` + i + `Stat">Private</label>
                        </div>
                    </li>
                </ul>
                <div class="card-body" id="` + i + `Pannello" text-primary>
                    <button class="btn btn-danger" type="button" onclick="deletePlaylist('` + del + `')">Elimina Playlist</button><hr>
                    <a id="vid" class="card-link" href="` + link + `" target="_blank">` + link + `</a>
                </div>
            </div>
            `);
            myPanel.appendTo(myCol);
            myCol.appendTo('#Pannello');

            if (stat === "private") {
                console.log("sono privato" + pID);
                $("label[for='" + i + "Stat']").text("Privato");
                $('input[id="' + i + 'Statu"]').val('private');
                $('input[id="' + i + 'Statu"]').attr('checked', false);
            } else {
                console.log("sono pubblico" + pID);
                $("label[for='" + i + "Stat']").text("Pubblico");
                $('input[id="' + i + 'Statu"]').val('public');
                $('input[id="' + i + 'Statu"]').attr("checked", "checked");
            }

            $("label[for='" + i + "Stat']").click('change', function () {
                if (stat === "private") {
                    setStatusToPublic(pID, nome);
                    stat = "public";
                    $("label[for='" + i + "Stat']").text("Pubblico");
                    $('input[id="' + i + 'Statu"]').val('public');
                    $('input[id="' + i + 'Statu"]').attr("checked", "checked");
                    alert("La playlist è pubblica!");
                } else {
                    setStatusToPrivate(pID, nome);
                    stat = "private";
                    $("label[for='" + i + "Stat']").text("Privato");
                    $('input[id="' + i + 'Statu"]').val('private');
                    $('input[id="' + i + 'Statu"]').attr('checked', false);
                    alert("La playlist è privata!");
                }
            });
        }catch(e){
            console.log(e);
        }
        })
    } else {
        console.log("Nessuna playlist in questo canale");
        $('#ifNoPlaylist').show();
    }
}

function createPlaylist() {
    var name = $('#nomePlaylist').val();
    var descr = $('#descrPlaylist').val();
    var vis = $('#visibilitaFormControlSelect1 :selected').text();
    var prove;
    if(vis === "Privato"){
        prove = "private";   
    }else if(vis === "Pubblico"){
        prove = "public";
    }
    console.log(vis + " " + prove);
    $('.card').hide();
    $('#createModal').hide();
    $("#loader").show();
    return gapi.client.youtube.playlists.insert({
        "part": "snippet, status",
        "resource": {
            "snippet": {
                "title": name,
                "description": descr
            },
            "status": {
                "privacyStatus": prove
            }
        }
    }).then(function(response) {
        console.log("Response", response);
            location.reload();
    },
    function(err) { 
        console.error("Execute error", err); 
});
}

function setStatusToPrivate(pID, nome) {
    return gapi.client.youtube.playlists.update({
        "part": "snippet, status",
        "resource": {
            "id": pID,
            "snippet": {
                "title": nome
              },
            "status": {
                "privacyStatus": "private"
            },
        }
    })
        .then(function (response) {
                console.log("Response", response);
            },
            function (err) {
                console.error("Execute error", err);
            });
}

function setStatusToPublic(pID, nome) {
    return gapi.client.youtube.playlists.update({
        "part": "snippet, status",
        "resource": {
            "id": pID,
            "snippet": {
                "title": nome
              },
            "status": {
                "privacyStatus": "public"
            },
        }
    })
        .then(function (response) {
                console.log("Response", response);
            },
            function (err) {
                console.error("Execute error", err);
            });
}

function deletePlaylist(id) {
    var r = confirm("Sei sicuro di voler cancellare la playlist?");
    if (r === true) {
        $('.card').hide();
        $("#loader").show();
        return gapi.client.youtube.playlists.delete({
            "id": id
        })
            .then(function(response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log("Response", response);
                    setTimeout(function () {
                        location.reload();
                    }, 10000);
                },
                function(err) { 
                    console.error("Execute error", err); 
            });
    }
}