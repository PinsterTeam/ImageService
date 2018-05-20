'use strict';

const AWSS3 = require('aws-sdk/clients/s3');
const _ = require('lodash');
const path = require('path');
const util = require('util');

module.exports = class ImageMover {
    constructor(newPrefix, bucket, s3, imageBucketUrl) {
        this.newPrefix = _.isUndefined(newPrefix) ? process.env.PREFIX : newPrefix;
        this.bucket = _.isUndefined(bucket) ? process.env.BUCKET : bucket;
        this.s3 = _.isUndefined(s3) ? new AWSS3() : s3;
        this.imageBucketUrl = _.isUndefined(imageBucketUrl) ? process.env.URL : imageBucketUrl;

    }

    moveImage(event, callback) {
        this.parseEvent(event, (err, data) => {
            if (err) {
                callback(err);
            }
            else {
                this.performMove(event, data, callback);
            }
        });
    }

    parseEvent(event, callback) {
        try {
            console.log(util.inspect(event, {depth: 5}));
            console.log(`Using bucket: '${this.bucket}'`);
            console.log(`Using prefix: '${this.newPrefix}'`);
            console.log(`Basename of event key: '${path.basename(event.Key)}'`);

            const newKey = path.join(this.newPrefix, path.basename(event.Key));
            console.log(`New key: '${newKey}'`);

            callback(undefined, {
                CopySource: path.join(event.Bucket, event.Key),
                Bucket: this.bucket,
                Key: newKey,
                MetadataDirective: 'COPY'
            });
        } catch (err) {
            callback(err);
        }
    }

    performMove(event, copyObjectParams, callback) {
        this.s3.copyObject(copyObjectParams, (err) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            else {
                console.log(`Copy success for: ${copyObjectParams.CopySource} to: ${copyObjectParams.Key}. Deleting original now.`);
                this.s3.deleteObject(event, (err) => {
                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                    else {
                        this.buildParamsForNextStep(copyObjectParams, callback);
                    }
                });
            }
        });
    }

    buildParamsForNextStep(copyObjectParams, callback) {
        this.s3.headObject(copyObjectParams, (err, data) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            else {
                console.log(util.inspect(data, {depth: 5}));
                callback(undefined, this.parseMetadataIntoPostBody(data.Metadata));
            }
        });
    }

    parseMetadataIntoPostBody(metadata) {
        return {
            'data': {
                'imageable_id': ImageMover.getValue('imageable_id', metadata),
                'imageable_type': ImageMover.capitalizeFirstLetter(ImageMover.getValue('imageable_type', metadata)),
                'base_file_name': ImageMover.getValue('base_file_name', metadata),
                'storage_location_uri': this.imageBucketUrl + '/' + ImageMover.getValue('base_file_name', metadata),
                'thumbnailable': true
            }

        };
    }

    static getValue(key, metadata) {
        return metadata['x-amz-meta-' + key];
    }

    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


};