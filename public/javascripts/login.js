function renderButton() {
    gapi.signin2.render('signGoogle', {
        'scope': 'https://www.googleapis.com/auth/youtube.force-ssl',
        'width': 200,
        'height': 40,
        'longtitle': true,
        'theme': 'light',
        'onsuccess': signinCallback,
        'onfailure': signinCallback
    });
}

var signinCallback = function (response) {
    if (response.error) {
        console.log(response.error.message);
    } else {
        window.location.replace("https://site181903.tw.cs.unibo.it/editor");
    }
};