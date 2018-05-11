'use strict';

let expect = require('chai').expect;
let md5 = require('md5');
let FileBuilder = require('../lib/file-builder');
let base64ImageMetadata = 'data:image/png;base64,';
let base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAsAAAAECAYAAABY+sXzAAAABHNCSVQICAgIfAhkiAAAAFlJREFUCJl9yjEKwCAUBNERv43g/U+WKqVVsNRKxU0jJGnyYGGLcTln1VoBSCnRWsN7D0AIATOjlEKMEbQd16kxhuac6r1rrfWZJBmbAEn8eeKlT/z+zjkAbkDFRMbggmGwAAAAAElFTkSuQmCC';
let imageMD5 = md5(Buffer.from(base64Image, 'base64'));
const util = require('util');

describe('FileBuilder', function () {
    it('Returns the correct file information', function () {
        let fileBuilder = new FileBuilder();

        let mockFile = {
            Key: 'raw/' + imageMD5,
            Body: Buffer.from(base64Image, 'base64'),
            ContentType: 'image/png',
            Metadata: 'metadata',
            Bucket: 'bucket'
        };

        let callback = (err, data) => {
            if (err) {
                console.log(util.inspect(err, {depth: 5}));
            }

            expect(err).to.equal(undefined);
            expect(data).to.deep.equal(mockFile);
        };

        let parsedPayload = {
            metadata: 'metadata',
            image: base64ImageMetadata + base64Image,
            bucket: 'bucket'
        };

        fileBuilder.getFile(parsedPayload, callback);

    });
});
