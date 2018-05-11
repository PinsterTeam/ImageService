'use strict';

const Base64Handler = require('./base64-handler');
const _ = require('lodash');
const md5 = require('md5');

module.exports = class FileBuilder {
    constructor(base64Handler) {
        this.base64Handler = _.isUndefined(base64Handler) ? Base64Handler : base64Handler;
    }

    getFile(image) {
        let base64Handler = new this.base64Handler(image);
        let buffer = base64Handler.buffer;
        let fileName = 'raw/' + md5(buffer);
        return {
            Key: fileName,
            Body: buffer
        };
    }
};
