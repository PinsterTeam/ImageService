'use strict';

const AWSS3 = require('aws-sdk/clients/s3');
const _ = require('lodash');
const InternalServerError = require('./internal-server-error');
const Ok = require('./ok');

module.exports = class FileWriter {
    constructor(s3) {
        this.s3 = _.isUndefined(s3) ? new AWSS3() : s3;
    }

    saveObject(imageFile, callback) {
        this.s3.putObject(imageFile, (err, data) => {
            if (err) {
                callback(new InternalServerError(err));
            }
            else {
                callback(undefined, new Ok({bucket: imageFile.Bucket, key: imageFile.Key, message: data}));
            }
        });
    }

};