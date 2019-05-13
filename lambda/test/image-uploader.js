'use strict';

const expect = require('chai').expect;
const ImageUploader = require('../lib/image-uploader');
const util = require('util');
const Ok = require('../lib/ok');

const GoodPayload = {
    data: {
        image: 'base64 encoded image'
    }
};

const GoodVerbosePayload = {
    data: {
        image: 'base64 encoded image',
        name: 'Awesome image',
        description: 'This image was taken by bobbert',
        featured: 1557762123
    }
};


const BadVerbosePayload = {
    data: {
        image: 'base64 encoded image',
        name: '#*&DF**&![}\\234',
        description: 'This image was taken by bobbert who really likes to type a whole lot of things and is too verbose. No like really bobbert totally talks too much and needs to stop because reasons.',
        featured: '231'
    }
};

const BadPayload = {
    data: {}
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
    saveObject() {
        return new Ok('asdf');
    }
};

const badResponsePayload = {
    error: 'Bad Request. Required fields are missing.',
    example_body: {
        data: {
            image: 'base64 encoded image',
            name: 'Optional name of image',
            description: 'Optional description',
            featured: 'Optional unix epoch integer in ms'
        }
    }
};


const MockTokenProvider = class MockTokenProvider {
    async authorize() {
        return {
            user_id: 'uuid',
            imageable_type: 'imageable_type',
            imageable_id: 'imageable_id'
        };
    }
};

describe('ImageUploader', function () {
    it('Correctly parses the event', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(GoodPayload);
            }
        };
        return new ImageUploader({tokenProvider: new MockTokenProvider()})
            .parseRequest(new eventFixture())
            .then(result => {
                expect(result).to.deep.include(GoodPayload.data);
            }).catch(error => expect(error).to.equal(undefined));
    });

    it('Correctly parses the data', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(GoodVerbosePayload);
            }
        };

        const expected = {
            metadata: {
                user_id: 'uuid',
                imageable_type: 'imageable_type',
                imageable_id: 'imageable_id',
                name: GoodVerbosePayload.data.name,
                description: GoodVerbosePayload.data.description,
                featured: GoodVerbosePayload.data.featured
            },
            image: GoodVerbosePayload.data.image,
            bucket: 'bucket'
        };
        return new ImageUploader({tokenProvider: new MockTokenProvider(), bucketName: 'bucket'})
            .parseRequest(new eventFixture())
            .then(result => {
                expect(result).to.deep.equal(expected);
            });
    });

    it('Blows up on missing imageable', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify({data: BadPayload});
            }
        };


        return new ImageUploader({tokenProvider: new MockTokenProvider(), bucket: 'bucket'})
            .parseRequest(new eventFixture())
            .catch((err) => {
                expect(err).to.deep.equal({
                    statusCode: 400, headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': true,

                    }, body: badResponsePayload
                });
            });
    });

    it('Actually uploads the file', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(GoodPayload);
            }
        };
        const callback = (err, data) => {
            if (err) {
                console.error(util.inspect(err, {depth: 5}));
            }

            expect(err).to.equal(undefined);
            expect(data).to.deep.equal({
                    statusCode: 200, body: JSON.stringify('asdf'), headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': true,
                    }
                }
            );
        };

        const imageUploader = new ImageUploader({
            tokenProvider: new MockTokenProvider(),
            bucket: 'bucket',
            fileBuilder: new MockFileBuilder(),
            fileWriter: new MockFileWriter()
        });

        return imageUploader.perform(new eventFixture(), callback);
    });


    it('Correctly barfs on bad data', function () {
        let eventFixture = class {
            constructor() {
                this.body = JSON.stringify(BadVerbosePayload);
            }
        };

        const callback = (err, data) => {
            if (err) {
                console.error(util.inspect(err, {depth: 5}));
            }

            expect(err).to.deep.equal({
                    statusCode: 400, body: JSON.stringify('asdf'), headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': true,
                    }
                }
            );
            expect(data).to.equal(undefined);
        };

        const imageUploader = new ImageUploader({
            tokenProvider: new MockTokenProvider(),
            bucket: 'bucket',
            fileBuilder: new MockFileBuilder(),
            fileWriter: new MockFileWriter()
        });


        return imageUploader.perform(new eventFixture(), callback);
    });

});


