'use strict';

const expect = require('chai').expect;
const ImageUploader = require('../lib/image-uploader');
const util = require('util');
const Ok = require('../lib/ok');

const goodPayload = {
    data: {
        metadata: {
            user_id: 'uuid',
            year: 'integer year',
            imageable_type: 'imageable_type',
            imageable_id: 'imageable_id',
            'cache-control': 'max-age=186400'
        },
        image: 'base64 encoded image'
    }
};

const badYearPayload = {
    data: {
        metadata: {user_id: 'uuid'},
        image: 'base64 encoded image'
    }
};

const MockFileBuilder = class MockFileBuilder {
    getFile() {
        return {
            Key: 'filename',
            Body: new Buffer([1, 2, 3, 4])
        };
    }
};

const MockFileWriter = class MockFileWriter {
    saveObject(imageFile, callback) {
        callback(undefined, new Ok('asdf'));
    }
};

const BadResponsePayload = {
    error: 'Bad Request. Required fields are missing.',
    example_body: {
        data: {
            metadata: {
                user_id: 'uuid',
                year: 'integer year',
                imageable_type: 'imageable_type',
                imageable_id: 'imageable_id'
            },
            image: 'base64 encoded image'
        }
    }
};

describe('ImageUploader', function () {
    it('Correctly parses the event', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(goodPayload);
            }
        };

        new ImageUploader().parseRequest(new eventFixture(), function (err, result) {
            expect(result).to.deep.include(goodPayload.data);
        });
    });

    it('Blows up on missing year', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify({data: badYearPayload});
            }
        };

        let callback = (err) => {
            expect(err).to.deep.equal({statusCode: 400, headers: {}, body: BadResponsePayload});
        };

        new ImageUploader('bucket').parseRequest(new eventFixture(), callback);
    });

    it('Actually uploads the file', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(goodPayload);
            }
        };
        let callback = (err, data) => {
            if (err) {
                console.log(util.inspect(err, {depth: 5}));
            }

            expect(err).to.equal(undefined);
            expect(data).to.deep.equal({statusCode: 200, body: JSON.stringify('asdf'), headers: {}}
            );
        };

        let imageUploader = new ImageUploader('bucket', new MockFileBuilder(), new MockFileWriter());

        imageUploader.perform(new eventFixture(), callback);
    });
});