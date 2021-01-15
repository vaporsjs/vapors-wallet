'use strict';
var Wallet = require('../index.js');

var vaporyUtil = require('vaporyjs-util');

var utils = require('./utils.js');

module.exports = function(test) {
    for (var i = 0; i < 10000; i++) {
        var privateKey = utils.randomBuffer(32);
        var vaporyLib = '0x' + vaporyUtil.privateToAddress(privateKey).toString('hex');
        var vapors = (new Wallet(privateKey)).address;
        test.equal(vapors, vaporyUtil.toChecksumAddress(vaporyLib), 'wrong address');
    }
    test.done();
}

module.exports.testSelf = module.exports;

