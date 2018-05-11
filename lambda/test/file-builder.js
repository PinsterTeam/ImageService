'use strict';

let expect = require('chai').expect;
let md5 = require('md5');
let FileBuilder = require('../lib/file-builder');
let base64ImageMetadata = 'data:image/png;base64,';
let base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAsAAAAECAYAAABY+sXzAAAABHNCSVQICAgIfAhkiAAAAFlJREFUCJl9yjEKwCAUBNERv43g/U+WKqVVsNRKxU0jJGnyYGGLcTln1VoBSCnRWsN7D0AIATOjlEKMEbQd16kxhuac6r1rrfWZJBmbAEn8eeKlT/z+zjkAbkDFRMbggmGwAAAAAElFTkSuQmCC';
let imageMD5 = md5(Buffer.from(base64Image, 'base64'));

describe('FileBuilder', function () {
    it('Returns the correct file information', function () {
        let fileBuilder = new FileBuilder();
        let file = fileBuilder.getFile(base64ImageMetadata + base64Image);
        let mockFile = {
            Key: 'raw/' + imageMD5,
            Body: Buffer.from(base64Image, 'base64')
        };
        expect(file).to.deep.equal(mockFile);
    });
});
