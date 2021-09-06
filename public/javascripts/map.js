import * as map from "../modules/streetmap.js";

// The DOMContentLoaded event fires when the initial HTML document has been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading
document.addEventListener("DOMContentLoaded", (event) => {
    var mapLoaded = map.initBrowserMap();      // Initialize the map
    window.getOLC = function (high_precision) {
        if (typeof high_precision === 'undefined') {
            return OpenLocationCode.encode(map.getMarkerPosition().lat, map.getMarkerPosition().lng, OpenLocationCode.CODE_PRECISION_NORMAL);
        } else {
            return OpenLocationCode.encode(map.getMarkerPosition().lat, map.getMarkerPosition().lng, OpenLocationCode.CODE_PRECISION_EXTRA);
        }
    };
    window.removeMarker = function(id) {
      map.removeMarker(id);
    };
    window.setPositionChangedCallback = function(callback) {
      map.setPositionChangedCallback(callback);
    };
    window.OLCdistance = function(OLC1, OLC2) {
      return map.OLCdistance(OLC1, OLC2);
    };
    window.getCloserOLC = function(actualOLC, OLCarray) {
      return map.getCloserOLC(actualOLC, OLCarray);
    };
    window.getOLCsWithin = function(actualOLC, OLCarray, maxDistance) {
      return map.getOLCsWithin(actualOLC, OLCarray, maxDistance);
    }
});

// Keep the viewport the same dimension of the screen on smartphones
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
    // We execute the same script as before
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});
