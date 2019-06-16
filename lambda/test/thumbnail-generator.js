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
    queryStringParameters: {
        key: 'key_400x200'
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


const MockImageTransformer = class MockImageTransformer {
    async transformImage(parsedParameters) {
        parsedParameters.buffer = new Buffer([1, 2, 3, 4]);

        return parsedParameters;
    }
};

const ExpectedResponse = {
    statusCode: 301,
    headers:
        {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            location: 'http://image-service-prod.pinster.io/bob/key_400x200',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
        },
    body: ''
};

const ExpectedResponseTwo = {
    statusCode: 301,
    headers:
        {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            location: 'http://image-service-prod.pinster.io/key_400x200',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
        },
    body: ''
};


describe('Thumbnail Generator', function () {
    it('Gets the correct mime type and image', function () {
        const thumbnailGenerator = new ThumbnailGenerator({
            bucket: 'bucket',
            url: 'http://image-service-prod.pinster.io',
            s3Get: async () => {
                return {Body: new Buffer([1, 2, 3, 4])};
            },
            s3Put: async () => {
            },
            imageTransformer: new MockImageTransformer()
        });
        return thumbnailGenerator.generate(MockEvent)
            .then((data) => {
                expect(data).to.deep.equal(ExpectedResponse);
            }).catch(err => {
                console.log(util.inspect(err, {depth: 5}));

                expect(err).to.equal(undefined);
            });
    });

    it('Gets the correct mime type and image from non nested image', function () {
        const thumbnailGenerator = new ThumbnailGenerator({
            bucket: 'bucket',
            url: 'http://image-service-prod.pinster.io',
            s3Get: async () => {
                return {Body: new Buffer([1, 2, 3, 4])};
            },
            s3Put: async () => {
            },
            imageTransformer: new MockImageTransformer()
        });
        return thumbnailGenerator.generate(MockEventTwo)
            .then(data => {
                expect(data).to.deep.equal(ExpectedResponseTwo);
            }).catch(err => {
                console.log(util.inspect(err, {depth: 5}));

                expect(err).to.equal(undefined);
            });
    });
});
