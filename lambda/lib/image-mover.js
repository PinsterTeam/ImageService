'use strict';

const AWSS3 = require('aws-sdk/clients/s3');
const _ = require('lodash');
const path = require('path');

module.exports = class ImageMover {
    constructor(newPrefix, bucket, s3) {
        this.newPrefix = _.isUndefined(newPrefix) ? process.env.PREFIX : newPrefix;
        this.bucket = _.isUndefined(bucket) ? process.env.BUCKET : bucket;
        this.s3 = _.isUndefined(s3) ? new AWSS3() : s3;
    }

    moveImage(event, callback) {
        console.log(util.inspect(event, {depth: 5}));
        const copyObjectParams = {
            CopySource: path.join(event.Bucket, event.Key),
            Key: path.join(this.newPrefix, path.basename(event.Key))
        };

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
                    } else {
                        callback(undefined, 'Delete Success!');
                    }
                })
            }
        });
    }

    delete(s3Object, callback) {
    }
};