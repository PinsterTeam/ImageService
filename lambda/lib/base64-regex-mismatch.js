'use strict';

module.exports = class Base64RegexMismatch extends Error {
    constructor(message) {
        super(message);
        this.name = 'Base64RegexMismatch';
    }
};
