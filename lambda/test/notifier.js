'use strict';

const expect = require('chai').expect;
const util = require('util');
const Notifier = require('../lib/notifier');

const mockImageParams = {bucket: 'bucket', key: 'key'};

const MockApiClient = class MockApiClient {
    constructor(shouldExplode) {
        this.shouldExplode = shouldExplode;
    }

    async post(path, body) {
        if (this.shouldExplode) {
            throw new Error('Should explode');
        }
        return body;
    }
};

const MockSNSClient = class MockSNSClient {
    constructor(shouldExplode) {
        this.shouldExplode = shouldExplode;
    }

    publish(notificationParameters, callback) {
        if (this.shouldExplode) {
            callback({'error': 'shits fucked yo'});
        }
        else {
            callback(undefined, notificationParameters);
        }
    }
};
describe('Notifier', function () {
    it('can notify success', function () {
        let notifier = new Notifier({apiClient: new MockApiClient(false)});

        let dataOutput = undefined;
        let errorOutput = undefined;

        const callback = (err, data) => {
            if (err) {
                console.error(util.inspect(err, {depth: 5}));
                return errorOutput = err;
            }

            return dataOutput = data;
        };

        return notifier.notifySuccess(mockImageParams, callback)
            .then(() => {
                expect(errorOutput).to.equal(undefined);
                expect(dataOutput).to.deep.equal(mockImageParams);
            });
    });

    it('can notify failure', function () {
        let notifier = new Notifier({snsClient: new MockSNSClient(false)});

        let dataOutput = undefined;
        let errorOutput = undefined;

        const callback = (err, data) => {
            if (err) {
                console.error(util.inspect(err, {depth: 5}));
                return errorOutput = err;
            }

            return dataOutput = data;
        };

        return notifier.notifyFailure({error: 'idk'}, callback)
            .then(() => {
                expect(errorOutput).to.equal(undefined);
                return expect(dataOutput).to.deep.equal({
                    Message: JSON.stringify({error: 'idk'}, null, 2),
                    Subject: 'Image Moderation Failure',
                    TopicArn: undefined
                });
            });
    });
})
;