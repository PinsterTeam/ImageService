'use strict';

const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();

module.exports.startExecution = (event, context, callback) => {
    console.log('startExecution');

    let s3Event = event.Records[0].s3.object;
    let s3BucketName = event.Records[0].s3.bucket.name;

    console.log(s3Event);
    // let desiredSizes = new Set();
    let height = 100;
    let width = 100;

    let resizeParams = {Bucket: s3BucketName, Key: s3Event.key, height: height, width: width};
    console.log(resizeParams);

    callStepFunction(resizeParams).then(result => {
        if (!result) {
            callback("Failed to execute step function");
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify({message: 'Step function is executing'})
        };

        console.log(response);

        callback(null, response);
    });
};


function callStepFunction(resizeParams) {
    console.log('callStepFunction');

    let params = {
        stateMachineArn: process.env.STATEMACHINE_ARN,
        input: JSON.stringify(resizeParams)
    };

    console.log('Start execution');
    return stepfunctions.startExecution(params).promise().then(() => {
        return true;
    }).catch(error => {
        console.log(error);
        return false;
    });
}