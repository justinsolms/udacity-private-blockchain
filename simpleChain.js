/* ===== SHA256 with Crypto-js ===================================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js      |
|  =============================================================*/
const SHA256 = require('crypto-js/sha256');

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
|     - getBlockByHeight()                                     |
|     - validateBlock()                                |
|     - validateChain()                                |
|  ====================================================*/
class Blockchain {

    constructor() {
        // Creating the levelSandbox class object
        this.chain = new LevelSandboxClass.LevelSandbox();
    }

    // Create the genesis block and return a promice with the genesis block
    createGenesisBlock() {
        let name = "First block in the chain - Genesis block"
        return this.addBlock(new Block(name), true);
    }

    // Add new block
    addBlock(newBlock, genesis = false) {
        let self = this;
        // Use aync block for neater code
        async function addBlockAsync() {
            let addedBlock = null; // Restrict scope
            try {
                // New block height is incremented over current block height.
                newBlock.height = await self.chain.getBlocksCount();
                // UTC timestamp
                newBlock.time = new Date().getTime().toString().slice(0, -3);
                // Add previous Block hash if not a genesis block.
                if (newBlock.height > 0) {
                    // Get previous block
                    let previousHeight = newBlock.height - 1
                    let previousBlock = await self.getBlockByHeight(previousHeight)
                    newBlock.previousBlockHash = previousBlock.hash;
                }
                // Block hash with SHA256 using newBlock and converting to a string.
                // Remember that this hash is calculated without itself, so remove
                // it when validating a block.
                let hash = SHA256(JSON.stringify(newBlock)).toString();
                // console.log('\nxxx:' + JSON.stringify(newBlock) + ' -- ' + hash + '\n');
                newBlock.hash = hash
                // Add block
                if ((newBlock.height > 0 && !genesis) || (newBlock.height == 0 && genesis)) {
                    // We come here when there is:
                    //    1. Fresh LevelDB at constructor time to create
                    //       Genesis Block.
                    //    2. Routine block added.
                    // Add block and read the block back via a .get(key) op for later
                    // validation.
                    addedBlock = await self.chain.addLevelDBData(newBlock.height, newBlock)
                } else {
                    //  We will not add a block (there may already be a geneis block). A
                    //  null will be returned below for the block value, by default,
                    //  usefull below in validation enclosing `if` statement.
                    // Do not increment this.height
                }
            } catch (err) {
                throw err;
            }
            return addedBlock;

        };
        // Run asynchronous above then validate block returning promise with new
        // block
        return addBlockAsync().then(value => {
            // Them the Promise to Validate the read-back block (see .get(key) in
            // above comments) of the added block. This is a good check that the
            // write-read process is correct and repeatable.
            let newBlock = value;
            if (newBlock) {
                self.validateBlock(newBlock.height)
                    .then((valid) => {
                        if (valid && newBlock.height == 0) {
                            console.log('Added & Validated Genesis Block');
                        } else if (valid) {
                            console.log('Added & Validated # ' + newBlock.height);
                        }
                    })
            } else {
                // We are here when we avoid repeat adding of a genesis
                // block at construct time when one already exists.
            }
            return newBlock;
        });
    }

    // Get the last added block - pending current new block additions.
    getLatestBlock() {
        let self = this
        async function getBlockAsysnc() {
            let block = null;
            try {
                let height = await self.getBlockHeight();
                block = await self.getBlockByHeight(height + 1);
                return block;
            } catch (err) {
                throw 'getLatestBlock Error: err=' + err;
            }
        }
        // Return a Promise from which the Block could be thenned.
        return getBlockAsysnc();
    }

    // Get block by block Height
    getBlockByHeight(blockHeight) {
        let self = this
        async function getBlockAsysnc() {
            let block = null;
            try {
                block = await self.chain.getLevelDBData(blockHeight);
                return block;
            } catch (err) {
                throw 'getBlockByHeight Error: err=' + err;
            }
        }
        // Return a Promise from which the Block could be thenned.
        return getBlockAsysnc();
    }

    // TODO: Get block by block Hash
    getBlockByHash(blockHash) {
        let self = this
        async function getBlockAsysnc() {
            let block = null;
            try {
                block = await self.chain.getBlockByHash(blockHash);
                return block;
            } catch (err) {
                throw 'getBlockByHash Error: err=' + err;
            }
        }
        // Return a Promise from which the Block could be thenned.
        return getBlockAsysnc();
    }

    // TODO: Get block by wallet Address
    getBlockByAddress(walletAddress) {
        let self = this
        async function getBlockAsysnc() {
            let block = null;
            try {
                block = await self.chain.getBlockByAddress(walletAddress);
                return block;
            } catch (err) {
                throw 'getBlockByAddress Error: err=' + err;
            }
        }
        // Return a Promise from which the Block could be thenned.
        return getBlockAsysnc();
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
            } catch (err) {
                console.log('getBlockHeight Error: err=' + err);
            } finally {
                return count - 1; // Height is one less than number of blocks
            }
        }
        // Return a Promise from which the Block height could be thenned.
        return getBlockHeightAsync();
    }

    // Validate a block
    validateBlock(blockHeight) {
        let self = this;
        async function validateBlockAsync() {
            // get block object
            let block = await self.getBlockByHeight(blockHeight);
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
        // Return a Promise from which the Block validity truth could be thenned.
        return validateBlockAsync();
    }

    // Validate blockchain
    validateChain() {
        let self = this;
        let errorLog = [];
        async function validateChainAysnc() {
            let height = await self.getBlockHeight()
            for (var i = 0; i < height; i++) {
                // validate block
                let valid = await self.validateBlock(i);
                if (!valid) {
                    errorLog.push(i);
                }
                let block = await self.getBlockByHeight(i);
                let next = await self.getBlockByHeight(i + 1);
                // compare block's hash link to previous block.
                let blockHash = block.hash;
                let previousHash = next.previousBlockHash;
                if (blockHash == previousHash) {
                    // Proof that entire chain is validated.
                    console.log(i + ' =hash= ' + (i+1));
                } else {
                    errorLog.push(i);
                }
            }
            if (errorLog.length > 0) {
                console.log('Block errors = ' + errorLog.length);
                console.log('Blocks: ' + errorLog);
                return false;
            } else {
                console.log('Chain is validated');
                return true;
            }
        }
        return validateChainAysnc();
    }

}

// Export the classes
module.exports = {
    Block,
    Blockchain
};

// Test loop - use async to make it look conventional.
async function theLoop(myBlockChain) {
    genesisBlock = await myBlockChain.createGenesisBlock();
    // console.log(genesisBlock);
    // Get height so we can label our block-test data properly; with the height.
    let height = await myBlockChain.getBlockHeight();
    // Start loop at height plus 1.
    for (i = (height + 1); i <= (height + 5); i++) {
        let blockTest = new Block("Test Block - " + i);
        addedBlock = await myBlockChain.addBlock(blockTest);
        // console.log(addedBlock);
    }
    return true;
}

// ============================ TEST ==========================
// let myBlockChain = new Blockchain()
// theLoop(myBlockChain)
//     // Do it one more time just to be sure.
//     .then(() => {
//         myBlockChain.validateChain();
//     })
//     .catch(err => console.log(err))
//     // We should have no unhandled promises now.
