'use strict';

const expect = require('chai').expect;
const util = require('util');

const ImageMover = require('../lib/image-mover');

const MockEvent = {
    Bucket: "pinster-image-service-dev",
    Key: "raw/926dc1235cb657e5c9d0e7dcfab84d78"
};

const MockS3 = class MockS3 {
    constructor(callDeleteAfterCopy) {
        this.callDeleteAfterCopy = callDeleteAfterCopy;
    }

    copyObject(event, callback) {
        if (this.callDeleteAfterCopy) {
            callback(undefined, this.deleteObject(event, callback));
        } else {
            callback(undefined, 'yay');
        }
    }

    deleteObject(s3Object, callback) {
        callback(undefined, 'super duper');
    }
};

describe('Image Mover', function () {
    it('Copies the image successfully', function () {
        let imageMover = new ImageMover('', 'bucket', new MockS3(false));
        imageMover.moveImage(MockEvent, (err, data) => {
            console.log(util.inspect(err, {depth: 5}));

            expect(err).to.equal(undefined);
            console.log(util.inspect(data, {depth: 5}));

            expect(data).to.deep.equal('yay');
        });
    });

    it('Deletes the original after copying', function () {
        let imageMover = new ImageMover('', 'bucket', new MockS3(true));
        imageMover.moveImage(MockEvent, (err, data) => {
            console.log(util.inspect(err, {depth: 5}));

            expect(err).to.equal(undefined);
            console.log(util.inspect(data, {depth: 5}));

            expect(data).to.deep.equal('super duper');
        });
    });
});
