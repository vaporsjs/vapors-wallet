'use strict';
var Wallet = require('../index.js');

// @TODO: Add testcases where format receives hexidecimal string

var BN = Wallet.utils.BN;

module.exports = function(test) {
    function checkFormat(wei, targetVapor, options) {
        var vapor = Wallet.formatVapor(wei, options);
        //console.log(wei, targetVapor, options, vapor);
        test.equal(vapor, targetVapor, 'Failed to match formatted vapor');
        vapor = vapor.replace(/,/g, '');
        test.ok(Wallet.parseVapor(vapor).eq(wei), 'Failed to convert back to wei');
    }

    function checkParse(vapor, targetWei) {
        //console.log(vapor, targetWei, Wallet.parseVapor(vapor));
        test.ok(targetWei.eq(Wallet.parseVapor(vapor)), 'Failed to match target wei');
    }

    checkParse('123.012345678901234567', new BN('123012345678901234567'));

    checkParse('1.0', new BN('1000000000000000000'));
    checkParse('1', new BN('1000000000000000000'));
    checkParse('1.00', new BN('1000000000000000000'));
    checkParse('01.0', new BN('1000000000000000000'));

    checkParse('-1.0', new BN('-1000000000000000000'));

    checkParse('0.1', new BN('100000000000000000'));
    checkParse('.1', new BN('100000000000000000'));
    checkParse('0.10', new BN('100000000000000000'));
    checkParse('.100', new BN('100000000000000000'));
    checkParse('00.100', new BN('100000000000000000'));

    checkParse('-0.1', new BN('-100000000000000000'));


    checkFormat(new BN('10000000000000000'), '0.01');
    checkFormat(new BN('1000000000000000000'), '1.0');
    checkFormat(new BN('1230000000000000000'), '1.23');
    checkFormat(new BN('-1230000000000000000'), '-1.23');

    checkFormat(new BN('1000000000000000000'), '1.000000000000000000', {pad: true});
    checkFormat(new BN('123000000000000000000'), '123.000000000000000000', {pad: true});
    checkFormat(new BN('1230000000000000000'), '1.230000000000000000', {pad: true});

    checkFormat(new BN('-1230000000000000000'), '-1.230000000000000000', {pad: true});

    checkFormat(new BN('1234567890000000000000000'), '1,234,567.89', {pad: false, commify: true});
    checkFormat(new BN('1234567890000000000000000'), '1,234,567.890000000000000000', {pad: true, commify: true});
    checkFormat(new BN('-1234567890000000000000000'), '-1,234,567.89', {pad: false, commify: true});


    test.done();
}

module.exports.testSelf = module.exports;

