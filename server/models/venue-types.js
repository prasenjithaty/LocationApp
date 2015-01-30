/**
 * Created by prasenjithaty on 1/4/15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
    var venueTypesSchema = new Schema({
        name:  { type: String, unique: true, required: true },
        fsqr_id: String,
        pluralName: String,
        shortName: String
    });
    venueTypesSchema.index({ name: 1, fsqr_id: 1}, { unique: true });
    mongoose.model('VenueTypes', venueTypesSchema);
};
