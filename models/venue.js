/**
 * Created by prasenjithaty on 1/1/15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
    var venueSchema = new Schema({
        name:  String,
        fsqr_id: String,
        contact: { phone: Number, twitter: String },
        location:   { address: String, lat: Number, lng: Number, postalCode: Number, city: String, state: String, cc: String, country: String },
        categories: [{ type: Schema.ObjectId, ref: 'VenueTypes' }],
        verified: Boolean,
        rating: Number
    });
    venueSchema.index({ name: 1, location: 1}, { unique: true });
    mongoose.model('Venue', venueSchema);
};
