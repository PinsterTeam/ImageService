'use strict';

const _ = require('lodash');
const util = require('util');
const PinsterApiClient = require('./pinsterApiClient');

module.exports = class Notifier {
    constructor(pinsterApiClient) {
        this.api_client = _.isUndefined(pinsterApiClient) ? new PinsterApiClient : pinsterApiClient;
    }

    notifySuccess(imageParams, callback) {
        console.log(util.inspect(imageParams, {depth: 5}));
        this.api_client.createImage(imageParams, callback);
    }

    notifyFailure(notificationParams, callback) {
        console.log(util.inspect(notificationParams, {depth: 5}));
        this.api_client.createFailureNotification(notificationParams, callback);
    }
};
