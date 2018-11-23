const SHA256 = require('crypto-js/sha256');
const SimpleChain = require('./simpleChain.js');
const {
    Block,
    Blockchain
} = SimpleChain;
/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} server
     */
    constructor(server) {
        this.server = server;
        this.blocks = new Blockchain();
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.server.route({
            method: 'GET',
            path: '/api/block/{index}',
            handler: async (request, h) => {
                // Get requested block
                let index = request.params.index;
                let block = await this.blocks.getBlock(index);
                // Respond
                return (JSON.stringify(block, null, 2) + '\n');
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.server.route({
            method: 'POST',
            path: '/api/block',
            handler: async (request, h) => {
                // Get posted data.
                let data = request.query.data;
                // Get block height
                let height = await this.blocks.getBlockHeight();
                // Add new block
                let newBlock = new Block(data);
                let addedBlock = await this.blocks.addBlock(newBlock);
                // Respond
                return (JSON.stringify(addedBlock, null, 2) + '\n');
            }
        });
    }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    initializeMockData() {
        let self = this;
        async function theLoop(myBlockChain) {
            let genesisBlock = await myBlockChain.createGenesisBlock();
            // console.log(genesisBlock);
            // Get height so we can label our block-test data properly; with the height.
            let height = await myBlockChain.getBlockHeight();
            // Start loop at height plus 1.
            for (let i = (height + 1); i <= (height + 5); i++) {
                let blockTest = new Block("Test Block - " + i);
                let addedBlock = await myBlockChain.addBlock(blockTest);
                // console.log(addedBlock);
            }
            return true;
        }
        theLoop(this.blocks)
            // Do it one more time just to be sure.
            .then(() => this.blocks.validateChain())
            .catch(err => console.log(err))

    }

}

/**
 * Exporting the BlockController class
 * @param {*} server
 */
module.exports = (server) => {
    return new BlockController(server);
}
