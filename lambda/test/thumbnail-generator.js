'use strict';

const expect = require('chai').expect;
const assert = require('chai').assert;
const util = require('util');

const ThumbnailGenerator = require('../lib/thumbnail-generator');

const MockEvent = {
    queryStringParameters: {
        key: 'bob/key_400x200.jpg'
    }
};
const MockS3 = class MockS3 {
    getObject(s3Object) {
        return new Promise(() =>)
    }
};

describe('Thumbnail Generator', function () {
    it('Gets the correct mime type and image', function () {
        let thumbnailGenerator = new ThumbnailGenerator();
        return thumbnailGenerator.generate(MockEvent, (data, err) => {
            expect(data).to.equal('ass');
        }).catch((err) => {
            console.log(util.inspect(err, {depth: 5}));

            expect(err).to.equal(undefined);
        });
    });
});
