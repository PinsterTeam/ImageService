const Sharp = require('sharp');
const _ = require('lodash');
const InternalServerError = require('./internal-server-error');

// Make this not static, should be like a no args constructor or something.
module.exports = class ImageTransformer {
    static transformImage(parsedParameters, callback) {
        let body = parsedParameters.body;
        let width = parsedParameters.width;
        let height = parsedParameters.height;
        let format = _.isUndefined(parsedParameters.format) ? 'jpeg' : parsedParameters.format;

        if (body === null || width === null || height === null || format === null) {
            callback(new InternalServerError('One of the required image transform parameters was null!'));
        }
        else {
            parsedParameters.buffer = Sharp(body)
                .resize(width, height)
                .max()
                .toFormat(format)
                .toBuffer();

            callback(undefined, parsedParameters);
        }
    }
};
