'use strict';

var scrypt = require('scrypt-js');

var Contract = require('./lib/contract.js');
var providers = require('./lib/providers.js');
var secretStorage = require('./lib/secret-storage.js');
var Randomish = require('./lib/randomish.js');
var SigningKey = require('./lib/signing-key.js');
var Wallet = require('./lib/wallet.js');
var units = require('./lib/units.js');

var utils = require('./lib/utils.js');
var BN = utils.BN;


var exportUtils = {};
utils.defineProperty(Wallet, 'utils', exportUtils);

utils.defineProperty(exportUtils, 'BN', BN);
utils.defineProperty(exportUtils, 'Buffer', Buffer);

utils.defineProperty(exportUtils, 'sha3', utils.sha3);
utils.defineProperty(exportUtils, 'sha256', utils.sha256);

utils.defineProperty(exportUtils, 'getContractAddress', utils.getContractAddress);

module.exports = Wallet;


utils.defineProperty(Wallet, 'vaporSymbol', '\uD835\uDF63');

utils.defineProperty(Wallet, 'formatVapor', units.formatVapor);
utils.defineProperty(Wallet, 'parseVapor', units.parseVapor);

utils.defineProperty(Wallet, 'getAddress', utils.getAddress);
utils.defineProperty(Wallet, 'getIcapAddress', utils.getIcapAddress);

utils.defineProperty(Wallet, 'isCrowdsaleWallet', secretStorage.isCrowdsaleWallet);
utils.defineProperty(Wallet, 'isValidWallet', secretStorage.isValidWallet);

utils.defineProperty(Wallet, 'decryptCrowdsale', function(json, password) {
    return new Wallet(secretStorage.decryptCrowdsale(json, password));
});

utils.defineProperty(Wallet, 'decrypt', function(json, password, progressCallback) {
    if (progressCallback && typeof(progressCallback) !== 'function') {
        throw new Error('invalid callback');
    }

    return new Promise(function(resolve, reject) {
        secretStorage.decrypt(json, password, progressCallback).then(function(signingKey) {
            resolve(new Wallet(signingKey));
        }, function(error) {
            reject(error);
        });
    });
});

utils.defineProperty(Wallet.prototype, 'encrypt', function(password, options, progressCallback) {
    if (typeof(options) === 'function' && !progressCallback) {
        progressCallback = options;
        options = {};
    }
    if (progressCallback && typeof(progressCallback) !== 'function') {
        throw new Error('invalid callback');
    }

    return secretStorage.encrypt(this.privateKey, password, options, progressCallback);
});

utils.defineProperty(Wallet, 'summonBrainWallet', function(username, password, progressCallback) {
    if (progressCallback && typeof(progressCallback) !== 'function') {
        throw new Error('invalid callback');
    }

    return new Promise(function(resolve, reject) {
        scrypt(password, username, (1 << 18), 8, 1, 32, function(error, progress, key) {
            if (error) {
                reject(error);
            } else if (key) {
                resolve(new Wallet(new Buffer(key)));
            } else if (progressCallback) {
                progressCallback(progress);
            }
        });
    });
});


utils.defineProperty(Wallet, 'providers', providers);

utils.defineProperty(Wallet, 'Contract', Contract);
utils.defineProperty(Wallet, 'Interface', Contract.Interface);

utils.defineProperty(Wallet, 'randomish', new Randomish());

module.exports = Wallet;
