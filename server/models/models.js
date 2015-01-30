/**
 * Created by prasenjithaty on 1/1/15.
 */

var models = ['./place', './venue', './venue-types.js'];

exports.initialize = function() {
    var l = models.length;
    for (var i = 0; i < l; i++) {
        require(models[i])();
    }
};
