var express = require('express');
//var fs = require('fs');
//var request = require('request');
//var cheerio = require('cheerio');
//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/places');
//var router = express.Router();
var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/places');
var cors = require("cors");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log('database connected.')
});

require('./models/models').initialize();
var scrape_places = require('./places');
var scrape_venues = require('./points-of-interest');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/places', scrape_places);
app.use('/venues', scrape_venues);

//app.use(cors());

//var db = mongoose.connection;
//db.on('error', console.error.bind(console, 'connection error:'));
//db.once('open', function (callback) {
//    console.log('database connected.')
//});
//
//var Schema = mongoose.Schema;
//
//var venueSchema = new Schema({
//    city:  String,
//    zip_code: Number,
//    country:   String,
//    state: String,
//    county: String,
//    lat_long: String
//});
//venueSchema.index({ city: 1, zip_code: 1, state: 1}, { unique: true });
//var Place = mongoose.model('Place', venueSchema);
//
//app.param(function(name, fn){
//    if (fn instanceof RegExp) {
//        return function(req, res, next, val){
//            var captures;
//            if (captures = fn.exec(String(val))) {
//                req.params[name] = captures;
//                next();
//            } else {
//                next('route');
//            }
//        }
//    }
//});
//app.param('state', /^[a-zA-Z0-9-]+/);
//app.param('state_code', /^[A-Z]{2}/);
//app.get('/scrape/:state_code/:state', function (req, res) {
//    var state = req.params.state;
//    var state_code = req.params.state_code;
//    url = 'http://www.geonames.org/postal-codes/US/' + state_code + '/' + state +'.html';
//    var jsonData = [];
//
//    request(url, function (error, response, html) {
//        if (!error) {
//            var $ = cheerio.load(html);
//            $('table.restable tr').first().remove();
//            $('table.restable tr').each(function (index) {
//                var tds = $(this).find('td');
//
//                if (index % 2 != 1) {
//                    var json = {city: "", zip_code: "", country: "", admin1: "", admin2: "", lat_long: ""};
//                    json.city = $(tds[1]).text().trim();
//                    json.zip_code = $(tds[2]).text().trim();
//                    json.country = $(tds[3]).text().trim();
//                    json.admin1 = $(tds[4]).text().trim();
//                    json.admin2 = $(tds[5]).text().trim();
//                }
//                if (index % 2 == 1) {
//                    jsonData[jsonData.length - 1].lat_long = $(tds[1]).text().trim();
//                }
//                if (json != null && json.city != '') {
//                    jsonData.push(json);
//                }
//            });
//        }
//
//        fs.writeFile('output.json', JSON.stringify(jsonData, null, 4), function (err) {
//            console.log('File successfully written! - Check your project directory for the output.json file');
//        });
//
//        jsonData.forEach(function (elem) {
//            var place = new Place({city: elem.city, zip_code: elem.zip_code, country: elem.admin1, county: elem.admin2, lat_long: elem.lat_long});
//                place.save(function (err) {
//                    if (err)
//                        console.log('Error occurred while saving document', err);
//                })
//        })
//        res.send('Check your console!')
//    })
//});
//
//app.get('*', function(req, res, next) {
//    var err = new Error();
//    err.status = 404;
//    next(err);
//});
//
//// handling 404 errors
//app.use(function(err, req, res, next) {
//    if(err.status !== 404) {
//        return next();
//    }
//
//    res.send(err.message || 'Route not available. The expected route is 2 letter state code followed by slash and state name. E.g. /NY/new-york/');
//});

//app.listen('8081')
//console.log('Magic happens on port 8081');
exports = module.exports = app;