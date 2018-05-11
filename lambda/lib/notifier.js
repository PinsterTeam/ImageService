'use strict';

const util = require('util');
// const request = require('request');

module.exports = class Notifier {
    constructor() {

    }

    notify(event, callback) {
        console.log(util.inspect(event, {depth: 5}));

        callback(null, 'success');
        // request.post('http://example.com')
        //     .on('response').promise()
        //     .then(response => {
        //         console.log("Response:\n", util.inspect(response, {depth: 5}));
        //         callback(null, JSON.parse(response))
        //     })
        //     .on('error').promise()
        //     .then(err => callback(err));
    }
};
