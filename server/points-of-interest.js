/**
 * Created by prasenjithaty on 12/31/14.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var mongoose = require('mongoose');
var util = require('util');
var Q = require("q");

var config = {
    'secrets': {
        'clientId': 'ACOPE45H5141FNR4NPGWAD1DPXAM11KAM1RBW1N3NLNFCEJZ',
        'clientSecret': '1A4KJFZSK3UHMPFAAITIHQIXQVTTY15PCTZZ45HA4HH51ZY0',
        'redirectUrl': 'REDIRECT_URL'
    }
};

var Place = mongoose.model("Place");
var Venue = mongoose.model("Venue");
var VenueType = mongoose.model("VenueTypes");

var foursquare = require('node-foursquare')(config);

// middleware specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', new Date().toLocaleString());
    next();
});

// define the home page route
router.param(function (name, fn) {
    if (fn instanceof RegExp) {
        return function (req, res, next, val) {
            var captures;
            if (captures = fn.exec(String(val))) {
                req.params[name] = captures;
                next();
            } else {
                next('route');
            }
        }
    }
});
router.get('/', function (req, res) {
    var responseJson = [];
    Venue.find({}, function (err, venues) {
        if (venues.length > 0) {
            venues.forEach(function (venue) {
                responseJson.push(venue);
            });
            console.log("venue: " + JSON.stringify(responseJson, null, 4));
            res.send(JSON.stringify(responseJson, null, 4));
        } else {
            console.log("No venues found");
            res.send("No venues found. Please add a few!");
        }
    });
});

router.get('/poi/:zip_code', function (req, res) {
    var zip_code = req.params.zip_code;
    Place.findOne({'zip_code': zip_code}, function (err, place) {
        if (err)
            console.log(err);
        var latlong = place.lat_long.split('/');
        console.log('city: %s', place.city);
        console.log('lat: %s', latlong[0]);
        console.log('long: %s', latlong[1]);
        var respObj = [];
        //scrapeVenues(latlong[0], latlong[1], 0, respObj).then(function (resp) {
        //    insertVenues(resp, zip_code).then(function (json) {
        //        //console.log("json: " + json);
        //        res.send(json);
        //    });
        //})
        scrapeVenues(latlong[0], latlong[1], 0, respObj).then(insertVenues).then(function () {
            res.send("All venues for zip code [" + zip_code + "] saved successfully.");
        })
    })

});

function scrapeVenues(lat, long, offset, respObj) {
    var deferred = Q.defer();
    foursquare.Venues.explore(lat, long, null, {offset: offset, section: 'food'}, null, function (error, data) {
        if (error) {
            console.log(error.message);
        }
        else {
            try {
                var total_results = data.totalResults;
                data.groups[0].items.forEach(function (item) {
                    respObj.push(item);
                });
                offset = offset + 30;
                if (offset < total_results) {
                    scrapeVenues(lat, long, offset, respObj).then(function (respObj) {
                        deferred.resolve(respObj);
                    });
                } else {
                    deferred.resolve(respObj);
                }
            } catch (error) {
                console.log(error);
            }
        }
    });
    return deferred.promise;
}

function insertVenues(respObj) {
    var deferred = Q.defer();
    var venueTypeId;
    //var zipCode;
    console.log("respObj.length: " + respObj.length);
    async.eachSeries(respObj, function (fsqr_venue, callback) {
        VenueType.find({'fsqr_id': fsqr_venue.venue.categories[0].id}, '_id', function (err, venue_type) {
            if (err) {
                console.log(err);
            }
            if (!venue_type.length) {
                var category = new VenueType({
                    name: fsqr_venue.venue.categories[0].name,
                    fsqr_id: fsqr_venue.venue.categories[0].id,
                    pluralName: fsqr_venue.venue.categories[0].pluralName,
                    shortName: fsqr_venue.venue.categories[0].shortName
                });
                category.save();
                venueTypeId = category._id;
                console.log('category: ' + category.name + ' saved with id:: ' + venueTypeId);
                callback();
            } else {
                venueTypeId = venue_type;
                console.log("VenueType " + venue_type + " already exists.");
                callback();
            }
        }).limit(1);
        Venue.find({'fsqr_id': fsqr_venue.venue.id}, '_id', function (err, venue) {
            if (err) {
                console.log(err);
            }
            var zipCode = fsqr_venue.venue.location.postalCode;
            if (!venue.length) {
                var newVenue = new Venue({
                    name: fsqr_venue.venue.name,
                    fsqr_id: fsqr_venue.venue.id,
                    contact: {phone: fsqr_venue.venue.contact.phone, twitter: fsqr_venue.venue.contact.twitter},
                    location: {
                        address: fsqr_venue.venue.location.address,
                        lat: fsqr_venue.venue.location.lat,
                        lng: fsqr_venue.venue.location.lng,
                        postalCode: (zipCode != undefined && zipCode.toString().indexOf('-') === -1 ? zipCode : deHyphenate(zipCode)),
                        city: fsqr_venue.venue.location.city,
                        state: fsqr_venue.venue.location.state,
                        cc: fsqr_venue.venue.location.cc,
                        country: fsqr_venue.venue.location.country
                    },
                    categories: venueTypeId
                });
                newVenue.save(function (err) {
                    if (err)
                        console.log('Error occurred while saving Venue', err);
                });
                //callback();
            } else {
                console.log("Venue " + venue + " already exists.");
                //callback();
            }
        }).limit(1);
    }, function (err) {
        // if any of the venue type processing produced an error, err would equal that error
        if (err) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log(err);
        } else {
            console.log('All venues have been processed successfully');
        }
    });
    //Venue.find({'location.postalCode': zip_code}, function (err, venues) {
    //}).populate('categories', 'name pluralName').exec();
    deferred.resolve();
    return deferred.promise;
}

router.get('/zip/:zip_code', function (req, res) {
    var zip_code = req.params.zip_code;
    getVenues(zip_code).then(function (venues) {
        //console.log(venues);
        res.send(venues);
    })
});

function getVenues(zip_code) {
    var lat, lon;
    var jsonData = {};
    var deferred = Q.defer();
    var venues = Venue.find({'location.postalCode': zip_code}, function (err, venues) {
    }).populate('categories', 'name pluralName').exec();
    venues.then(function (venues) {
        var query = Place.where({zip_code: zip_code});
        query.select('lat_long -_id');
        query.findOne(function (err, lat_long) {
            if (err)
                console.log("Place not found");
            if (lat_long) {
                lat = lat_long.lat_long.split('/')[0];
                lon = lat_long.lat_long.split('/')[1];
            }
            jsonData.lat = lat;
            jsonData.lon = lon;
            jsonData.venues = venues;
            deferred.resolve(jsonData);
        });
    });
    return deferred.promise;
}

function deHyphenate(postalCode) {
    return (postalCode != undefined && postalCode.indexOf('-') === 1 ? postalCode.toString().split('-')[0] : null);
}

router.get('*', function (req, res, next) {
    var err = new Error();
    err.status = 404;
    next(err);
});

// handling 404 errors
router.use(function (err, req, res, next) {
    if (err.status !== 404) {
        return next();
    }

    res.send(err.message || 'Route not available. The expected route is 2 letter state code followed by slash and state name. E.g. /NY/new-york/');
});

module.exports = router;