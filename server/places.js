/**
 * Created by prasenjithaty on 12/28/14.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

var Place = mongoose.model( "Place" );

// middleware specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', new Date().toLocaleString());
    next();
})
// define the home page route
router.param(function(name, fn){
    if (fn instanceof RegExp) {
        return function(req, res, next, val){
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
router.get('/', function(req, res) {
    var responseJson = [];
    Place.find({}, function (err, places) {
        places.forEach(function(place){
            responseJson.push(place);
        })
        console.log("place: " + JSON.stringify(responseJson, null, 4));
        res.send(JSON.stringify(responseJson, null, 4));
    });
});

router.param('code', /^\d+$/);
router.get('/zip/:code', function(req, res) {
    var zip = req.params.code[0];
    Place.findOne({ 'zip_code': zip.trim() }, function (err, place) {
        console.log("place: " + place);
        res.send(place);
    });
});

router.param('state', /^[a-zA-Z0-9-]+/);
router.param('state_code', /^[A-Z]{2}/);
router.get('/scrape/:state_code/:state', function (req, res) {
    var state = req.params.state;
    var state_code = req.params.state_code;
    url = 'http://www.geonames.org/postal-codes/US/' + state_code + '/' + state +'.html';
    var jsonData = [];

    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('table.restable tr').first().remove();
            $('table.restable tr').each(function (index) {
                var tds = $(this).find('td');

                if (index % 2 != 1) {
                    var json = {city: "", zip_code: "", country: "", admin1: "", admin2: "", lat_long: ""};
                    json.city = $(tds[1]).text().trim();
                    json.zip_code = $(tds[2]).text().trim();
                    json.country = $(tds[3]).text().trim();
                    json.admin1 = $(tds[4]).text().trim();
                    json.admin2 = $(tds[5]).text().trim();
                }
                if (index % 2 == 1) {
                    jsonData[jsonData.length - 1].lat_long = $(tds[1]).text().trim();
                }
                if (json != null && json.city != '') {
                    jsonData.push(json);
                }
            });
        }

        fs.writeFile('output.json', JSON.stringify(jsonData, null, 4), function (err) {
            console.log('File successfully written! - Check your project directory for the output.json file');
        });

        jsonData.forEach(function (elem) {
            var place = new Place({city: elem.city, zip_code: elem.zip_code, country: elem.admin1, county: elem.admin2, lat_long: elem.lat_long});
            place.save(function (err) {
                if (err)
                    console.log('Error occurred while saving document', err);
            })
        })
        res.send('Check your console!')
    })
});

router.get('*', function(req, res, next) {
    var err = new Error();
    err.status = 404;
    next(err);
});

// handling 404 errors
router.use(function(err, req, res, next) {
    if(err.status !== 404) {
        return next();
    }

    res.send(err.message || 'Route not available. The expected route is 2 letter state code followed by slash and state name. E.g. /NY/new-york/');
});

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}
//zeroPad(5, 2); // "05"
//zeroPad(5, 4); // "0005"
//zeroPad(5, 6); // "000005"

module.exports = router;