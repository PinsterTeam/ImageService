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
const IMAGE_KEY_PATTERN_REGEX = /(([\/a-zA-Z0-9]+)\/([a-zA-Z0-9]+))_((\d+|auto)x(\d+|auto))(\.jpeg|\.jpg|\.png)/;

module.exports = class ThumbnailGenerator {
    constructor(s3, bucket, url, allowedDimensions, imageTransformer) {
        this.s3 = _.isUndefined(s3) ? new AWSS3() : s3;
        this.bucket = _.isUndefined(bucket) ? process.env.BUCKET : bucket;
        this.url = _.isUndefined(url) ? process.env.URL : url;
        this.allowedDimensions = _.isUndefined(allowedDimensions) ? new Set() : allowedDimensions;
        this.imageTransformer = _.isUndefined(imageTransformer) ? ImageTransformer : imageTransformer;
    }

    static parseRequestedImage(requestedImageKey) {
        return new Promise((resolve) => {
            const match = requestedImageKey.match(IMAGE_KEY_PATTERN_REGEX);

            if (match === null) {
                throw new BadRequest(`Key: '${requestedImageKey}' is not a supported image file!`);
            }
            else {
                const dimensions = match[4]; //400xauto, for example.
                const width = match[5] === 'auto' ? null : Math.min(parseInt(match[5], 10), MAX_SIZE);
                const height = match[6] === 'auto' ? null : Math.min(parseInt(match[6], 10), MAX_SIZE);
                const dotExtension = match[7];
                const originalKey = match[1] + dotExtension;
                const newKey = match[0]; //whatever they requested is what we'll make

                console.log("Dimensions " + dimensions);
                console.log("Width " + width);
                console.log("Height " + height);
                console.log("DotExtension " + dotExtension);
                console.log("OriginalKey " + originalKey);
                console.log("NewKey " + newKey);


                return resolve({
                    dimensions: dimensions,
                    width: width,
                    height: height,
                    originalKey: originalKey,
                    newKey: newKey
                });
            }
        })
    }

    manipulate(parsedParameters) {
        return this.s3.getObject({Bucket: this.bucket, Key: parsedParameters.originalKey}).promise()
            .then(data => this.imageTransformer.transformImage(data.Body,
                parsedParameters.width,
                parsedParameters.height)
            )
            .then(buffer => this.s3.putObject({
                    Body: buffer,
                    Bucket: this.bucket,
                    ContentType: 'image/jpeg',
                    Key: parsedParameters.newKey,
                    CacheControl: `max-age=${MAX_AGE}`,
                }).promise()
            )
            .then(() => new MovedPermanently('', {
                    location: `${this.url}/${parsedParameters.newKey}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    Pragma: 'no-cache',
                    Expires: '0'
                })
            );
    }

    generate(event, callback) {
        console.log(util.inspect(event, {depth: 5}));

        return ThumbnailGenerator.parseRequestedImage(event.queryStringParameters.key)
            .then((parsedParameters) => {
                if (this.allowedDimensions.size > 0 && !this.allowedDimensions.has(parsedParameters.dimensions)) {
                    throw new BadRequest(`Invalid dimensions specified: ${parsedParameters.dimensions}. ` +
                        `Valid dimensions are: ${this.allowedDimensions}`);
                }
                else {
                    return this.manipulate(parsedParameters);
                }
            })
            .then((response) => callback(undefined, response))
            .catch(err => callback(new InternalServerError(err)));

        // let tasks = [];
        //
        // tasks.push((callback) => {
        //     ThumbnailGenerator.parseRequestedImage(event.queryStringParameters.key, callback);
        // });
        //
        // tasks.push((parsedParameters, callback) => {
        //     if (this.allowedDimensions.size > 0 && !this.allowedDimensions.has(parsedParameters.dimensions)) {
        //         callback(new BadRequest(`Invalid dimensions specified: ${parsedParameters.dimensions}. ` +
        //             `Valid dimensions are: ${this.allowedDimensions}`));
        //     }
        //     else {
        //         this.manipulate(parsedParameters, callback);
        //     }
        // });
        //
        // async.waterfall(tasks, (err, data) => {
        //     if (err) {
        //         err.build(callback)
        //     }
        //     else {
        //         data.build(callback);
        //     }
        // });
    }
};