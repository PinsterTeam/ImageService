'use strict';

const expect = require('chai').expect;
const util = require('util');

const ThumbnailGenerator = require('../lib/thumbnail-generator');

const MockEvent = {
    queryStringParameters: {
        key: 'bob/key_400x200'
    }
};

const MockEventTwo = {
    "bucket": "pinster-image-service-dev",
    "key": "raw/926dc1235cb657e5c9d0e7dcfab84d78"
};

const MockS3 = class MockS3 {
    constructor(shouldDelete) {
        this.shouldDelete = shouldDelete;
    }

    copyObject(s3Object, callback) {
        if(shouldDelete){

        }
        callback(undefined, callback);
    }

    deleteObject(s3Object, callback) {
        callback();
    }
};


const MockImageTransformer = class MockImageTransformer {
    transformImage(parsedParameters, callback) {
        parsedParameters.buffer = new Buffer([1, 2, 3, 4]);

        callback(undefined, parsedParameters);
    }
};

const ExpectedResponse = {
    statusCode: 301,
    headers:
        {
            location: 'http://image-service-prod.pinster.io/bob/key_400x200',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
        },
    body: JSON.stringify('')
};

const ExpectedResponseTwo = {
    statusCode: 301,
    headers:
        {
            location: 'http://image-service-prod.pinster.io/key_400x200',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
        },
    body: JSON.stringify('')
};


describe('Thumbnail Generator', function () {
    it('Gets the correct mime type and image', function () {
        let thumbnailGenerator = new ThumbnailGenerator('bucket', 'http://image-service-prod.pinster.io',
            new MockS3(), new MockImageTransformer());
        thumbnailGenerator.generate(MockEvent, (err, data) => {
            console.log(util.inspect(err, {depth: 5}));

            expect(err).to.equal(undefined);
            console.log(util.inspect(data, {depth: 5}));

            expect(data).to.deep.equal(ExpectedResponse);
        });
    });

    it('Gets the correct mime type and image from non nested image', function () {
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
