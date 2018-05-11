'use strict';

const HttpResponseBuilder = require('./http-response-builder');

module.exports = class BadRequest extends HttpResponseBuilder {
    constructor(body, headers) {
        super(400, body, headers);
    }

    build(callback) {
        callback(undefined, super.generateResponse());
    }
};
