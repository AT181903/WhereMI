import * as geolocation from "./geolocation.js";

// set up the map
export var map = new L.Map('map', {
    // Italy
    center: [44.5016253, 11.3583791],
    zoom: 15,
    // This prevents popup from closing
    closePopupOnClick: false
});

// create the tile layer with correct attribution
var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
export var tileLayer = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 19, attribution: osmAttrib});
map.addLayer(tileLayer);

export var marker;

export var popup;

export var markerMovementAllowed = {

    state: true,
    set value(val) {
        this.state = val;
    }
};

// This function is used to create the map for the editor
export function initEditorMap() {

    // create the popup
    popup = document.createElement('div');
    popup.id = "recordingPopup";

    const positionMarker = new L.Icon({
        iconUrl: "../images/position.png",
        //shadowUrl: "../images/marker-shadow.png",
        iconSize: [60, 60],
        iconAnchor: [30, 25],
        popupAnchor: [0, -26]
        //shadowSize: [41, 41]
    });


    // create the marker, add to the map and bind popup
    marker = L.marker([44.5016253, 11.3583791], {
        icon: positionMarker,
        alt: "You are here"
    }).addTo(map)
        .bindPopup(popup, {
            maxWidth: "auto"
        })
        .openPopup()
        .closePopup();

    // create the button to center the map on the position of the user
    var retrievePositionControl = L.Control.extend({
        options: {
            position: "bottomright"
        },
        onAdd: function (map) {
            var container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
            container.id = "positionButton";
            container.title = "Find my position";
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(container, "click", function (ev) {
                geolocation.getLocation(dataAdaptation);
            });
            return container;
        }
    });

    var refreshControl = L.Control.extend({
        options: {
            position: "bottomleft"
        },
        onAdd: function (map) {
            var container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
            container.id = "refreshButton";
            container.title = "Refresh clip";
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(container, "click", function (ev) {
                window.refreshCrea();
            });

            return container;
        }
    });
    map.addControl(new retrievePositionControl());

    map.addControl(new refreshControl());

    // this is to make the user aware that I'm waiting for his position
    geolocation.retrivingPosition.addListener(function (status) {
        let mapDOM = document.querySelector("#map");
        if (status === true) {
            mapDOM.style.cursor = "progress";
        } else {
            mapDOM.style.cursor = "default";
        }
    });

    createSearchBar();

    // clicking on the map will move the marker and center the map in that place
    map.on("click", function (ev) {
        const clickPosition = Object.create(mapPositionView);
        clickPosition.latlng = ev.latlng;
        updateLocation(clickPosition);
    });

    return true;
}

// This function is used to create the map for the Browser
export function initBrowserMap() {

    const positionMarker = new L.Icon({
        iconUrl: "../images/position.png",
        //shadowUrl: "../images/marker-shadow.png",
        iconSize: [55, 55],
        iconAnchor: [26, 25],
        popupAnchor: [18, -43]
        //shadowSize: [41, 41]
    });

    // create the marker, add to the map and bind popup
    marker = L.marker([44.5016253, 11.3583791], {
        icon: positionMarker,
        alt: "You are here"
    }).addTo(map);

    // create the button to center the map on the position of the user
    var retrievePositionControl = L.Control.extend({
        options: {
            position: "bottomright"
        },
        onAdd: function (map) {
            var container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
            container.id = "positionButton";
            container.title = "Follow my position";
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(container, "click", function (ev) {
                geolocation.trackLocation(dataAdaptation);
            });
            geolocation.retrivingPosition.addListener(function (status) {
                if (status === true) {
                    container.style.backgroundColor = "#d9d9d9";
                } else {
                    container.style.backgroundColor = null;
                }
            });
            return container;
        }
    });

    var refreshControl = L.Control.extend({
        options: {
            position: "bottomleft"
        },
        onAdd: function (map) {
            var container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
            container.id = "refreshButton";
            container.title = "Refresh clip";
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(container, "click", function (ev) {
                window.refreshMap();
            });

            return container;
        }
    });
    map.addControl(new retrievePositionControl());
    map.addControl(new refreshControl());

    // This way the geolocation is automatically enabled on page loading
    // geolocation.trackLocation(dataAdaptation);

    // this is to make the user aware that I'm waiting for his position
    // geolocation.retrivingPosition.addListener(function(status) {
    // 	let mapDOM = document.querySelector("#map");
    // 	if (status == true) {
    // 		mapDOM.style.cursor = "progress";
    // 	} else {
    // 		mapDOM.style.cursor = "default";
    // 	}
    // });

    createSearchBar();

    // clicking on the map will move the marker and center the map in that place
    map.on("click", function (ev) {
        if (!geolocation.retrivingPosition.value) {
            const clickPosition = Object.create(mapPositionView);
            clickPosition.latlng.lat = ev.latlng.lat;
            clickPosition.latlng.lng = ev.latlng.lng;
            updateLocation(clickPosition);
        }
    });

    return true;
}

// create the search bar
function createSearchBar() {
    map.addControl(new L.Control.Search({
        url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
        jsonpParam: 'json_callback',
        propertyName: 'display_name',
        propertyLoc: ['lat', 'lon'],
        moveToLocation: searchPositionFound,
        autoCollapse: false,
        autoType: false,
        minLength: 2,
        marker: false
    }));
}

function searchPositionFound(latlng, title, map) {
    const searchPosition = Object.create(mapPositionView);
    searchPosition.latlng.lat = latlng.lat;
    searchPosition.latlng.lng = latlng.lng;
    searchPosition.zoom = 18;
    updateLocation(searchPosition);
}

export function getMarkerPosition() {
    return marker.getLatLng();
}

const mapPositionView = {
    latlng: {
        lat: undefined,
        lng: undefined
    },
    zoom: null
};

function dataAdaptation(position) {
    const geoPosition = Object.create(mapPositionView);
    geoPosition.latlng.lat = position.coords.latitude;
    geoPosition.latlng.lng = position.coords.longitude;
    geoPosition.zoom = 18;
    updateLocation(geoPosition);
}

// This function is used to update the place showed by the map
var setLocation = function (mapPosView) {
    if (mapPosView.zoom != null) {
        map.setView(mapPosView.latlng, mapPosView.zoom);
    }
    marker.setLatLng(mapPosView.latlng);
};

function updateLocation(mapPosView) {
    try {
        if (markerMovementAllowed.state) {
            setLocation(mapPosView);
        }
    } catch (error) {
        console.error("Latiude/longitude undefined: " + error);
    }
}

// This function allows an external js to append a function to those called when a change of position occur
var callbackAlreadySet = false;
var original_setLocation;

export function setPositionChangedCallback(callback) {
    if (!callbackAlreadySet) {
        original_setLocation = setLocation;
        callbackAlreadySet = true;
    }
    window.callback = callback();
    setLocation = function (mapPosView) {
        original_setLocation(mapPosView);
        callback();
    }
}

// This function allows an external js to append a function to those called when a change of position occur
var callbackAlreadySetted = false;
var original_setLocationed;

function setPositionChangedCallbacked(callback) {
    if (!callbackAlreadySetted) {
        original_setLocationed = setLocation;
        callbackAlreadySetted = true;
    }
    window.callback = callback();
    setLocation = function (mapPosView) {
        original_setLocationed(mapPosView);
        callback();
    }
}


const whatIcon = new L.Icon({
	iconUrl: "../images/clipMarkerWhat.png",
	//shadowUrl: "../images/marker-shadow.png",
	iconSize: [50, 50],
	iconAnchor: [12, 41],
	popupAnchor: [13, -40]
	//shadowSize: [41, 41]
});

function addMarkerWhat(lat, lng, pop) {
    return L.marker([lat, lng], {
        icon: whatIcon
    }).addTo(map)
        .bindPopup(pop, {
            maxWidth: "auto"
        });
    //.openPopup();
}

window.OLCtoMarkerWhat = function (id, OLC, pop) {
    if (!markerList.hasOwnProperty(id)) {
        var area = OpenLocationCode.decode(OLC);
        markerList[id] = addMarkerWhat(area.latitudeCenter, area.longitudeCenter, pop);
        //console.log("Numero marker sulla mappa: " + Object.getOwnPropertyNames(markerList).length + ", Lista: " + Object.getOwnPropertyNames(markerList));
    } else {
        throw ("Il marker richiesto è già presente sulla mappa, id: " + id);
    }
};

const whyIcon = new L.Icon({
	iconUrl: "../images/clipMarkerWhy.png",
	//shadowUrl: "../images/marker-shadow.png",
	iconSize: [50, 50],
	iconAnchor: [12, 41],
	popupAnchor: [13, -40]
	//shadowSize: [41, 41]
});

function addMarkerWhy(lat, lng, pop) {
    return L.marker([lat, lng], {
        icon: whyIcon
    }).addTo(map)
        .bindPopup(pop, {
            maxWidth: "auto"
        });
    //.openPopup();
}

window.OLCtoMarkerWhy = function (id, OLC, pop) {
    if (!markerList.hasOwnProperty(id)) {
        var area = OpenLocationCode.decode(OLC);
        markerList[id] = addMarkerWhy(area.latitudeCenter, area.longitudeCenter, pop);
        //console.log("Numero marker sulla mappa: " + Object.getOwnPropertyNames(markerList).length + ", Lista: " + Object.getOwnPropertyNames(markerList));
    } else {
        throw ("Il marker richiesto è già presente sulla mappa, id: " + id);
    }
};


const howIcon = new L.Icon({
	iconUrl: "../images/clipMarkerHow.png",
	//shadowUrl: "../images/marker-shadow.png",
	iconSize: [50, 50],
	iconAnchor: [12, 41],
	popupAnchor: [13, -40]
	//shadowSize: [41, 41]
});

function addMarkerHow(lat, lng, pop) {
    return L.marker([lat, lng], {
        icon: howIcon
    }).addTo(map)
        .bindPopup(pop, {
            maxWidth: "auto"
        });
    //.openPopup();
}

window.OLCtoMarkerHow = function (id, OLC, pop) {
    if (!markerList.hasOwnProperty(id)) {
        var area = OpenLocationCode.decode(OLC);
        markerList[id] = addMarkerHow(area.latitudeCenter, area.longitudeCenter, pop);
        //console.log("Numero marker sulla mappa: " + Object.getOwnPropertyNames(markerList).length + ", Lista: " + Object.getOwnPropertyNames(markerList));
    } else {
        throw ("Il marker richiesto è già presente sulla mappa, id: " + id);
    }
};

const clipIcon = new L.Icon({
    iconUrl: "../images/clipMarkerWhat.png",
    //shadowUrl: "../images/marker-shadow.png",
    iconSize: [50, 50],
    iconAnchor: [12, 41],
    popupAnchor: [13, -40]
    //shadowSize: [41, 41]
});

function addMarkerClip(lat, lng, pop) {
    return L.marker([lat, lng], {
        icon: clipIcon
    }).addTo(map)
        .bindPopup(pop, {
            maxWidth: "auto"
        });
}

window.positionMarkerClip = function (OLC, pop) {
    var area = OpenLocationCode.decode(OLC);
    addMarkerClip(area.latitudeCenter, area.longitudeCenter, pop);
};

const interestPointIcon = new L.Icon({
    iconUrl: "../images/interest.png",
    //shadowUrl: "../images/marker-shadow.png",
    iconSize: [50, 50],
    iconAnchor: [12, 41],
    popupAnchor: [13, -40]
    //shadowSize: [41, 41]
});

function addMarkerInterestPoint(lat, lng, pop) {
    return L.marker([lat, lng], {
        icon: interestPointIcon
    }).addTo(map)
        .bindPopup(pop, {
            maxWidth: "auto"
        });
    //.openPopup();
}

window.positionMarkerInterestPoint = function (latit, longit, pop) {
    addMarkerInterestPoint(latit, longit, pop);
    markerList[OpenLocationCode.encode(latit, longit)] = marker;
};

export function removeMarker(id) {
    if (markerList.hasOwnProperty(id)) {
        map.removeLayer(markerList[id]);
        delete markerList[id];
        //console.log("Numero marker sulla mappa: " + Object.getOwnPropertyNames(markerList).length + ", Lista: " + Object.getOwnPropertyNames(markerList));
    } else {
        //console.warn("No marker with this id " + id);
    }
}

var markerList = {};

Number.prototype.toRadians = function () {
    return this * Math.PI / 180;
};

function coordinatesDistance(latitude1, longitude1, latitude2, longitude2) {
    // R is the radius of the earth in meters
    var R = 6371e3;

    var deltaLatitude = (latitude2 - latitude1).toRadians();
    var deltaLongitude = (longitude2 - longitude1).toRadians();
    latitude1 = latitude1.toRadians(), latitude2 = latitude2.toRadians();

    var a = Math.sin(deltaLatitude / 2) *
        Math.sin(deltaLatitude / 2) +
        Math.cos(latitude1) *
        Math.cos(latitude2) *
        Math.sin(deltaLongitude / 2) *
        Math.sin(deltaLongitude / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function OLCdistance(OLC1, OLC2) {
    var OLC1area = OpenLocationCode.decode(OLC1);
    var OLC2area = OpenLocationCode.decode(OLC2);
    var distance = coordinatesDistance(OLC1area.latitudeCenter, OLC1area.longitudeCenter, OLC2area.latitudeCenter, OLC2area.longitudeCenter);
    //console.log("OLC distance: " + distance);
    return distance;
}

export function getCloserOLC(actualOLC, OLCarray) {
    var closerOLCindex = -1;
    var shortestDistance;
    OLCarray.forEach(function (currentValue, index, arr) {
        var distance = OLCdistance(actualOLC, currentValue);
        if (closerOLCindex === -1 || distance <= shortestDistance) {
            closerOLCindex = index;
            shortestDistance = distance;
        }
    });
    console.log("Index OLC più vicino: ", closerOLCindex, ", Distanza: ", shortestDistance);
    return closerOLCindex;
}

export function getOLCsWithin(actualOLC, OLCarray, maxDistance) {
    OLCarray.forEach(function (currentValue, index, arr) {
        try {
            var distance = OLCdistance(actualOLC, currentValue);
            if (distance >= maxDistance) {
                OLCarray.splice(index, 1);
                console.log("Removed OLC of index: ", index, " because distance: ", distance, " is greater than max distance: ", maxDistance);
            }
        } catch (e) {
            console.log(e);
        }

    });
    return OLCarray;
}

window.isLessThan = function (maxDistance, OLC1, OLC2) {
    try {
        return OLCdistance(OLC1, OLC2) < maxDistance;
    } catch (e) {
        return false;
    }
};

window.route = function (OLC1, OLC2) {
	var ghRouting = new GraphHopper.Routing({
        key: "af1771cd-bbbb-4a0c-86bf-eaee1c5f0249",
        vehicle: "foot",
        elevation: false,
        locale: "it"
    });

    setPositionChangedCallbacked(async function () {
		if (OLCdistance(window.getOLC(), OLC2) < 20 || ((OLCdistance(window.getOLC(), OLC2) > OLCdistance(OLC1, OLC2)))) {
			try {
				routingLayer.clearLayers();
				$("#navigationButton").hide();
				$("#containerPercorso").hide();
				$("#instructions").empty();
			} catch (e) {
				console.log(e);
			}
		}
	});

    ghRouting.addPoint(new GHInput(OpenLocationCode.decode(OLC1).latitudeLo, OpenLocationCode.decode(OLC1).longitudeLo));
    ghRouting.addPoint(new GHInput(OpenLocationCode.decode(OLC2).latitudeLo, OpenLocationCode.decode(OLC2).longitudeLo));

    ghRouting.doRequest()
        .then(function (json) {
            console.log(json);
            var path = json.paths[0];

            routingLayer.addData({
                "type": "Feature",
                "geometry": path.points
            });

            if (path.bbox) {
                var minLon = path.bbox[0];
                var minLat = path.bbox[1];
                var maxLon = path.bbox[2];
                var maxLat = path.bbox[3];
                var tmpB = new L.LatLngBounds(new L.LatLng(minLat, minLon), new L.LatLng(maxLat, maxLon));
                map.fitBounds(tmpB);
            }


            if (path.instructions) {
                $("#navigationButton").show();

                var listUL = $("<ol>");
				$("#instructions").append(listUL);
                for (var idx in path.instructions) {
                    var instr = path.instructions[idx];
                    if (instr.text.indexOf("Continua") !== -1) {
                        $('<li type="square" style="margin-bottom: 1.2em"><img src="../images/continueArrow.png" width="20px" height="20px"> ' + instr.text + '</li><br>').appendTo(listUL);
                    } else if (instr.text.indexOf("destra") !== -1) {
                        $('<li type="square" style="margin-bottom: 1.2em"><img src="../images/nextArrow.png" width="20px" height="20px"> ' + instr.text + '</li><br>').appendTo(listUL);
                    } else if (instr.text.indexOf("sinistra") !== -1) {
                        $('<li type="square" style="margin-bottom: 1.2em"><img src="../images/backArrow.png" width="20px" height="20px"> ' + instr.text + '</li><br>').appendTo(listUL);
                    } else if (instr.text.indexOf("Arrivato") !== -1) {
                        $('<li type="square" style="margin-bottom: 1.2em"><img src="../images/destination-png-8.png" width="20px" height="20px"> ' + instr.text + '</li><br>').appendTo(listUL);
                    } else {
                        $('<li type="square" style="margin-bottom: 1.2em">' + instr.text + '</li><br>').appendTo(listUL);
                    }
                }
            }

        })
        .catch(function (err) {
            var str = "An error occured: " + err.message;
            $("#routing-response").text(str);
        });

    var routingLayer = L.geoJson().addTo(map);
    routingLayer.options = {
        style: {
            color: "#FFC107",
            "weight": 10
        }
    };

    $('.act').click(function () {
        try {
            routingLayer.clearLayers();
            $("#navigationButton").hide();
            $("#containerPercorso").hide();
            $("#instructions").empty();
        } catch (e) {
            console.log(e);
        }
    });

    map.addLayer(routingLayer);

};

window.encode = function (latit, longit) {
    return OpenLocationCode.encode(latit, longit);
};
