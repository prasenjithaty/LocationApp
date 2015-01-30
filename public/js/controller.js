/**
 * Created by prasenjithaty on 1/26/15.
 */
var places = angular.module("venues", ["leaflet-directive"]);
//places.controller("AppCtrl", function ($http){
//    var app = this;
//    $http.get("http://localhost:8081/venues/zip/07002").success(function (venues) {
//        console.log(venues.venues);
//        app.venues = venues.venues;
//    })
//});

places.controller("AppCtrl", ["$scope", "$http", function ($scope, $http) {
    var app = this;
    var lat, lon;
    $http.get("http://localhost:8081/venues/zip/07002").success(function (venues) {
        //console.log(venues.venues);
        app.venues = venues.venues;
        lat = venues.lat;
        lon = venues.lon;
        console.log("lat: " + lat);
        console.log("lon: " + lon);
    }).then(function (venues) {
        $scope.center = {
            lat: lat,
            lng: lon,
            zoom: 10
        };
        $scope.markers = [];
        $scope.layers = {
            baselayers: {
                mapbox_terrain: {
                    name: 'Mapbox Terrain',
                    url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    type: 'xyz',
                    layerOptions: {
                        apikey: 'pk.eyJ1IjoicHJhc2Vuaml0IiwiYSI6ImVYbFFGTWMifQ.DkjKMswD1Exji-DmaeH0_A',
                        mapid: 'examples.map-i86nkdio'
                    }
                }
            },
            overlays: {
                northTaiwan: {
                    name: "North cities",
                    type: "markercluster",
                    visible: true
                },
                southTaiwan: {
                    name: "South cities",
                    type: "markercluster",
                    visible: true
                }
            }
        };
        //angular.extend($scope, {
        //    center: {
        //        lat: lat,
        //        lng: lon,
        //        zoom: 6
        //    },
        //    markers: [],
        //    layers: {
        //        baselayers: {
        //            mapbox_terrain: {
        //                name: 'Mapbox Terrain',
        //                url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
        //                type: 'xyz',
        //                layerOptions: {
        //                    apikey: 'pk.eyJ1IjoicHJhc2Vuaml0IiwiYSI6ImVYbFFGTWMifQ.DkjKMswD1Exji-DmaeH0_A',
        //                    mapid: 'examples.map-i86nkdio'
        //                }
        //            }
        //        },
        //        overlays: {
        //            northTaiwan: {
        //                name: "North cities",
        //                type: "markercluster",
        //                visible: true
        //            },
        //            southTaiwan: {
        //                name: "South cities",
        //                type: "markercluster",
        //                visible: true
        //            }
        //        }
        //    }
        //});
        var setMapMarkers = function () {
            var markers = {};
            angular.forEach(app.venues, function (venue) {
                var placeName = venue.name.replace(/[&\/\\#,+()$~%.'":*?<>{}\- ]/g, '_');
                markers[placeName] = {
                    lat: venue.location.lat,
                    lng: venue.location.lng
                    //message: '(' + index + ') ' + dest.Name
                    //focus: true,
                    //draggable: false
                };
            });
            $scope.markers = markers;
        };

        setMapMarkers();
        //console.log($scope.markers);
        //$scope = $scope;
        console.log($scope.layers);
    });

}]);

//places.controller('AppCtrl', ['$scope', '$http', function ($scope, $http) {
//    //var allDestInItinerary = [];
//    var app = this;
//    var lat, lon;
//    $http.get("http://localhost:8081/venues/zip/07002").success(function (venues) {
//        //console.log(venues.venues);
//        app.venues = venues.venues;
//        lat = venues.lat;
//        lon = venues.lon;
//        console.log("lat: " + lat);
//        console.log("lon: " + lon);
//    });
//    angular.extend($scope, {
//        defaults: {
//            minZoom: 2,
//            maxZoom: 10,
//            scrollWheelZoom: false
//        },
//        center: {
//            lat: lat,
//            lng: lon,
//            zoom: 6
//        },
//        markers: [],
//        layers: {
//            baselayers: {
//                googleRoadmap: {
//                    name: 'Google Streets',
//                    layerType: 'ROADMAP',
//                    type: 'google'
//                }
//            }
//        }
//    });
//
//    var setMapMarkers = function () {
//
//        //var index = 1;
//        var markers = {};
//        angular.forEach(app.venues, function (venue) {
//            //var dest = venue.Destination;
//            //allDestInItinerary.push(dest);
//            var placeName = venue.name;
//            console.log(venue);
//            markers[placeName] = {
//                lat: venue.location.lat,
//                lng: venue.location.lng
//                //message: '(' + index + ') ' + dest.Name
//                //focus: true,
//                //draggable: false
//            };
//            index++;
//        });
//        $scope.markers = markers;
//    };
//
//    setMapMarkers();
//}]);

places.filter("pad", function () {
    return function (number, padding) {
        padding = (padding || 0);
        if (number !== null && number !== undefined) {
            var str = "" + number;
            while (str.length < padding) str = "0" + str;
            return str;
        }
    };
});