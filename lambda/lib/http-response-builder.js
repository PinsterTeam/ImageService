'use strict';

module.exports = class HttpResponseBuilder {
    constructor(statusCode, body, headers = {}) {
        this.statusCode = statusCode;
        this.body = body;
        this.headers = Object.assign({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        }, headers);
    }


    generateResponse() {
        return {
            statusCode: this.statusCode,
            headers: this.headers,
            body: JSON.stringify(this.body)
        };
    }
};
