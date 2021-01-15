'use strict';

console.log('Running test cases... (this can take a long time, please be patient)');


// Test converting private keys to addresses
module.exports.testPrivateKeyToAddress = require('./test-privatekey.js');

// Test checksum addresses
module.exports.testChecksumAddress = require('./test-checksum-address.js');

// Test ICAP addresses
module.exports.testIcapAddress = require('./test-icap-address.js');


// Test vapor strng formatting and parsing
module.exports.testVaporFormat = require('./test-vapor-format.js');


// Test transactions
module.exports.testTrasactions = require('./test-transactions.js');


// Test Solidity encoding/decoding parameters
module.exports.testSolidityCoder = require('./test-solidity-coder.js');

// Test the contract meta-class
module.exports.testContracts = require('./test-contracts.js');


// Test the secret storage JSON wallet encryption/decryption
module.exports.testSecretStorage = require('./test-secret-storage.js');

// Test brain wallet generation
module.exports.testBrainWallet = require('./test-brain-wallet.js');


// Test contract address helper
module.exports.testContractAddress = require('./test-contract-address.js');


// Test the providers API (we still need to add a lot ore test cases here)
module.exports.testProviders = require('./test-providers.js');

