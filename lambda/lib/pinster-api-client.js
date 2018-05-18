'use strict';

const _ = require('lodash');
const util = require('util');
const request = require('request');

module.exports = class PinsterApiClient {
    constructor(base_url, auth_token) {
        this.base_url = _.isUndefined(base_url) ? process.env.PINSTER_API_URL : base_url;
        this.auth_token = _.isUndefined(auth_token) ? process.env.AUTH_TOKEN : auth_token;
    }

    createImage(imageParameters, callback) {
        request.post({
            url: `${this.base_url}/v1/images`,
            headers: {
                'Authorization': this.auth_token
            }
        }, imageParameters, (err, response, body) => {
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
        request.post({
            url: `${this.base_url}/v1/notifications/failure`,
            headers: {
                'Authorization': this.auth_token
            }
        }, notificationParameters, (err, response, body) => {
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
