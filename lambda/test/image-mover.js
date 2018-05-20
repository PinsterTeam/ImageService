'use strict';

const expect = require('chai').expect;
const util = require('util');
const path = require('path');

const ImageMover = require('../lib/image-mover');

const MockEvent = {
    Bucket: "pinster-image-service-dev",
    Key: "raw/926dc1235cb657e5c9d0e7dcfab84d78"
};

class MockS3 {
    constructor(callDeleteAfterCopy, newPrefix) {
        this.callDeleteAfterCopy = callDeleteAfterCopy;
        this.newPrefix = newPrefix;
    }

    copyObject(copyObjectParams, callback) {
        if (this.callDeleteAfterCopy) {
            expect(copyObjectParams).to.deep.equal({
                Bucket: 'bucket',
                CopySource: path.join(MockEvent.Bucket, MockEvent.Key),
                Key: path.join(this.newPrefix, path.basename(MockEvent.Key))
            });
            callback();
        } else {
            callback('error');
        }
    }

    deleteObject(s3Object, callback) {
        callback(undefined, 'super duper');
    }
}

describe('Image Mover', function () {
    it('Does not copy the image successfully', function () {
        let imageMover = new ImageMover('', 'bucket', new MockS3(false,''));
        imageMover.moveImage(MockEvent, (err, data) => {
            console.log(util.inspect(err, {depth: 5}));

            expect(err).to.equal('error');
            console.log(util.inspect(data, {depth: 5}));

            expect(data).to.deep.equal(undefined);
        });
    });

    it('Deletes the original after copying', function () {
        let imageMover = new ImageMover('', 'bucket', new MockS3(true,''));
        imageMover.moveImage(MockEvent, (err, data) => {
            console.log(util.inspect(err, {depth: 5}));

            expect(err).to.equal(undefined);
            console.log(util.inspect(data, {depth: 5}));

            expect(data).to.deep.equal('Delete Success!');
        });
    });
});
