'use strict';

const _ = require('lodash');
const util = require('util');
const request = require('request');

module.exports = class PinsterApiClient {
    constructor(base_url) {
        this.base_url = _.isUndefined(base_url) ? process.env.PINSTER_API_URL : base_url;
    }

    createImage(imageParameters, callback) {
        request.post(`${this.base_url}/v1/images`, imageParameters, (err, response, body) => {
            if (err) {
                console.log(util.inspect(err, {depth: 5}));
                callback(err);
            }
            else {
                console.log(util.inspect(response, {depth: 5}));
                console.log(util.inspect(body, {depth: 5}));
                callback(undefined, response, body);
            }
        });
    }

    createFailureNotification(notificationParameters, callback) {
        request.post(`${this.base_url}/v1/notifications/failure`, notificationParameters, (err, response, body) => {
            if (err) {
                console.log(util.inspect(err, {depth: 5}));
                callback(err);
            }
            else {
                console.log(util.inspect(response, {depth: 5}));
                console.log(util.inspect(body, {depth: 5}));
                callback(undefined, response, body);
            }
        });
    }
};
