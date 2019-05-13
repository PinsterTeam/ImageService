'use strict';

const ApiClient = require('./ApiClient');
const _ = require('lodash');
const util = require('util');
const AWS = require('aws-sdk');

module.exports = class Notifier {
    constructor(params = {}) {
        this.apiClient = _.isUndefined(params.apiClient) ? new ApiClient() : params.apiClient;
        this.snsClient = _.isUndefined(params.snsClient) ? new AWS.SNS() : params.snsClient;
        this.snsArn = _.isUndefined(params.snsArn) ? process.env.SNS_ARN : params.snsArn;
    }

    async notifySuccess(imageParams, callback) {
        console.log(util.inspect(imageParams, {depth: 5}));
        return this.createImage(imageParams)
            .then(imageCreateResponse => {
                console.debug('Successful response: ', imageCreateResponse);
                return callback(undefined, imageCreateResponse);
            }).catch(err => {
                console.error('Error processing: ', err);
                return callback(err);
            });
    }

    async notifyFailure(notificationParams, callback) {
        console.log(util.inspect(notificationParams, {depth: 5}));

        let eventText = JSON.stringify(notificationParams, null, 2);
        let params = {
            Message: eventText,
            Subject: 'Image Moderation Failure',
            TopicArn: this.snsArn
        };
        return this.snsClient.publish(params, callback);
    }


    async createImage(imageParams) {
        const tokenParams = {};
        tokenParams.imageable_type = imageParams.imageable_type;
        tokenParams.imageable_id = imageParams.imageable_id;
        return this.apiClient.post('/v1/images/', imageParams, tokenParams);
    }
};
