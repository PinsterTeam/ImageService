'use strict';

const Base64Handler = require('./base64-handler');
const _ = require('lodash');
const md5 = require('md5');
const BadRequest = require('./bad-request');

module.exports = class FileBuilder {
    constructor(base64Handler) {
        this.base64Handler = _.isUndefined(base64Handler) ? Base64Handler : base64Handler;
    }

    getFile(parsedRequest, callback) {
        let base64Handler = new this.base64Handler(parsedRequest.image);
        let buffer = base64Handler.buffer;
        let mimeType = base64Handler.mimeType;
        let fileName = 'raw/' + md5(buffer);
        let contentType = `${mimeType.type}/${mimeType.subtype}`;

        if (mimeType.type === 'image') {
            callback(undefined, {
                Key: fileName,
                Body: buffer,
                ContentType: contentType,
                Metadata: parsedRequest.metadata,
                Bucket: parsedRequest.bucket
            });
        }
        else {
            callback(new BadRequest(`Files of type: ${contentType} are not supported.`));
        }
    }
};
