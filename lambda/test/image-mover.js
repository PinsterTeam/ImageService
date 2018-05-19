'use strict';

const expect = require('chai').expect;
const util = require('util');

const ImageMover = require('../lib/image-mover');

const MockEvent = {
    queryStringParameters: {
        key: 'bob/key_400x200'
    }
};

const MockS3 = class MockS3 {
    getObject(s3Object, callback) {
        callback(undefined, {Body: new Buffer([1, 2, 3, 4])});
    }

    putObject(s3Object, callback) {
        callback();
    }
};


describe('Image Mover', function () {
    it('Copies the image successfully', function () {
        let thumbnailGenerator = new ThumbnailGenerator('bucket', 'http://image-service-prod.pinster.io',
            new MockS3(), new MockImageTransformer());
        thumbnailGenerator.generate(MockEvent, (err, data) => {
            console.log(util.inspect(err, {depth: 5}));

            expect(err).to.equal(undefined);
            console.log(util.inspect(data, {depth: 5}));

            expect(data).to.deep.equal(ExpectedResponse);
        });
    });

    it('Deletes the original after copying', function () {
        let thumbnailGenerator = new ThumbnailGenerator('bucket', 'http://image-service-prod.pinster.io',
            new MockS3(), new MockImageTransformer());
        thumbnailGenerator.generate(MockEventTwo, (err, data) => {
            console.log(util.inspect(err, {depth: 5}));

            expect(err).to.equal(undefined);
            console.log(util.inspect(data, {depth: 5}));

            expect(data).to.deep.equal(ExpectedResponseTwo);
        });
    });
});
