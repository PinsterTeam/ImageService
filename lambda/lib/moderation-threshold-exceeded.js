'use strict';

module.exports = class ModerationThresholdExceeded extends Error {
    constructor(message) {
        super(message);
        this.name = 'ModerationThresholdExceeded';
    }
};
