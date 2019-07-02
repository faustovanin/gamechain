# Gamechain

A Blockchain simulation in NodeJS.

## How it works

It has basically two modules: one with a Sudoku Proof-of-Work and another with the Blockchain itself.

It uses [Web3](https://github.com/ethereum/web3.js/) from Ethereum only to create hashes.

The Blockchain lib (blockchain.js) also has a built-in Proof-of-Work. It's a simple list of Fruits, in which you should pass a fruit from the list for your PoW to be valid.

## How to install

``npm install``

## How to test

There are two test files. One is called ``app-fruits.js`` and another called ``app.js``. They are basically the same, but ``app-fruits.js`` as you can imagine, uses the Fruit Proof-of-Work instead of Sudoku PoW.


## Keep in contact

If you liked it or has something to add, feel free to reach us at [OnePercent](http://onepercent.io) or directly here on Github :-)