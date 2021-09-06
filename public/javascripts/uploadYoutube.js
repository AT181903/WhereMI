function registration() {
    $('#purpRegistration').on('change', function () {
        if (this.value === "why") {
            $('#detailLabel').show();
        } else {
            $('#detailLabel').hide();
        }
    });
}

function file() {
    $('#purpFile').on('change', function () {
        if (this.value === "why") {
            $('#detailDiv').show();
        } else {
            $('#detailDiv').hide();
        }
    });
}

var signinCallback = function (result) {
    if (result.access_token) {
        this.gapi = gapi;
        this.authenticated = true;
        this.gapi.client.request({
            path: '/youtube/v3/channels',
            params: {
                part: 'snippet',
                mine: true
            },
            callback: function (response) {
                if (response.error) {
                    console.log(response.error.message);
                } else {
                    var uploadVideo = new UploadVideo();
                    uploadVideo.ready(result.access_token);
                }
            }.bind(this)
        });
    }
};

var UploadVideo = function () {
    this.tags = ['youtube-cors-upload'];
    this.categoryId = 22;
    this.videoId = '';
    this.uploadStartTime = 0;
};


UploadVideo.prototype.ready = function (accessToken) {
    this.accessToken = accessToken;
    this.gapi = gapi;
    this.authenticated = true;
    this.gapi.client.request({
        path: '/youtube/v3/channels',
        params: {
            part: 'snippet',
            mine: true
        },
        callback: function (response) {
            if (response.error) {
                console.log(response.error.message);
            }
        }.bind(this)
    });
    $('#button').on("click", this.handleUploadClicked.bind(this));
    $('#UploadButton').on("click", this.handleUploadButtonClicked.bind(this));
};

UploadVideo.prototype.handleUploadClicked = function () {
        try {
            this.uploadFile($('#file').get(0).files[0]);
            $("#loaderYTFile").show();
            $('#button').attr('disabled', true);
        }catch (e) {
            alert("Seleziona un video prima di continuare");
        }
};

// Upload file già registrato
UploadVideo.prototype.uploadFile = function (file) {
    var olc = window.getOLC().substring(0, 6) + "00+-" + window.getOLC().substring(0, window.getOLC().length - 3) + "+-" + window.getOLC();
    var description = olc + ":" + $("#purpFile option:selected").val() + ":" + $("#langFile option:selected").val() + ":" + $("#catFile option:selected").val() + ":" + $("#pubblicoFile option:selected").val() + ":" + $("#dettaglioFile option:selected").val();
    console.log(description);

    var metadata = {
        snippet: {
            title: window.getOLC(),
            description: description,
            tags: this.tags,
            categoryId: this.categoryId
        },
        status: {
            privacyStatus: $('#privacy-statusFile option:selected').val()
        }
    };
    var uploader = new MediaUploader({
        baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
        file: file,
        token: this.accessToken,
        metadata: metadata,
        params: {
            part: Object.keys(metadata).join(',')
        },
        onError: function (data) {
            $("#loaderYTFile").hide();
            var message = data;
            try {
                var errorResponse = JSON.parse(data);
                message = errorResponse.error.message;
            } finally {
                $("#videoErrorFile").show();
                console.log(message);
            }
        }.bind(this),
        onComplete: function (data) {
            $("#loaderYTFile").hide();
            $("#videoCaricatoFile").show();
        }.bind(this)
    });
    this.uploadStartTime = Date.now();
    uploader.upload();
};

UploadVideo.prototype.handleUploadButtonClicked = function () {
    $("#loaderYTRegistration").show();
    $('#UploadButton').attr('disabled', true);
    this.uploadRegistration();
};

// Upload registrazione video
UploadVideo.prototype.uploadRegistration = async function () {
    var olc = window.getOLC().substring(0, 6) + "00+-" + window.getOLC().substring(0, window.getOLC().length - 3) + "+-" + window.getOLC();
    var description = olc + ":" + $("#purpRegistration option:selected").val() + ":" + $("#langRegistration option:selected").val() + ":" + $("#catRegistration option:selected").val() + ":" + $("#pubblicoRegistration option:selected").val() + ":" + $("#dettaglioRegistration option:selected").val();
    var title = $("#titolo").val();
    console.log(title, description);

    var file = window.uploadToServer();

    var webm;

    await file.then(video => {
        webm = video;
    });

    

    var metadata = {
        kind: 'youtube#video',
        snippet: {
            title: title,
            description: description,
            tags: this.tags,
            categoryId: this.categoryId
        },
        status: {
            privacyStatus: $('#privacy-statusRegistration option:selected').val()
        }
    };

    console.log(webm);

    var formData = new FormData();

    var meta = new Blob([JSON.stringify(metadata)], {type: 'application/json'});

    formData.append('dati', meta);

    formData.append("video", webm);

    $.ajax({
        url: 'https://www.googleapis.com/upload/youtube/v3/videos?access_token=' + this.accessToken + '&part=snippet,status',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        success: function (data) {
            console.log("Video caricato");
            $("#videoCaricatoRegistration").show();
            $("#loaderYTRegistration").hide();
            console.log("Video caricato", data);
            
        },
        error: function (data) {
            $("#loaderYTRegistration").hide();
            console.log(data);
            $("#videoErrorRegistration").show();
        }
    });
};

function decode64BLOB(string, type){
    var byteCharacters = atob(string);
    var byteNumbers = new Array(byteCharacters.length);
    for (var j = 0; j < byteCharacters.length; j++) {
      byteNumbers[j] = byteCharacters.charCodeAt(j);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var blob = new Blob([byteArray], {type: type});
    return blob;
  }
  
function encode64(blob){
    return new Promise(function(resolve, reject){
      var fileReader = new FileReader();
      fileReader.onload = function() {
          var dataUrl = this.result;
          var base64 = dataUrl.split(',')[1];
          resolve(base64);
      };

      fileReader.readAsDataURL(blob);
    });
  }
  async function getimageBlob(url){

    let response = await fetch( url);
    let result = await response.blob();
    return result;
  }


async function modifyVideo () {
    if($("#startSecond").val()){
        var startSecond = $("#startSecond").val();
    } else{
        startSecond = 0;
    }

    if($("#endSecond").val()){
        var endSecond = $("#endSecond").val();
    } else {
        var endSecond = window.audioTagDur();
    }

    var volume = $("#volumeSecond").val();

try{
    var video64 = await encode64(window.blob());

    let formData = new FormData();
    
    formData.append("audio", video64);

    $.ajax({
        url: '/modificaVideo?start='+startSecond+'&end='+endSecond+'&volume='+volume+'',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        success: function (data) {
           audioURL = URL.createObjectURL(decode64BLOB(data, 'audio/ogg; codecs=opus'));
           $("#audioControls").attr("src", audioURL);
        },
        error: function (error) {
            console.log(error);
        }
    });
} catch(e){
    console.log(e);
}
}

