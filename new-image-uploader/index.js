'use strict';

const AWSS3 = require('aws-sdk/clients/s3');

const FileWriter = require('../new-image-uploader/file-writer');
const FileBuilder = require('../new-image-uploader/file-builder');
const RequestHandler = require('../new-image-uploader/request-handler');

module.exports.upload = (event, context, callback) => {
    let bucket = process.env['BUCKET_NAME'] == null ? 'test-image-service-new-bucket-test' : process.env['BUCKET_NAME'];
    RequestHandler.perform(event, context, callback, new FileBuilder(), new FileWriter(new AWSS3()),bucket );
};