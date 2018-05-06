const Sharp = require('sharp');

// Make this not static, should be like a no args constructor or something.
module.exports = class ImageTransformer {
    static transformImage(body, width, height, format = 'jpeg') {
        return Sharp(body)
            .resize(width, height)
            .max()
            .toFormat(format)
            .toBuffer();
    }
};
