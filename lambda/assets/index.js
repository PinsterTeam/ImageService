'use strict';

const path = require('path');

// Helpers
const getPath = function (filename) {
    return path.join(__dirname, filename);
};


module.exports = {
    watermarkPng: getPath('pinster_watermark.png'),
    watermarkSvg: getPath('pinster_watermark.svg'),
    // dummy: getPath('dummy.jpeg'),
    path: getPath,
    expected: function (filename) {
        return getPath(path.join('expected', filename));
    },
};