/* ===== SHA256 with Crypto-js ===================================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js      |
|  =============================================================*/
const SHA256 = require('crypto-js/sha256');

/* ===== Block Class ===================================
|  Class with a constructor for block data model       |
|  ====================================================*/
class Block {
  constructor(data) {
    // Block data model.
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

/* ===== Blockchain ===================================
|  Class with a constructor for blockchain data model  |
|  with functions to support:                          |
|     - createGenesisBlock()                           |
|     - getLatestBlock()                               |
|     - addBlock()                                     |
|     - getBlock()                                     |
|     - validateBlock()                                |
|     - validateChain()                                |
|  ====================================================*/
class Blockchain {

  constructor() {
    this.chain = [];
    this.addBlock((new Block("Genesis Block")))
  }


  addBlock(newBlock) {
    newBlock.height = this.chain.length
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    if (this.chain.length > 0) {
      newBlock.previousBlockHash = this.chain[this.chain.length - 1].hash;
    }
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
    this.chain.push(newBlock);
  }
}

// Example:
let blockchain = new Blockchain()
blockchain.addBlock(new Block('test data'))
blockchain.addBlock(new Block('test more data'))
blockchain
