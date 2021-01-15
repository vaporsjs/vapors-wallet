'use strict';
var Wallet = require('../index.js');

var vaporyUtil = require('vaporyjs-util');

var utils = require('./utils.js');


module.exports = function(test) {
    function testAddress(address) {
        var official = vaporyUtil.toChecksumAddress(address);
        var vapors = Wallet.getAddress(address);
        test.equal(vapors, official, 'wrong address');
    }

    test.expect(2 + 10000);

    testAddress('0x0000000000000000000000000000000000000000');
    testAddress('0xffffffffffffffffffffffffffffffffffffffff');
    for (var i = 0; i < 10000; i++) {
        testAddress(utils.randomHexString(20));
    }
    test.done();
};

module.exports.testSelf = module.exports;

