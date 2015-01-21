/**
 * Created by prasenjithaty on 1/1/15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
    var placeSchema = new Schema({
        city:  String,
        zip_code: Number,
        country:   String,
        state: String,
        county: String,
        lat_long: String
    });
    placeSchema.index({ city: 1, zip_code: 1, state: 1}, { unique: true });
    mongoose.model('Place', placeSchema);
};
