var Wreck = require('wreck');
var Hoek = require('hoek');
var Joi = require('joi');


var internals = {};


exports = module.exports = internals.Alert = function (app, options) {

    var schema = {
        name: Joi.string().required(),
        query: Joi.string().required(),
        condition: Joi.string().required(),
        from: Joi.string().required(),
        to: Joi.string().required(),
        users: Joi.array().required()
    };

    if (options.users === '*') {
        options.users = Object.keys(app.options.users);
    }

    // `from` defaults to the app global interval setting

    var defaults = {
        to: 'now'
    };

    options = Hoek.applyToDefaults(defaults, options);
    Joi.assert(options, schema);

    this.options = options;
    this.app = app;
};

internals.Alert.prototype.getUrl = function () {

    return this.app.options.settings.graphiteBaseUrl 
        + '/render?format=json&from=' 
        + this.options.from + '&to=' 
        + this.options.to + '&target=' 
        + this.options.query;
};


internals.Alert.prototype.getGraphUrl = function (baseUrl) {

    return this.app.options.settings.graphiteBaseUrl 
        + '/render?from=-1h' 
        + '&to=' + this.options.to
        + '&target=' + this.options.query;
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

        for (var i = 0; i < payload.length; i++) {

            var target = payload[i].target;
            var datapoints = payload[i].datapoints;

            if (datapoints.length < 1) {
                continue;
            }

            var mostRecentValue = datapoints[datapoints.length - 1][0];

            if (self.evaluateCondition(self.options.condition, mostRecentValue)) {
                return callback(null, true, target, mostRecentValue);
            }

            return callback(null, false, target, mostRecentValue);
        }

        callback(null, false, null, null);

    });
};
