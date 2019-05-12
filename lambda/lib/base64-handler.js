'use strict';

const BadRequest = require('./bad-request');
const Base64RegexMismatch = require('./base64-regex-mismatch');

module.exports = class Base64Handler {
    constructor(image, callback) {
        let base64Regex = /data:([^/]+)\/([^;]+);base64,(.+)/;
        if (base64Regex.test(image)) {
            let matches = base64Regex.exec(image);
            this.mimeType = {
                type: matches[1],
                subtype: matches[2]
            };
            this.base64Image = matches[3];
            this.buffer = Buffer.from(this.base64Image, 'base64');
            return callback(undefined, this);
        }
        callback(new BadRequest(new Base64RegexMismatch('Your image did not match the base64 regex')));
    }
};
