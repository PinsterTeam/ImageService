'use strict';

const expect = require('chai').expect;
const util = require('util');
const StepFunctions = require('../lib/step-functions');

const MockEvent = {
    Records: [
        {
            eventVersion: '2.0',
            eventSource: 'aws:s3',
            awsRegion: 'us-east-1',
            eventTime: '1970-01-01T00:00:00.000Z',
            eventName: 'ObjectCreated:Put',
            userIdentity: {
                principalId: 'AIDAJDPLRKLG7UEXAMPLE'
            },
            requestParameters: {
                sourceIPAddress: '127.0.0.1'
            },
            responseElements: {
                'x-amz-request-id': 'C3D13FE58DE4C810',
                'x-amz-id-2': 'FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpD'
            },
            s3: {
                s3SchemaVersion: '1.0',
                configurationId: 'testConfigRule',
                bucket: {
                    name: 'mybucket',
                    ownerIdentity: {
                        principalId: 'A3NL1KOZZKExample'
                    },
                    arn: 'arn:aws:s3:::mybucket'
                },
                object: {
                    key: 'HappyFace.jpg',
                    size: 1024,
                    eTag: 'd41d8cd98f00b204e9800998ecf8427e',
                    versionId: '096fKKXTRTtl3on89fVO.nfljtsv6qko',
                    sequencer: '0055AED6DCD90281E5'
                }
            }
        }
    ]
};

const MockStepFunctions = class MockStepFunctions {
    startExecution(params, callback) {
        callback(undefined, 'response');
    }
};

describe('StepFunctions', function () {
    it('can start the step function', function () {
        let stepFunctions = new StepFunctions(new MockStepFunctions());

        stepFunctions.startExecution(MockEvent, (err, data) => {
            if (err) {
                console.log(util.inspect(err, {depth: 5}));
            }

            expect(err).to.equal(undefined);
            expect(data).to.deep.equal({statusCode: 200, body: '"Step function is executing"', headers: {}});
        });
    });
});