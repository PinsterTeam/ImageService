'use strict';

const expect = require('chai').expect;
const ImageUploader = require('../lib/image-uploader');
const sinon = require('sinon');
const util = require('util');
const Ok = require('../lib/ok');

const goodPayload = {
    data: {
        metadata: {
            user_id: 'uuid',
            year: 'integer year'
        },
        image: 'base64 encoded image'
    }
};

const badYearPayload = {
    data: {
        metadata: {user_id: 'uuid'},
        image: 'base64 encoded image'
    }
};

const MockFileBuilder = class MockFileBuilder {
    getFile() {
        return {
            Key: 'filename',
            Body: new Buffer([1, 2, 3, 4])
        };
    }
};

const MockFileWriter = class MockFileWriter {
    saveObject(imageFile, callback) {
        callback(undefined, new Ok('asdf'));
    }
};

describe('ImageUploader', function () {
    it('Correctly parses the event', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(goodPayload);
            }
        };

        ImageUploader.parseRequest(new eventFixture(), function (err, result) {
            expect(result).to.deep.include(goodPayload.data);
        });
    });

    it('Blows up on missing year', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(badYearPayload);
            }
        };
        let callback = sinon.spy();

        ImageUploader.parseRequest(new eventFixture(), callback);
        expect(callback.called).to.be.true;
    });

    it('Actually uploads the file', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(goodPayload);
            }
        };
        let callback = (err, data) => {
            if (err) {
                console.log(util.inspect(err, {depth: 5}));
            }

            expect(err).to.equal(undefined);
            expect(data).to.deep.equal({ statusCode: 200, body: '"asdf"', headers: {} }
            );
        };

        let imageUploader = new ImageUploader('bucket', new MockFileBuilder(), new MockFileWriter());

        imageUploader.perform(new eventFixture(), callback);
    });
});