var Wreck = require('wreck');
var Hoek = require('hoek');
var Joi = require('joi');


var internals = {};


exports = module.exports = internals.Alert = function (app, name, options) {

    options.name = name;

    var schema = {
        name: Joi.string().required(),
        index: Joi.string().required(),
        condition: Joi.string().required(),
        from: Joi.string().required(),
        to: Joi.string().required(),
        users: Joi.array().required()
    };

    var defaults = {
        from: '-1hour',
        to: 'now'
    };

    options = Hoek.applyToDefaults(defaults, options);
    Joi.assert(options, schema);

    this.options = options;
    this.app = app;
};

internals.Alert.prototype.getUrl = function (baseUrl) {

    return this.app.options.settings.graphiteBaseUrl 
        + '/render?format=json&from=' 
        + this.options.from + '&to=' 
        + this.options.to + '&target=' 
        + this.options.index;
};


internals.Alert.prototype.evaluateCondition = function (condition, value) {

    return eval(value + condition);
};


internals.Alert.prototype.shouldRaise = function (callback) {

    var self = this;
    var url = this.getUrl();

    Wreck.get(url, {json: true}, function (err, response, payload) {

        if (err) {
            callback(err, false);
        }

        var datapoints = payload[0].datapoints;
        var mostRecentValue = datapoints[datapoints.length - 1][0];

        if (self.evaluateCondition(self.options.condition, mostRecentValue)) {
            return callback(null, true, mostRecentValue);
        }

        return callback(null, false, mostRecentValue);
    });
};
