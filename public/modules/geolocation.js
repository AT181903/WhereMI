// Variable used to indicate the user that the position is being retrived
export var retrivingPosition = {
  status: false,
  get value() {
    return this.status;
  },
  set value(val) {
    this.status = val;
    this.registeredListener(val);
  },
  addListener: function(listener) {
    this.registeredListener = listener;
  },
  registeredListener: function() {}
};

export function getLocation(successfullCallback) {
  if (locationAPIavailable()) {
    retrivingPosition.value = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      geo_success(position, successfullCallback, "ONCE");
    }, geo_error, geo_options);
  }
}

var watchID;
export function trackLocation(successfullCallback) {
  if (locationAPIavailable()) {
    if (!retrivingPosition.value) {
      retrivingPosition.value = true;
      watchID = navigator.geolocation.watchPosition(function(position) {
        geo_success(position, successfullCallback, "TRACK");
      }, null, geo_options);
    }
    else {
      retrivingPosition.value = false;
      navigator.geolocation.clearWatch(watchID);
    }
  }
}

function locationAPIavailable() {
  if ("geolocation" in navigator) {
    return true;
  }
  else {
    alert("Error! It hasn't been possible to read your actual position because your browser doesn't support geolocation");
    return false;
  }
}

function geo_success(position, callback, type) {
  if (type === "ONCE") {
    retrivingPosition.value = false;
  }
  callback(position);
}

function geo_error(error) {
  retrivingPosition.value = false;
  console.log("Sorry, no position available." + '\n' + error.code + ': ' + error.message);
  if (error.code === 1) {
    alert("You've denied the authorization to read your position, \ncheck your browser settings.");
  }
  else {
    alert("Error! Try again");
  }
}

var geo_options = {
  enableHighAccuracy: true,
  //  Maximum age in milliseconds of a possible cached position that is acceptable to return
  maximumAge        : 30000,
  // Maximum length of time (in milliseconds) the device is allowed to take in order to return a position
  timeout           : 10000
};
