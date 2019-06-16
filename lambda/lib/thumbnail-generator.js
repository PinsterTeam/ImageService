'use strict';

const AWSS3 = require('aws-sdk/clients/s3');
const util = require('util');
const _ = require('lodash');
const BadRequest = require('./bad-request');
const InternalServerError = require('./internal-server-error');
const MovedPermanently = require('./moved-permanently');
const ImageTransformer = require('./image-transformer');

const MAX_AGE = 86400; // 24 hours
const MAX_SIZE = 5000; // 5 thousand pixels (wide or high)
const IMAGE_KEY_PATTERN_REGEX = /(([/a-zA-Z0-9]+)([a-zA-Z0-9]+))_((\d+|auto)x(\d+|auto))/;

module.exports = class ThumbnailGenerator {
    constructor(params = {}) {
        this.bucket = _.isUndefined(params.bucket) ? process.env.BUCKET : params.bucket;
        this.url = _.isUndefined(params.url) ? process.env.URL : params.url;
        this.s3Put = _.isUndefined(params.s3Put) ? async (s3Params) => {
            return new AWSS3().putObject(s3Params).promise();
        } : params.s3Put;
        this.s3Get = _.isUndefined(params.s3Get) ? async (s3Params) => {
            return new AWSS3().getObject(s3Params).promise();
        } : params.s3Get;
        this.imageTransformer = _.isUndefined(params.imageTransformer) ? new ImageTransformer() : params.imageTransformer;
        this.allowedDimensions = _.isUndefined(params.allowedDimensions) ? new Set() : params.allowedDimensions;
    }

    async parseRequestedImage(requestedImageKey) {
        console.log('Parsing request');
        const match = requestedImageKey.match(IMAGE_KEY_PATTERN_REGEX);

        if (match === null) {
            throw new BadRequest(`Key: '${requestedImageKey}' is not a supported image file!`);
        }

        console.debug('Match data: ', match);
        const dimensions = match[4]; //400xauto, for example.
        const width = match[5] === 'auto' ? null : Math.min(parseInt(match[5], 10), MAX_SIZE);
        const height = match[6] === 'auto' ? null : Math.min(parseInt(match[6], 10), MAX_SIZE);
        const originalKey = match[1];
        const newKey = match[0]; //whatever they requested is what we'll make

        let imageData = {
            dimensions: dimensions,
            width: width,
            height: height,
            originalKey: originalKey,
            newKey: newKey
        };

        console.log('Image data', imageData);

        return imageData;
    }

    async upload(parsedParameters) {
        console.log('Uploading image');
        const s3Params = {
            Body: parsedParameters.buffer,
            Bucket: this.bucket,
            ContentType: 'image/jpeg',
            Key: parsedParameters.newKey,
            CacheControl: `max-age=${MAX_AGE}`,
        };
        return this.s3Put(s3Params)
            .then(() => {
                return new MovedPermanently('',
                    {
                        location: `${this.url}/${parsedParameters.newKey}`,
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        Pragma: 'no-cache',
                        Expires: '0'
                    });
            }).catch(err => {
                console.error(util.inspect(err, {depth: 5}));
                throw new InternalServerError(err);
            });
    }

    async download(parsedParameters) {
        console.log('Downloading file');
        const s3Params = {Bucket: this.bucket, Key: parsedParameters.originalKey};
        return this.s3Get(s3Params)
            .then(data => {
                parsedParameters.body = data.Body;
                return parsedParameters;
            }).catch(err => {
                console.error(util.inspect(err, {depth: 5}));
                throw new InternalServerError(err);
            });
    }

    async checkParameters(parsedParameters) {
        console.log('Checking parameters');
        if (this.allowedDimensions.size > 0 && !this.allowedDimensions.has(parsedParameters.dimensions)) {
            throw new BadRequest(`Invalid dimensions specified: ${parsedParameters.dimensions}. ` +
                `Valid dimensions are: ${this.allowedDimensions}`);
        }
        return parsedParameters;
    }

    async generate(event) {
        console.log(util.inspect(event, {depth: 5}));
        return this.parseRequestedImage(event.queryStringParameters.key)
            .then((parsedParameters) => this.checkParameters(parsedParameters))
            .then((parsedParameters) => this.download(parsedParameters))
            .then((parsedParameters) => this.imageTransformer.transformImage(parsedParameters))
            .then((parsedParameters) => this.upload(parsedParameters));
    }
};