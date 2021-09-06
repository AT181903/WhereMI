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
                    $('#btn').attr("src", response.items[0].snippet.thumbnails.default.url);
                    $('#nome').append(response.items[0].snippet.title);
                    $('#Account').show();

                    

                }
            }.bind(this)
        });
    }
};

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  }

function initClient() {
    gapi.client.init({
      clientId: /* Add Client ID */,
      scope: "https://www.googleapis.com/auth/youtube.force-ssl"
    }).then(function () {
        $('#signOut').on('click', function() {
            gapi.auth2.getAuthInstance().signOut();
            window.location.replace("https://site181903.tw.cs.unibo.it/");
        });
    });
  }

  function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }