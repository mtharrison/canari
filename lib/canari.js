var Alert = require('./alert');
var Hoek = require('hoek');
var Joi = require('joi');


var internals = {};


exports = module.exports = internals.Canari = function (options) {

    var schema = {
        users: Joi.object().required(),
        alerts: Joi.object().required(),
        reporters: Joi.object().required(),
        settings: {
            interval: Joi.number().min(100),
            graphiteBaseUrl: Joi.string().required()
        }
    };

    var defaults = {
        settings: {
            interval: 10 * 1000 // every 10 secs
        }
    };

    options = Hoek.applyToDefaults(defaults, options);
    Joi.assert(options, schema);

    this.options = options;
    this.alerts = [];
    this.reporters = [];

    this.setupAlerts();
    this.setupReporters();
};


internals.Canari.prototype.setupAlerts = function () {

    for (var i in this.options.alerts) {
        this.alerts.push(new Alert(this, i, this.options.alerts[i]));
    }
};


internals.Canari.prototype.setupReporters = function () {

    for (var i in this.options.reporters) {
        var Module = require('./reporters/' + i);
        this.reporters.push(new Module(this.options.reporters[i]));
    }
};


internals.Canari.prototype.checkAlerts = function () {

    var self = this;

    for (var i = 0; i < this.alerts.length; ++i) {
        var alert = this.alerts[i];

        (function (alert) {

            alert.shouldRaise(function (err, raise, actualValue) {

                if (err) {
                    throw err;
                }

                if (raise) {
                    self.makeAlert(alert, actualValue);   
                }
            });

        })(alert);
    }
};


internals.Canari.prototype.makeAlert = function (alert, actualValue) {

    var users = alert.options.users;

    for (var i = 0; i < this.reporters.length; ++i) {
        for (var j = 0; j < users.length; ++j) {
            var recipient = this.options.users[users[j]][this.reporters[i].name];
            this.reporters[i].send(alert, { 
                recipient: recipient,
                actualValue: actualValue
            }, function (err) {

                if (err) {
                    throw err;
                }
            });
        }
    }
};


internals.Canari.prototype.start = function () {

    this.checkAlerts();
    this.loop = setInterval(this.checkAlerts.bind(this), this.options.settings.interval);
};
