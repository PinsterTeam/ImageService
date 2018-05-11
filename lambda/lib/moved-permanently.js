const HttpResponseBuilder = require('./http-response-builder');

module.exports = class MovedPermanently extends HttpResponseBuilder {
    constructor(body, headers) {
        super(301, body, headers);
    }

    build(callback) {
        callback(undefined, super.generateResponse());
    }
};
