'use strict';

const AWSS3 = require('aws-sdk/clients/s3');
const util = require('util');
const _ = require('lodash');
const async = require('async');
const BadRequest = require('./bad-request');
const InternalServerError = require('./internal-server-error');
const MovedPermanently = require('./moved-permanently');
const ImageTransformer = require('./image-transformer');

const MAX_AGE = 86400; // 24 hours
const MAX_SIZE = 5000; // 5 thousand pixels (wide or high)
const IMAGE_KEY_PATTERN_REGEX = /(([/a-zA-Z0-9]+)\/([a-zA-Z0-9]+))_((\d+|auto)x(\d+|auto))(\.jpeg|\.jpg|\.png)?/;

module.exports = class ThumbnailGenerator {
    constructor(bucket, url, s3, imageTransformer, allowedDimensions) {
        this.bucket = _.isUndefined(bucket) ? process.env.BUCKET : bucket;
        this.url = _.isUndefined(url) ? process.env.URL : url;
        this.s3 = _.isUndefined(s3) ? new AWSS3() : s3;
        this.imageTransformer = _.isUndefined(imageTransformer) ? ImageTransformer : imageTransformer;
        this.allowedDimensions = _.isUndefined(allowedDimensions) ? new Set() : allowedDimensions;
    }

    static parseRequestedImage(requestedImageKey, callback) {
        const match = requestedImageKey.match(IMAGE_KEY_PATTERN_REGEX);

        if (match === null) {
            callback(new BadRequest(`Key: '${requestedImageKey}' is not a supported image file!`));
        }
        else {
            const dimensions = match[4]; //400xauto, for example.
            const width = match[5] === 'auto' ? null : Math.min(parseInt(match[5], 10), MAX_SIZE);
            const height = match[6] === 'auto' ? null : Math.min(parseInt(match[6], 10), MAX_SIZE);
            const dotExtension = match[7];
            const originalKey = match[1];
            const newKey = match[0]; //whatever they requested is what we'll make

            console.log('Dimensions ' + dimensions);
            console.log('Width ' + width);
            console.log('Height ' + height);
            console.log('DotExtension ' + dotExtension);
            console.log('OriginalKey ' + originalKey);
            console.log('NewKey ' + newKey);

            callback(undefined, {
                dimensions: dimensions,
                width: width,
                height: height,
                originalKey: originalKey,
                newKey: newKey
            });
        }
    }

    upload(parsedParameters, callback) {
        this.s3.putObject(
            {
                Body: parsedParameters.buffer,
                Bucket: this.bucket,
                ContentType: 'image/jpeg',
                Key: parsedParameters.newKey,
                CacheControl: `max-age=${MAX_AGE}`,
            }, (err) => {
                if (err) {
                    console.log(util.inspect(err, {depth: 5}));
                    callback(new InternalServerError(err));
                }
                else {
                    callback(undefined, new MovedPermanently('',
                        {
                            location: `${this.url}/${parsedParameters.newKey}`,
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            Pragma: 'no-cache',
                            Expires: '0'
                        }));
                }
            });
    }

    download(parsedParameters, callback) {
        this.s3.getObject({Bucket: this.bucket, Key: parsedParameters.originalKey}, (err, data) => {
            if (err) {
                console.log(util.inspect(err, {depth: 5}));
                callback(new InternalServerError(err));
            }
            else {
                parsedParameters.body = data.Body;
                callback(undefined, parsedParameters);
            }
        });
    }


    generate(event, callback) {
        console.log(util.inspect(event, {depth: 5}));

        let self = this;
        let tasks = [];

        tasks.push((callback) => {
            console.log('Parsing request');
            ThumbnailGenerator.parseRequestedImage(event.queryStringParameters.key, callback);
        });

        tasks.push((parsedParameters, callback) => {
            console.log('Checking parameters');
            if (self.allowedDimensions.size > 0 && !self.allowedDimensions.has(parsedParameters.dimensions)) {
                callback(new BadRequest(`Invalid dimensions specified: ${parsedParameters.dimensions}. ` +
                    `Valid dimensions are: ${self.allowedDimensions}`));
            }
            else {
                callback(undefined, parsedParameters);
            }
        });

        tasks.push((parsedParameters, callback) => {
            console.log('Downloading file');
            this.download(parsedParameters, callback);
        });

        tasks.push((parsedParameters, callback) => {
            console.log('Transforming image');
            this.imageTransformer.transformImage(parsedParameters, callback);
        });

        tasks.push((parsedParameters, callback) => {
            console.log('Uploading image');
            this.upload(parsedParameters, callback);
        });

        async.waterfall(tasks, (err, data) => {
            if (err) {
                err.build(callback);
            }
            else {
                data.build(callback);
            }
        });
    }
};