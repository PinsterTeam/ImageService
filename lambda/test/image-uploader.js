'use strict';

let expect = require('chai').expect;
let ImageUploader = require('../image-uploader');
let sinon = require('sinon');

let goodPayload = {
    data: {
        metadata: {
            user_id: "uuid",
            year: "integer year"
        },
        image: "base64 encoded image"
    }
};

let badYearPayload = {
    data: {
        metadata: {user_id: "uuid"},
        image: "base64 encoded image"
    }
};

describe("ImageUploader", function () {
    it("Correctly parses the event", function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(goodPayload);
            }
        };

        ImageUploader.parseRequest(new eventFixture(), function(err, result) {
            expect(result).to.deep.include(goodPayload.data);
        });
    });

    it("Blows up on missing year", function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(badYearPayload);
            }
        };
        let callback = sinon.spy();

        ImageUploader.parseRequest(new eventFixture(), callback);
        expect(callback.called).to.be.true;
    });
});