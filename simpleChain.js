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
    this.createGenesisBlock()
    // this.addBlock(new Block("Genesis Block"), true)
  }

  // Uniquely, and singularly, create the genesis block
  createGenesisBlock() {
    this.addBlock(new Block("Genesis Block"), true)
  }

  // Add new block
  addBlock(newBlock, genesis = false) {
    let self = this;
    let block = null;
    this.lock.acquire('key', function(done) {
      // Lock aquired
      async function addBlockAsync() {
        let height = await self.getBlockHeight();
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // New block height is incremented over current block height.
        let newBlockHeight = height + 1;
        newBlock.height = newBlockHeight;
        if (newBlock.height > 0) {
          // Get previous block
          let previousHeight = newBlock.height - 1
          let previousBlock = await self.getBlock(previousHeight)
          newBlock.previousBlockHash = previousBlock.hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        let addedBlock = null;
        // Add non-genesis blocks (esp. do not add with new class instance)
        if ((newBlock.height > 0 && !genesis) || (newBlock.height == 0 && genesis)) {
          try {
            // Add block and receive the block back via a .get(key)
            addedBlock = await self.chain.addLevelDBData(newBlock.height, newBlock)
          } catch (e) {
            console.log(e);
          } finally {
            done(); // Release lock
          }
        } else {
          //  We will not add a block (there may already be a geneis block). A
          //  null will be returned below for the block value, by default
          done(); // Release lock
        }
        // console.log(addedBlock);
        return [newBlockHeight, addedBlock];
      }
      addBlockAsync().then((value) => {
        // Validate the read-back (.get(key) in above comments) of the added
        // block. This is a good check that the write-read process is
        // repeatable
        let newBlockHeight = value[0];
        let newBlock = value[1];
        if (newBlock) {
          self.validateBlock(newBlockHeight)
          console.log('Added & Validated # ' + newBlockHeight);
        } else {
          // We are here when we avoid repeat adding of a geneis block at
          // construct time when one already exixts.
        }
      });
    })
  }

  // Get the last added block - pending current new block additions.
  getLatestBlock() {
    let self = this;
    let block = null;
    this.lock.acquire('key', function(done) {
      async function getLatestBlockAsync() {
        try {
          let height = await self.getBlockHeight();
          block = await self.getBlock(height);
        } catch (e) {
          console.log('Unable to get latest block: ' + e);
        } finally {
          done(); // Release lock
          return block;
        }
      }
      return getLatestBlockAsync();
    })
  }

  // Get block.
  getBlock(blockHeight) {
    let self = this
    async function getBlockAsysnc() {
      let block = null;
      try {
        block = await self.chain.getLevelDBData(blockHeight);
      } catch (e) {
        console.log('Unable to get block: ' + e);
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
        console.log('Unable to get block-height: ' + e);
      } finally {
        return count - 1; // Height is one less than number of blocks
      }
    }
    return getBlockHeightAsync();
  }

  // Validate a block
  validateBlock(blockHeight) {
    let self = this;
    async function validateBlockAsync() {
      // get block object
      let block = await self.getBlock(blockHeight);
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
    return validateBlockAsync();
  }

  // Validate blockchain
  validateChain() {
    let self = this;
    let errorLog = [];
    async function validateChainAysnc() {
      for (var i = 0; i < await self.getBlockHeight() - 1; i++) {
        // validate block
        let valid = await self.validateBlock(i);
        if (!valid) {
          errorLog.push(i);
        }
        let block = await self.getBlock(i);
        let next = await self.getBlock(i + 1);
        // compare block's hash link to previous block.
        let blockHash = block.hash;
        let previousHash = next.previousBlockHash;
        if (blockHash == previousHash) {} else {
          errorLog.push(i);
        }
      }
      if (errorLog.length > 0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: ' + errorLog);
      } else {
        console.log('Chain is validated');
      }
    }
    validateChainAysnc();
  }

}

// Export the class
module.exports.Blockchain = Blockchain;

async function Test() {
  let blockchain = new Blockchain()
  setTimeout(function () {
    // Someone comes along later (i.e., asynchronously) and checks the
    // blockchain.
    blockchain.validateChain()
  }, 2000);
  // Add a whole lot of blocks.
  blockchain.addBlock(new Block('Test data 01'))
  blockchain.addBlock(new Block('Test data 02'))
  blockchain.addBlock(new Block('Test data 03'))
  blockchain.addBlock(new Block('Test data 04'))
  blockchain.addBlock(new Block('Test data 05'))
  blockchain.addBlock(new Block('Test data 06'))
  blockchain.addBlock(new Block('Test data 07'))
  blockchain.addBlock(new Block('Test data 08'))
  blockchain.addBlock(new Block('Test data 09'))
  blockchain.addBlock(new Block('Test data 10'))
}
Test();
