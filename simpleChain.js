/* ===== SHA256 with Crypto-js ===================================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js      |
|  =============================================================*/
const SHA256 = require('crypto-js/sha256');

/* ====== Lock on asynchronous code =======
| https://www.npmjs.com/package/async-lock |
==========================================*/
const AsyncLock = require('async-lock');

//Importing levelSandbox class
const LevelSandboxClass = require('./levelSandbox.js');

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
    this.lock = new AsyncLock();
    // Creating the levelSandbox class object
    this.chain = new LevelSandboxClass.LevelSandbox();
    this.addBlock((new Block("Genesis Block")))
  }

  // Add new block
  addBlock(newBlock) {
    let self = this;
    this.lock.acquire('key', function(done) {
        // lock aquired
        // console.log('lock acquired');
        // Block height
        self.getBlockHeight()
          .then((height) => {
            // New block height is incremented over current block height.
            newBlock.height = height + 1;
            // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            // previous block hash
            if (newBlock.height > 0) {
              newBlock.previousBlockHash = self.chain.getLevelDBData(
                newBlock.height - 1
              ).hash;
            }
            // Block hash with SHA256 using newBlock and converting to a string
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            // Adding block object to chain
            self.chain.addLevelDBData(newBlock.height, newBlock)
              .then((value) => {
                console.log('Added block' + JSON.stringify(value));
                // Release lock
                done();
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          })
      })
      .then(() => {
        // lock released
        // console.log('lock released');
      }).catch((err) => {
        console.log('lock error ' + err);
      });
  }


  XaddBlock(newBlock) {
    // Block height
    this.getBlockHeight()
      .then((height) => {
        // New block height is incremented over current block height.
        newBlock.height = height + 1;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // previous block hash
        if (newBlock.height > 0) {
          newBlock.previousBlockHash = this.chain.getLevelDBData(
            newBlock.height - 1
          ).hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        // Adding block object to chain
        this.chain.addLevelDBData(newBlock.height, newBlock)
          .then(() => {
            console.log('Added block #' + newBlock.height);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      })

  }

  // Get block height for block count.
  getBlockHeight() {
    // because we are returning a promise we will need this to be able to
    // reference this outside 'this' *inside* the Promise constructor
    let self = this;

    return new Promise(function(resolve, reject) {
      self.chain.getBlocksCount()
        .then((count) => {
          resolve(count - 1)
        })
        .catch((err) => {
          reject(err);
        })
    });

  }

  // get block
  getBlock(blockHeight) {
    // return object as a single string
    return JSON.parse(JSON.stringify(this.chain.getLevelDBData(blockHeight)));
  }

  // validate block
  validateBlock(blockHeight) {
    // get block object
    let block = this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity. Remember, during addBlock,
    // the hash not yet set.
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash === validBlockHash) {
      return true;
    } else {
      console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
      return false;
    }
  }

  // Validate blockchain
  validateChain() {
    let errorLog = [];
    for (var i = 0; i < this.getBlockHeight() - 1; i++) {
      // validate block
      if (!this.validateBlock(i)) errorLog.push(i);
      // compare block's hash link to previous block.
      let blockHash = this.chain.getLevelDBData(i).hash;
      let previousHash = this.chain.getLevelDBData(i + 1).previousBlockHash;
      if (blockHash !== previousHash) {
        errorLog.push(i);
      }
    }
    if (errorLog.length > 0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: ' + errorLog);
    } else {
      console.log('No errors detected');
    }
  }

}


// Example:
let blockchain = new Blockchain()
blockchain.addBlock(new Block('test data'))
blockchain.addBlock(new Block('test data'))
blockchain.addBlock(new Block('test data'))
blockchain.addBlock(new Block('test data'))
blockchain.addBlock(new Block('test data'))
blockchain.addBlock(new Block('test data'))
blockchain.addBlock(new Block('test data'))
// blockchain.addBlock(new Block('test data'))
// blockchain.xBlock()


// blockchain.addBlock(new Block('test data'))
// blockchain.addBlock(new Block('test more data'))
// blockchain
