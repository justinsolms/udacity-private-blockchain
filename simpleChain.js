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
    // Lcok to exclude simultaneous access to addBlock core.
    this.lock = new AsyncLock();
    // Creating the levelSandbox class object
    this.chain = new LevelSandboxClass.LevelSandbox();
    this.addBlock(new Block("Genesis Block"), true)
  }

  // Add new block
  addBlock(newBlock, genesis = false) {
    let self = this;
    this.lock.acquire('key', function(done) {
      // lock aquired
      async function addBlockAsync() {
        let height = await self.getBlockHeight();
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // New block height is incremented over current block height.
        newBlock.height = height + 1;
        if (newBlock.height > 0) {
          // Get previous block
          let previousHeight = newBlock.height - 1
          let previousBlock = await self.getBlock(previousHeight)
          newBlock.previousBlockHash = previousBlock.hash;
          // Block hash with SHA256 using newBlock and converting to a string
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        }
        // Add non-genesis blocks (esp. do not add with new class instance)
        if ((newBlock.height > 0 && !genesis) || (newBlock.height == 0 && genesis)) {
          try {
            let addedBlock = await self.chain.addLevelDBData(newBlock.height, newBlock)
            console.log('Added # '+ addedBlock.height);
            console.log(addedBlock);
          } catch (e) {
            console.log(e);
          } finally {
            // Release lock
            done();
            }
        } else {
          // Release lock
          done();
        }
      }
      addBlockAsync();
    })
  }

  // Add key-block pair

  // Get block.
  getBlock(blockHeight) {
    let self = this
    async function getBlockAsysnc() {
      let block = null;
      try {
        block = await self.chain.getLevelDBData(blockHeight);
      } catch (e) {
        console.log('Could not get block: ' + e);
      } finally {
        return block;
      }
    }
    return getBlockAsysnc();
    // (async () => { console.log(await getBlockAsysnc()); })()
  }

  // Get block height for block count.
  getBlockHeight() {
    // because we are returning a promise we will need this to be able to
    // reference this outside 'this' *inside* the Promise constructor
    let self = this;
    let count = null
    async function getBlockHeightAsync() {
      try {
        count = await self.chain.getBlocksCount();
      } catch (e) {
        console.log('Could not get block-height: ' + e);
      } finally {
        return count - 1;  // Height is one less than number of blocks
      }
    }
    return getBlockHeightAsync();
  }

  // validate block
  validateBlock(blockHeight) {
    async function validateBlock() {
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
// blockchain.getBlock(2)
blockchain.addBlock(new Block('test data'))
// blockchain.addBlock(new Block('test data'))
// blockchain.addBlock(new Block('test data'))
// blockchain.addBlock(new Block('test data'))
// blockchain.addBlock(new Block('test data'))
// blockchain.addBlock(new Block('test data'))
// blockchain.addBlock(new Block('test data'))
// blockchain.addBlock(new Block('test data'))
// blockchain.xBlock()


// blockchain.addBlock(new Block('test data'))
// blockchain.addBlock(new Block('test more data'))
// blockchain
