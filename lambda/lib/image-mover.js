'use strict';

const AWSS3 = require('aws-sdk/clients/s3');
const _ = require('lodash');
const path = require('path');

module.exports = class ImageMover {
    constructor(newPrefix, bucketName, s3) {
        this.newPrefix = _.isUndefined(newPrefix) ? process.env.PREFIX : newPrefix;
        this.bucket = _.isUndefined(bucketName) ? process.env.BUCKET_NAME : bucketName;
        this.s3 = _.isUndefined(s3) ? new AWSS3() : s3;
        console.log(this.s3.callDeleteAfterCopy);
    }

    moveImage(event, callback) {
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