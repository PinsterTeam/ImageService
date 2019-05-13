'use strict';

const FileWriter = require('./file-writer');
const FileBuilder = require('./file-builder');
const _ = require('lodash');
const InternalServerError = require('./internal-server-error');
const BadRequest = require('./bad-request');
const TokenProvider = require('./TokenProvider');

const exampleBody = {
    error: 'Bad Request. Required fields are missing.',
    example_body: {
        data: {
            image: 'base64 encoded image',
            name: 'Optional name of image',
            description: 'Optional description',
            featured: 'Optional unix epoch integer in ms'
        }
    }
};

module.exports = class ImageUploader {
    constructor(params = {}) {
        this.FileBuilder = _.isUndefined(params.fileBuilder) ? new FileBuilder() : params.fileBuilder;
        this.FileWriter = _.isUndefined(params.fileWriter) ? new FileWriter() : params.fileWriter;
        this.bucket = _.isUndefined(params.bucketName) ? process.env.BUCKET_NAME : params.bucketName;
        if (this.bucket === null) {
            throw new InternalServerError('Bucket undefined');
        }
        this.tokenProvider = _.isUndefined(params.tokenProvider) ? new TokenProvider() : params.tokenProvider;
    }

    async parseRequest(event) {
        console.log('Event received', event);

        const decoded = await this.tokenProvider.authorize(event);

        const user_id = decoded.user_id;
        const imageable_type = decoded.imageable_type;
        const imageable_id = decoded.imageable_id;

        if (!event.body) {
            throw new BadRequest(exampleBody);
        }

        const data = JSON.parse(event.body).data;
        if (!data || !data.image) {
            throw new BadRequest(exampleBody);
        }

        const metadata = this.validateData(data, {user_id, imageable_type, imageable_id});


        const response = {
            metadata: metadata,
            image: data.image,
            bucket: this.bucket
        };
        console.log('Uploader output: ', response);

        return response;
    }

    validateData(data, metadata) {
        const errors = {};
        if (data.name) {
            const string = String(data.name);
            if (string && string.length < 140 && string.length > 3) {
                metadata.name = data.name.replace(/[^\w\s]/gi, '');
            }
            else {
                errors.name = 'Must be between 3 and 140 characters A-z0-9. Omit or null the field otherwise.';
            }
        }

        if (data.description) {
            const string = String(data.description);
            if (string && string.length < 140 && string.length > 3) {
                metadata.description = data.description.replace(/[^\w\s\\.!?]/gi, '');
            }
            else {
                errors.description = 'Must be between 3 and 140 characters A-z0-9. Omit or null the field otherwise.';
            }
        }

        if (data.featured) {
            if (Number.isInteger(data.featured)) {
                metadata.featured = data.featured;
            }
            else {
                errors.featured = 'Must be an integer. Omit or null the field otherwise.';
            }
        }

        if (Object.keys(errors).length > 0) {
            throw new BadRequest({errors: {data: errors}});
        }

        return metadata;
    }

    async perform(event, callback) {
        return this.parseRequest(event)
            .then(this.FileBuilder.getFile)
            .then(this.FileWriter.saveObject)
            .then(saveObjectResponse => {
                console.debug('Successful response: ', saveObjectResponse);
                return callback(undefined, saveObjectResponse.generateResponse());
            })
            .catch(err => {
                console.error('Error processing: ', err);
                return callback(err.generateResponse());
            });
    }
};
