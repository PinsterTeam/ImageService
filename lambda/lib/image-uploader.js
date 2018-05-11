'use strict';

const FileWriter = require('./file-writer');
const FileBuilder = require('./file-builder');
const _ = require('lodash');
const async = require('async');
const util = require('util');
const InternalServerError = require('./internal-server-error');
const BadRequest = require('./bad-request');
const Ok = require('./ok');

module.exports = class ImageUploader {
    constructor(bucketName, fileBuilder, fileWriter) {
        this.FileBuilder = _.isUndefined(fileBuilder) ? new FileBuilder() : fileBuilder;
        this.FileWriter = _.isUndefined(fileWriter) ? new FileWriter() : fileWriter;
        this.bucket = _.isUndefined(bucketName) ? process.env.BUCKET_NAME : bucketName;
        if (this.bucket === null) {
            throw new InternalServerError('Bucket undefined');
        }
    }

    static parseRequest(event, callback) {
        let data = JSON.parse(event.body).data;

        // TODO - JSON Schema Validation

        let image = data.image;
        let metadata = data.metadata;
        let year = null;
        let userId = null;
        if (metadata !== null) {
            year = metadata.year;
            userId = metadata.user_id;
        }

        if (data === null || userId === null || metadata === null || year === null) {
            let response = new BadRequest(
                {
                    error: 'Bad Request. Required fields are missing.',
                    example_body: {
                        data: {
                            metadata: {
                                user_id: 'uuid',
                                year: 'integer year'
                            },
                            image: 'base64 encoded image'
                        }
                    }
                });

            callback(response);
        }
        else {
            callback(undefined, {
                metadata: metadata,
                image: image
            });
        }
    }

    perform(event, callback) {
        let tasks = [];

        tasks.push((callback) => {
            ImageUploader.parseRequest(event, callback);
        });

        tasks.push((parsedRequest, callback) => {
            let imageFile = this.FileBuilder.getFile(parsedRequest.image);
            imageFile.Bucket = this.bucket;
            imageFile.Metadata = parsedRequest.metadata;
            callback(undefined, imageFile);
        });

        tasks.push((imageFile, callback) => {
            this.FileWriter.saveObject(imageFile, callback);
        });

        async.waterfall(tasks, (err, data) => {
            console.log('Finished. Resolving response body');
            if(err) {
                console.log(util.inspect(err, {depth: 5}));
            } else {
                console.log(util.inspect(data, {depth: 5}));
            }

            err === null ? err.build(callback) : data.build(callback);
        });
    }
};
