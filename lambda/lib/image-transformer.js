'use strict';
const Assets = require('../assets');
const Sharp = require('sharp');
const _ = require('lodash');
const InternalServerError = require('./internal-server-error');

const WATERMARK_RATIO = 0.18;

module.exports = class ImageTransformer {
    async transformImage(parsedParameters) {
        let body = parsedParameters.body;
        let width = parsedParameters.width;
        let height = parsedParameters.height;
        let format = _.isUndefined(parsedParameters.format) ? 'jpeg' : parsedParameters.format;

        if (body === null || width === null || height === null || format === null) {
            throw new InternalServerError('One of the required image transform parameters was null!');
        }

        const watermark = await this.buildWatermark(width, height);
        if (watermark) {
            return this.withWatermark(body, width, height, format, watermark)
                .then(data => {
                    parsedParameters.buffer = data;
                    return parsedParameters;
                }).catch(err => {
                    console.error('Error transforming image', err);
                    throw new InternalServerError(err);
                });
        }
        return this.withoutWatermark(body, width, height, format)
            .then(data => {
                parsedParameters.buffer = data;
                return parsedParameters;
            }).catch(err => {
                console.error('Error transforming image', err);
                throw new InternalServerError(err);
            });
    }

    async buildWatermark(width, height) {
        if (width <= 100 || height <= 100) {
            return false;
        }

        const watermarkWidth = width * WATERMARK_RATIO;
        const watermarkHeight = height * WATERMARK_RATIO;


        return Sharp(Assets.watermarkSvg)
            .resize(watermarkWidth, watermarkHeight, {fit: 'inside'})
            .toBuffer();
    }

    async withWatermark(body, width, height, format, watermark) {
        return Sharp(body)
            .rotate()
            .resize(width, height, {fit: 'inside'})
            .composite([{input: watermark, gravity: 'southeast'}])
            .toFormat(format)
            .toBuffer();
    }

    async withoutWatermark(body, width, height, format) {
        return Sharp(body)
            .rotate()
            .resize(width, height, {fit: 'inside'})
            .toFormat(format)
            .toBuffer();
    }
};
