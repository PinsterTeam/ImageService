'use strict';

const FileWriter = require('./file-writer');
const FileBuilder = require('./file-builder');
const _ = require('lodash');
const async = require('async');
const util = require('util');
const InternalServerError = require('./internal-server-error');
const BadRequest = require('./bad-request');

module.exports = class ImageUploader {
    constructor(bucketName, fileBuilder, fileWriter) {
        this.FileBuilder = _.isUndefined(fileBuilder) ? new FileBuilder() : fileBuilder;
        this.FileWriter = _.isUndefined(fileWriter) ? new FileWriter() : fileWriter;
        this.bucket = _.isUndefined(bucketName) ? process.env.BUCKET_NAME : bucketName;
        if (this.bucket === null) {
            throw new InternalServerError('Bucket undefined');
        }
    }

    parseRequest(event, callback) {
        let data = JSON.parse(event.body).data;

        // TODO - JSON Schema Validation

        let image = data.image;
        let metadata = data.metadata;
        let bucket = this.bucket;
        let year = null;
        let userId = null;
        let imageable_id = null;
        let imageable_type = null;

        if (metadata !== null && metadata !== undefined) {
            year = metadata.year;
            userId = metadata.user_id;
            imageable_id = metadata.imageable_id;
            imageable_type = metadata.imageable_type;
        }

        if (data === null || userId === null || metadata === null || year === null
            || imageable_id === null || imageable_type === null) {
            let response = new BadRequest(
                {
                    error: 'Bad Request. Required fields are missing.',
                    example_body: {
                        data: {
                            metadata: {
                                user_id: 'uuid',
                                year: 'integer year',
                                imageable_type: 'imageable_type',
                                imageable_id: 'imageable_id'
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
                image: image,
                bucket: bucket
            });
        }
    }

    perform(event, callback) {
        let tasks = [];

        tasks.push((callback) => {
            this.parseRequest(event, callback);
        });

        tasks.push((parsedRequest, callback) => {
            this.FileBuilder.getFile(parsedRequest, callback);
        });

        tasks.push((imageFile, callback) => {
            this.FileWriter.saveObject(imageFile, callback);
        });

        async.waterfall(tasks, (err, data) => {
            console.log('Finished. Resolving response body');
            if (err) {
                console.log(util.inspect(err, {depth: 5}));
            }
            else {
                console.log(util.inspect(data, {depth: 5}));
            }

            err === null ? err.build(callback) : data.build(callback);
        });
    }
};
