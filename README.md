vapors-wallet
=============

[![npm version](https://badge.fury.io/js/vapors-wallet.svg)](https://badge.fury.io/js/vapors-wallet)

Complete Vapory wallet implementation and utilities in JavaScript.

**Features:**

- Keep your private keys in your browser
- Import and export JSON wallets (Gvap and crowdsale) and brain wallets
- Meta-classes create JavaScript objects from any contract ABI
- Connect to Vapory nodes over RPC, injected Web3 or [Vaporscan](https://vaporscan.io)
- Small (~100kb compressed; 290kb uncompressed)
- MIT licensed (with one exception, which we are migrating off of; see below)

**NOTE: This is still very beta; please only use it on the testnet for now, or with VERY small amounts of vapor on the livenet that you are willing to lose due to bugs.**


Installing
----------

To use in a browser:

```html
<script type="text/javascript" src="https://rawgit.com/vaporsjs/vapors-wallet/master/dist/vapors-wallet.min.js"></script>
```

To use in [node.js](https://nodejs.org/):

```
npm install vapors-wallet
```


API
---


### Wallet API

An *Vapory* wallet wraps a cryptographic private key, which is used to sign transactions and control the vapor located at the wallet's address. These transactions can then be broadcast to the *Vapory* network.

```javascript
// A private key can be specified as a 32 byte buffer or hexidecimal string
var privateKey = new Wallet.utils.Buffer([
    0x31, 0x41, 0x59, 0x26, 0x53, 0x58, 0x97, 0x93, 
    0x23, 0x84, 0x62, 0x64, 0x33, 0x83, 0x27, 0x95,
    0x02, 0x88, 0x41, 0x97, 0x16, 0x93, 0x99, 0x37,
    0x51, 0x05, 0x82, 0x09, 0x74, 0x94, 0x45, 0x92
])

// or equivalently:
var privateKey = '0x3141592653589793238462643383279502884197169399375105820974944592'

// Create a wallet object
var wallet = new Wallet(privateKey)

// Wallet privateKey
console.log(wallet.privateKey)
/// "0x3141592653589793238462643383279502884197169399375105820974944592"

// Wallet address
console.log(wallet.address)
/// "0x7357589f8e367c2C31F51242fB77B350A11830F3"

// Sign transactions
wallet.sign({
    to: "0x06B5955A67D827CDF91823E3bB8F069e6c89c1D6",
    gasLimit: 3000000,
    gasPrice: "0x1000",
    value: "0x1000"
})
```


### Converting addresses

Addresses come in various forms, and it is often useful to convert between them. You can pass any valid address into any function, and the library will convert it internally as needed. The address types are:
- **hexidecimal** - 0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef (all letters must be either lower case or uppercase; no mixed case, as this implies a checksum address)
- **ICAP** - XE49Q0EPSW7XTS5PRIE9226HRPOO69XRVU7 (uses the International Bank Account Number format)
- **checksum** - 0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF (notice the case is adjusted encoding checkum information)

```javascript
// ICAP Addresses 
Wallet.getIcapAddress(wallet.address)
/// "XE39DH16QOXYG5JY9BYY6JGZW8ORUPBX71V"

// Get checksummed address (from ICAP)
Wallet.getAddress("XE39DH16QOXYG5JY9BYY6JGZW8ORUPBX71V")
/// "0x7357589f8e367c2C31F51242fB77B350A11830F3"

// Get checksummed addresses (from unchecksumed)
Wallet.getAddress("0x7357589f8e367c2c31f51242fb77b350a11830f3")
/// "0x7357589f8e367c2C31F51242fB77B350A11830F3"

// Detect address checksum errors (notice the last "f" should be lowercase)
Wallet.getAddress('0x7357589f8e367c2c31f51242fb77b350a11830F3')
/// throws Error: invalid checksum address
```


### Crowdsale JSON Wallets

During the crowdsale, the Vapory Project sold vapor by generating *crowdsale JSON wallet*. These functions allow you to decrypt those files and retreive the private key.

```javascript

// See the test-wallets directory samples (the variable should be a string)
var json = "... see the test-wallets directory for samples ..."; 

// Detect crowdsale JSON wallets
Wallet.isCrowdsaleWallet(json)

// Get a wallet from a crowdsale JSON wallet
var wallet = Wallet.decryptCrowdsaleWallet(json, password);
console.log(wallet.address)
console.log(wallet.privateKey)
```


### Secret Storage JSON Wallet

This API allows you to decrypt and encrypt the [Secret Storage](https://github.com/vaporyco/wiki/wiki/Web3-Secret-Storage-Definition) format used by *Gvap* and many other wallet platforms (such as *vapors.io*).

The Secret Storage JSON Wallet format uses an algorithm called *scrypt*, which is intentionally CPU-intensive, which ensures that an attacker would need to tie up considerable resources to attempt to brute-force guess your password. It aslo means it may take some time (10-30 seconds) to decrypt or encrypt a wallet. So, these API calls use a callback to provide progress feedback as well as the opportunity to cancel the process.

The callback should look like `function(progress)` where progress is a Number between 0 and 1 (inclusive) and if the function returns `true`, then the process will be cancelled, calling the callback once more with `callback(new Error('cancelled'))`.

#### Wallet.decrypt(json, password[, callback]);

```javascript

// See the test-wallets directory samples (the variable should be a string)
var json = "... see the test-wallets directory for samples ..."; 

// Decrypt a Secret Storage JSON wallet
var shouldCancelDecrypt = false;

function updateInterface(progress) {
    console.log('The wallet is ' + parseInt(100 * progress) + '% decrypted');

    // Optionally return true to stop this decryption; this callback will get
    // called once more with callback(new Error("cancelled"))
    return shouldCancelDecrypt;
}

Wallet.decrypt(json, password, updateInterface).then(function(wallet) {
    // The wallet was successfully decrypted

}, function(error) {
    if (error.message === 'invalid password') {
        // Wrong password

    } else if (error.message === 'cancelled') {
        // The decryption was cancelled
    }
});
```

#### Wallet.prototype.encrypt(password[, options][, callback]);

```javascript

// Encrypt a wallet into a Secret Storage JSON Wallet (all options are optional)
var bytes16 = '0xdeadbeef1deadbeef2deadbeef301234';
var options = {
    salt: bytes16,        // hex string or Buffer, any length
    iv:   bytes16,        // hex string or Buffer, 16 bytes
    uuid: bytes16,        // hex string or Buffer, 16 bytes
    scrypt: {
        N: (1 << 17),     // Number, power of 2 greater than 2
        p: 8,             // Number
        r: 1              // Number
    }
}

var wallet = new Wallet(privateKey);

var shouldCancelEncrypt = false;

function updateInterface(progress) {
    console.log('The wallet is ' + parseInt(100 * progress) + '% encrypted');

    // Optionally return true to stop this encryption; this callback will get
    // called once more with callback(new Error("cancelled"))
    return shouldCancelEncrypt;
}

wallet.encrypt(password, options, updateInterface).then(function(json) {
    // The wallet was successfully encrypted as a json string

}, function(error) {
    if (error.message === 'cancelled') {
        // Cancelled
    }
});
```


### Brain Wallets

Brain wallets should not be considered a secure way to store large amounts of vapor; anyone who knows your username/password can steal your funds.

```javascript

// Username and passwords must be buffers; see scrypt-js library for summary
// of UTF-8 gotchas (@TOOD: include a link)
var email = new Wallet.utils.Buffer('github@ricmoo.com', 'utf8');
var password = new Wallet.utils.Buffer('password', 'utf8');

var shouldCancelSummon = false;

function updateInterface(progress) {
    console.log('The wallet is ' + parseInt(100 * progress) + '% generated');

    // Optionally return true to stop this generation; this callback will get
    // called once more with callback(new Error("cancelled"))
    return shouldCancelSummon;
}

Wallet.summonBrainWallet(email, password, updateInterface).then(function(wallet) {
    // The wallet was successfully generated

}, function(error) {
    if (error.message === 'cancelled') {
        // Cancelled
    }
});
```


Provider API
------------

Connect to standard *Vapory* nodes via RPC (if you have a local [parity](https://ethcore.io/parity.html) or [gvap](https://github.com/vaporyco/go-vapory/wiki/Gvap) instance running), or via [Vaporscan](https://vaporscan.io):

```javascript

// The Web3 library is NOT required, but if you have one (for example from Metamask)
var web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
var web3 = new Web3(web3Provider);

// All these are equivalent
var wallet = new Wallet(privateKey, 'http://localhost:8545');
var wallet = new Wallet(privateKey, web3Provider);
var wallet = new Wallet(privateKey, web3);

// Or use Vaporscan:
var wallet = new Wallet(privateKey, new Wallet.providers.VaporscanProvider({testnet: true}));


// With a provider attached, you can call additional methods on the wallet

// Get the wallet's balance
wallet.getBalance().then(function(balance) {
    console.log(balance);
});

// Get the current nonce for this wallet
wallet.getTransactionCount().then(function(transactionCount) {
    console.log(transactionCount);
})

// Send vapor to another account or contract
wallet.send(targetAddress, Wallet.parseVapor('1.0')).then(function(txid) {
    console.log(txid);
})
```

Contract API
------------

```javascript

var privateKey = '0x3141592653589793238462643383279502884197169399375105820974944592';

// Create your wallet with any method from the above Provider API
var wallet = new Wallet(privateKey, 'http://localhost:8545')

console.log(wallet.address);
/// "0x7357589f8e367c2C31F51242fB77B350A11830F3"

// Find an existing contract address and ABI
// See: https://gist.github.com/ricmoo/e78709e075ff8082a86c875ac062c3c3
var simpleStorageAddress = '0xdfaf84077cF4bCECA4F79d167F47041Ed3006D5b'
var simpleStorageAbi = [
    {
        "constant":true,
        "inputs":[],
        "name":"getValue",
        "outputs":[{"name":"","type":"string"}],
        "type":"function"
    }, {
        "constant":false,
        "inputs":[{"name":"value","type":"string"}],
        "name":"setValue",
        "outputs":[],
        "type":"function"
    }, {
        "anonymous":false,
        "inputs":[
            {"indexed":false,"name":"oldValue","type":"string"},
            {"indexed":false,"name":"newValue","type":"string"}
        ],
        "name":"valueChanged",
        "type":"event"
    }
];

// Get the contract
var contract = wallet.getContract(simpleStorageAddress, simpleStorageAbi)

// Set up events
contract.onvaluechanged = function(oldValue, newValue) {
    console.log('Value Changed from "' + oldValue + '" to "' + newValue + '".')
}

// Call constant methods, which don't alter state (free).
// Returns a promise.
contract.getValue().then(function(value) {
    console.log('Value is "' + value + '".')
})

// Call state-changing methods (which will cost you vapor, so use testnet to test!)
// Returns a promise.
contract.setValue("Hello World").then(function(txid) {
    console.log('txid: ' + txid);
});

// Include custom parameters with a state-changing call
var options = {
    gasPrice: 1000       // in wei (default: from network)
    gasLimit: 3000000,   // is gas (default: 3000000)
    value:    1000       // in wei (default: 0)
}
contract.setValue("Hello World", options).then(function(txid) {
    console.log('txid: ' + txid);
});

// Estimate the gas cost of calling a state-changing method (returns a BN.js)
contract.estimate.setValue("Hello World").then(function(gasCost) {
    console.log(gasCost.toString(10));
});
```


Testing
-------

A lot of the test cases are performed by comparing against known working implementations of many of the features of this library. To run the test suite, you must use `npm install` (without the `--production` flag, which would skip the development dependencies.)

To run the test suite, 

```
/Users/vapors> npm test

> vapors-wallet@0.0.9 test /Users/vapors/vapors-wallet
> nodeunit test.js

Running test cases... (this can take a long time, please be patient)

index.js
+ testPrivateKeyToAddress
+ testChecksumAddress
+ testIcapAddress
+ testVaporFormat
+ testTrasactions
+ testSolidityCoder
+ testContracts
+ testSecretStorage
+ testBrainWallet
+ testContractAddress
+ testProviders

OK: 52178 assertions (147788ms)
```

There are also some test JSON wallets available in the [test-wallets](https://github.com/vapors-io/vapors-wallet/tree/master/test-wallets) directory.


License
-------

MIT Licensed, with the exceptions:
- RLP (MPL-2.0)

We are working on our own implementations and will have the library 100% MIT in the near future.

Stay tuned! 
