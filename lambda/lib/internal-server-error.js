'use strict';

const HttpResponseBuilder = require('./http-response-builder');

module.exports = class InternalServerError extends HttpResponseBuilder {
    constructor(body, headers) {
        super(500, body, headers);
    }

    build(callback) {
        callback(super.generateResponse());
    }
};
