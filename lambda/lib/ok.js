const HttpResponseBuilder = require('./http-response-builder');

module.exports = class Ok extends HttpResponseBuilder {
    constructor(body, headers) {
        super(200, body, headers);
    }

    build(callback) {
        callback(undefined, super.generateResponse());
    }
};
