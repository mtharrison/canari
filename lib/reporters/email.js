var Nodemailer = require('nodemailer');
var Joi = require('joi');


var internals = {};


exports = module.exports = internals.Email = function (options) {

    this.name = 'email';

    var schema = {
        from: Joi.string().email().required(),
        user: Joi.string().required(),
        password: Joi.string().required(),
        host: Joi.string().required(),
        port: Joi.number().required(),
        ssl: Joi.boolean().default(false)
    };

    Joi.assert(options, schema);

    this.options = options;

    this.client = Nodemailer.createTransport({
        host: this.options.host,
        port: this.options.port,
        secure: this.options.ssl,
        auth: {
            user: this.options.user,
            pass: this.options.password
        }
    });
};


internals.Email.prototype.send = function (alert, options, callback) {

    var message = {
        text: alert.options.name + " has been triggered. Target was " + options.target + ". Condition is " + alert.options.condition + ". Actual value is " + options.actualValue + '. Chart: ' + alert.getGraphUrl(),
        to: options.recipient,
        from: this.options.from,
        subject: 'Alert raised: ' + alert.options.name
    };

    this.client.sendMail(message, function (err) {

        callback(err ? err : null);
    });
};
