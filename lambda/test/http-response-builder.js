'use strict';

let expect = require('chai').expect;
let HttpResponseBuilder = require('../lib/http-response-builder');

const StupidClass = class StupidClass {
    constructor(dumb) {
        this.dumb = dumb;
    }
};

describe('HttpResponseBuilder', function () {
    it('Correctly stringifies objects', function () {
        let responseBuilder = new HttpResponseBuilder(500, new StupidClass('arse'));
        expect(responseBuilder.generateResponse()).to.deep.equal({
            statusCode: 500,
            headers: {},
            body: JSON.stringify({'dumb': 'arse'})
        });
    });
});
