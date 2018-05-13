'use strict';

const expect = require('chai').expect;
const util = require('util');
const Notifier = require('../lib/notifier');

const MockImageParams = {bucket: 'bucket', key: 'key'};

const MockPinsterApiClient = class MockPinsterApiClient {
    constructor(shouldExplode) {
        this.shouldExplode = shouldExplode;
    }

    createImage(imageParameters, callback) {
        if(this.shouldExplode) {
            callback({'error':'shits fucked yo'});
        } else {
            callback(undefined, imageParameters);
        }
    }

    createFailureNotification(notificationParameters, callback) {
        if(this.shouldExplode) {
            callback({'error':'shits fucked yo'});
        } else {
            callback(undefined, notificationParameters);
        }
    }
};

describe('Notifier', function () {
    it('can notify success', function () {
        let notifier = new Notifier(new MockPinsterApiClient(false));

        notifier.notifySuccess(MockImageParams, (err, data) => {
            if (err) {
                console.log(util.inspect(err, {depth: 5}));
            }

            expect(err).to.equal(undefined);
            expect(data).to.deep.equal(MockImageParams);
        });
    });

    it('can notify failure', function () {
        let notifier = new Notifier(new MockPinsterApiClient(false));

        notifier.notifyFailure({error: 'idk'}, (err, data) => {
            if (err) {
                console.log(util.inspect(err, {depth: 5}));
            }

            expect(err).to.equal(undefined);
            expect(data).to.deep.equal({error: 'idk'});
        });
    });
});