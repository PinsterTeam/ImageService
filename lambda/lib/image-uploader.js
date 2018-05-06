'use strict';

const FileWriter = require('./file-writer');
const FileBuilder = require('./file-builder');
const _ = require('lodash');
const async = require('async');

module.exports = class ImageUploader {
    constructor(fileBuilder, fileWriter) {
        this.FileBuilder = _.isUndefined(fileBuilder) ? new FileBuilder() : fileBuilder;
        this.FileWriter = _.isUndefined(fileWriter) ? new FileWriter() : fileWriter;
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
            let response = {
                statusCode: 400,
                body: JSON.stringify({
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
                })
            };
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
            if (_.isObject(parsedRequest) &&
                _.isNumber(parsedRequest.statusCode) &&
                parsedRequest.statusCode === 400) {
                callback('The parsed request contained an error');
            }
            else {
                let imageFile = this.FileBuilder.getFile(parsedRequest.image);
                imageFile.Bucket = process.env.BUCKET_NAME;
                imageFile.Metadata = parsedRequest.metadata;
                callback(undefined, imageFile);
            }
        });
        tasks.push((imageFile, callback) => {
            this.FileWriter.saveObject(imageFile, (err, data) => {
                callback(err, imageFile, data);
            });
        });
        async.waterfall(tasks, (err, data) => {
            if (err) {
                callback(err);
            }
            else {
                let response = {
                    statusCode: 200,
                    body: JSON.stringify({
                        bucket: data[0].Bucket,
                        key: data[0].Key,
                        message: data[1]
                    })
                };
                callback(undefined, response);
            }
        });
    }
};
