'use strict';

let expect = require('chai').expect;
let Base64Handler = require('../base64-handler');
let base64ImageMetadata = 'data:image/png;base64,';
let base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAsAAAAECAYAAABY+sXzAAAABHNCSVQICAgIfAhkiAAAAFlJREFUCJl9yjEKwCAUBNERv43g/U+WKqVVsNRKxU0jJGnyYGGLcTln1VoBSCnRWsN7D0AIATOjlEKMEbQd16kxhuac6r1rrfWZJBmbAEn8eeKlT/z+zjkAbkDFRMbggmGwAAAAAElFTkSuQmCC'

describe("Base64 handler", function () {
    it("Gets the correct mime type", function () {
        let mimeType = Base64Handler.getMimeType(base64ImageMetadata + base64Image);
        expect(mimeType).to.deep.equal({ext: 'png', mime: 'image/png'});
    });

    it("Removes everything in front of comma, inclusive", function () {
        let fixtureString = 'something,stuff';
        expect(Base64Handler.pruneBase64String(fixtureString)).to.equal('stuff');
    });
});