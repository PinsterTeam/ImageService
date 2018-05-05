'use strict';

const expect = require('chai').expect;
const assert = require('chai').assert;

const ThumbnailGenerator = require('../lib/thumbnail-generator');

const MockEvent = {
    queryStringParameters: {
        key: 'key'
    }
};

describe("Thumbnail Generator", function () {
    it("Gets the correct mime type and image", function () {
        let thumbnailGenerator = new ThumbnailGenerator();
        return thumbnailGenerator.generate(MockEvent, (err, data) => {
            if (err) {
                assert(!err,err)
            }
        }).then((data) => {
            expect(data).to.equal('ass')
        }).catch((err)=>{
            assert(!err)
        })
    });
});
