'use strict';

const Sharp = require('sharp');
const _ = require('lodash');
const InternalServerError = require('./internal-server-error');

// Make this not static, should be like a no args constructor or something.
module.exports = class ImageTransformer {
    async transformImage(parsedParameters) {
        let body = parsedParameters.body;
        let width = parsedParameters.width;
        let height = parsedParameters.height;
        let format = _.isUndefined(parsedParameters.format) ? 'jpeg' : parsedParameters.format;

        if (body === null || width === null || height === null || format === null) {
            throw new InternalServerError('One of the required image transform parameters was null!');
        }
        return Sharp(body)
            .rotate()
            .resize(width, height, {fit: 'inside'})
            .composite([{input: '../assets/pinster_watermark.png', gravity: 'southeast'}])
            .toFormat(format)
            .toBuffer()
            .then(data => {
                parsedParameters.buffer = data;
                return parsedParameters;
            })
            .catch(err => {
                console.error('Error transforming image', err);
                throw new InternalServerError(err);
            });
    }
};
