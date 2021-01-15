'use strict';
var Wallet = require('../index.js');

var vaporyUtil = require('vaporyjs-util');
var iban = require('../node_modules/web3/lib/web3/iban.js');

var utils = require('./utils.js');

module.exports = function(test) {
    function testAddress(address) {
        var officialIban = (iban.fromAddress(address))._iban;

        var vaporsAddress = Wallet.getAddress(officialIban);
        var officialAddress = vaporyUtil.toChecksumAddress(address)

        var vaporsIban = Wallet.getIcapAddress(address);

        test.equal(vaporsAddress, officialAddress, 'wrong address');
        test.equal(vaporsIban, officialIban, 'wrong ICAP address');
    }

    test.expect(2 * (2 + 10000));

    testAddress('0x0000000000000000000000000000000000000000');
    testAddress('0xffffffffffffffffffffffffffffffffffffffff');
    for (var i = 0; i < 10000; i++) {
        testAddress(utils.randomHexString(20));
    }

    test.done();
};

module.exports.testSelf = module.exports;

