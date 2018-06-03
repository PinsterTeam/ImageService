'use strict';

const ModerationThresholdExceeded = require('./moderation-threshold-exceeded');
const Rekognition = require('aws-sdk/clients/rekognition');
const _ = require('lodash');
const util = require('util');

module.exports = class Moderator {
    constructor(rekognition) {
        this.rekognition = _.isUndefined(rekognition) ? new Rekognition() : rekognition;
    }

    moderate(event, callback) {
        console.log(util.inspect(event, {depth: 5}));

        const params = {
            Image: {
                S3Object: {
                    Bucket: event.Bucket,
                    Name: event.Key
                }
            },
            MinConfidence: 0.0
        };

        console.log(params);

        this.rekognition.detectModerationLabels(params).promise()
            .then(result => {
                console.log('The rekognition result:', util.inspect(result, {depth: 5}));
                if (result.ModerationLabels.length > 0) {
                    callback(new ModerationThresholdExceeded(JSON.stringify(result)));
                }
                callback(undefined, event);
            })
            .catch(err => callback(err));
    }
};
