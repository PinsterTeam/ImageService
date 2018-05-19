'use strict';

const AWSS3 = require('aws-sdk/clients/s3');
const _ = require('lodash');
const InternalServerError = require('./internal-server-error');
const Ok = require('./ok');
const path = require('path');

module.exports = class ImageMover {
    constructor(newPrefix, bucketName, s3) {
        this.newPrefix = _.isUndefined(newPrefix) ? process.env.PREFIX : newPrefix;
        this.bucket = _.isUndefined(bucketName) ? process.env.BUCKET_NAME : bucketName;
        this.s3 = _.isUndefined(s3) ? new AWSS3() : s3;
    }

    moveImage(event, callback) {
        const params = {
            CopySource: path.join(event.bucket, event.key),
            Key: path.join(this.newPrefix, path.basename(event.key))
        };

        this.s3.copyObject(params, (err) => {
            if (err) {
                console.log(err);
                callback(err);
            }
            else {
                console.log(`Copy success for: ${params.CopySource} to: ${params.Key}. Deleting original now.`);
                this.delete(event, callback);
            }
        });
    }

    delete(s3Object, callback) {
        this.s3.deleteObject(s3Object, (err) => {
            if(err) {
                console.log(err);
                callback(err);
            } else {
                callback(undefined, 'Delete Success!');
            }
        })
    }
};