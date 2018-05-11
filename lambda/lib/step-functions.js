'use strict';

const stepfunctions = require('aws-sdk/clients/stepfunctions');
const _ = require('lodash');
const util = require('util');
const InternalServerError = require('./internal-server-error');
const Ok = require('./ok');

module.exports = class StepFunctions {
    constructor(stepFunc) {
        this.stepFunctions = _.isUndefined(stepFunc) ? new stepfunctions() : stepFunc;
    }

    startExecution(event, callback) {
        console.log(util.inspect(event, {depth: 5}));

        let s3Event = event.Records[0].s3.object;
        let s3BucketName = event.Records[0].s3.bucket.name;

        console.log(s3Event);
        // let desiredSizes = new Set();
        let height = 100;
        let width = 100;

        let resizeParams = {Bucket: s3BucketName, Key: s3Event.key, height: height, width: width};

        this.callStepFunction(resizeParams, (err) => {
            if (err) {
                new InternalServerError(err).build(callback);
            }
            else {
                new Ok('Step function is executing').build(callback);
            }
        });
    }

    callStepFunction(resizeParams, callback) {
        let params = {
            stateMachineArn: process.env.STATEMACHINE_ARN,
            input: JSON.stringify(resizeParams)
        };

        this.stepFunctions.startExecution(params, callback);
    }
};
