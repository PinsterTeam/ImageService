'use strict';

const _ = require('lodash');
const util = require('util');
const PinsterApiClient = require('./pinsterApiClient');

module.exports = class Notifier {
    constructor(pinsterApiClient) {
        this.api_client = _.isUndefined(pinsterApiClient) ? new PinsterApiClient : pinsterApiClient;
    }

    notifySuccess(event, callback) {
        console.log(util.inspect(event, {depth: 5}));
        this.api_client.createImage(event.body, callback);
    }

    notifyFailure(event, callback) {
        console.log(util.inspect(event, {depth: 5}));
        this.api_client.createFailureNotification(event.body, callback);
    }
};
