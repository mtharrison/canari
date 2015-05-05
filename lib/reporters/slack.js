var Slack = require('slack-notify');
var Joi = require('joi');


var internals = {};


exports = module.exports = internals.Slack = function (options) {

    this.name = 'slack';

    var schema = {
        webhookUrl: Joi.string().required()
    };

    Joi.assert(options, schema);

    this.options = options;

    this.client = Slack(this.options.webhookUrl);
};


internals.Slack.prototype.send = function (alert, options, callback) {

    var logger = this.client.extend({
        channel: options.recipient,
        icon_emoji: ':computer:',
        username: 'CanariBot'
    });

    logger({
        text: alert.options.name + " has been triggered. Condition is " + alert.options.condition + ". Actual value is " + options.actualValue
    });

    return callback(null);
};
