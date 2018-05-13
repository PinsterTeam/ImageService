'use strict';

const stepfunctions = require('aws-sdk/clients/stepfunctions');
const _ = require('lodash');
const util = require('util');
const InternalServerError = require('./internal-server-error');
const Ok = require('./ok');
const async = require('async');

module.exports = class StepFunctions {
    constructor(stepFunc, statemachineArn) {
        this.stepFunctions = _.isUndefined(stepFunc) ? new stepfunctions() : stepFunc;
        this.statemachineArn = _.isUndefined(statemachineArn) ? process.env.STATEMACHINE_ARN : statemachineArn;
    }

    startExecution(event, callback) {
        async.map(event.Records, ((s3Record, callback) => {
            const s3 = s3Record.s3;
            const s3Key = s3.object.key;
            const s3BucketName = s3.bucket.name;

            this.callStepFunction({bucket: s3BucketName, key: s3Key}, (err) => {
                if (err) {
                    console.log(util.inspect(err, {depth: 5}));
                    new InternalServerError(err).build(callback);
                }
                else {
                    new Ok('Step function is executing').build(callback);
                }
            });
        }), callback);
    }

    callStepFunction(stepFunctionParams, callback) {
        let params = {
            stateMachineArn: this.statemachineArn,
            input: JSON.stringify(stepFunctionParams)
        };

        this.stepFunctions.startExecution(params, callback);
    }
};

