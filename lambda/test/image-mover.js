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
                Key: path.join(this.newPrefix, path.basename(MockEvent.Key)),
                MetadataDirective: 'COPY'
            });
            callback();
        } else {
            callback('error');
        }
    }

    deleteObject(s3Object, callback) {
        callback(undefined, 'super duper');
    }

    headObject(s3Object, callback) {
        callback(undefined, {
            Metadata: {
                user_id: 'uuid',
                year: 'integer year',
                imageable_type: 'imageable_type',
                imageable_id: 'imageable_id',
                base_file_name: "7f7af91e3a7e514a09b3ad0e364ba3ce"
            }
        });
    }
}

describe('Image Mover', function () {
    it('Does not copy the image successfully', function () {
        let imageMover = new ImageMover('', 'bucket', new MockS3(false, ''));
        imageMover.moveImage(MockEvent, (err, data) => {
            console.log(util.inspect(err, {depth: 5}));

            expect(err).to.equal('error');
            console.log(util.inspect(data, {depth: 5}));

            expect(data).to.deep.equal(undefined);
        });
    });

    it('Deletes the original after copying', function () {
        let imageMover = new ImageMover('', 'bucket', new MockS3(true, ''));
        imageMover.moveImage(MockEvent, (err, data) => {
            console.log(util.inspect(err, {depth: 5}));

            expect(err).to.equal(undefined);
            console.log(util.inspect(data, {depth: 5}));

            expect(data).to.deep.equal({
                data: {
                    imageable_id: 'imageable_id',
                    imageable_type: 'imageable_type',
                    base_file_name: '7f7af91e3a7e514a09b3ad0e364ba3ce',
                    storage_location_uri: 'undefined/7f7af91e3a7e514a09b3ad0e364ba3ce',
                    thumbnailable: true
                }
            });
        });
    });
});
