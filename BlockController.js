const SHA256 = require('crypto-js/sha256');

const SimpleChain = require('./simpleChain.js');
const { Block, Blockchain } = SimpleChain;

const RequestManager = require('./requestManager.js');
const {Mempool} = RequestManager;


/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize
     * here all your endpoints
     * @param {*} server
     */
    constructor(server) {
        this.server = server;
        this.blocks = new Blockchain();
        this.mempool = new Mempool();
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
        this.requestValidation();
        this.validateRequestByWallet();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.server.route({
            method: 'GET',
            path: '/block/{index}',
            handler: async (request, h) => {
                // Get requested block
                let index = request.params.index;
                let response = JSON.stringify("Ooops") + '\n';
                try {
                    let block = await this.blocks.getBlock(index);
                    response = JSON.stringify(block, null, 2) + '\n';
                } catch (err) {
                    response = JSON.stringify(err) + '\n';
                } finally {
                    return response
                }
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.server.route({
            method: 'POST',
            path: '/block',
            handler: async (request, h) => {
                // Get posted data.
                let response = JSON.stringify("Ooops") + '\n';
                try {
                    // Expect `data` parameter
                    let data = request.payload.data;
                    // Check if there is data in the post
                    if (data == "") {
                        throw 'Empty POST data - No block added!';
                    }
                    // Get block height
                    let height = await this.blocks.getBlockHeight();
                    // Add new block
                    let newBlock = new Block(data);
                    let addedBlock = await this.blocks.addBlock(newBlock);
                    // Respond
                    response = JSON.stringify(addedBlock, null, 2) + '\n';
                } catch (err) {
                    response = JSON.stringify(err) + '\n';
                } finally {
                    return response
                }
            }
        });
    }

    // Request a validation
    requestValidation(walletAddress) {
        let self = this;
        this.server.route({
            method: 'POST',
            path: '/requestValidation',
            handler: async (request, h) => {
                let response = JSON.stringify("Ooops") + '\n';  // Scope!!
                // Get posted wallet address.
                try {
                    // Expect `address` parameter
                    let address = request.payload.address;
                    // Check if there is address in the post
                    if (address == "") {
                        throw 'Empty POST address - No block added!';
                    }
                    let requestObject = self.mempool.addRequestValidation(address);
                    // Respond
                    response = JSON.stringify(requestObject, null, 2) + '\n';
                } catch (err) {
                    console.log(err);
                    response = JSON.stringify(err) + '\n';
                } finally {
                    return response
                }
            }
        })
    }

    validateRequestByWallet() {
        let self = this;
        this.server.route({
            method: 'POST',
            path: '/validateRequestByWallet',
            handler: async (request, h) => {
                let response = JSON.stringify("Ooops") + '\n';  // Scope!!
                // Get posted wallet address.
                try {
                    // Expect `address` parameter
                    let address = request.payload.address;
                    let signature = request.payload.signature;
                    console.log(signature);
                    // Check if there is address in the post
                    if (address == "") {
                        throw 'Invalid/missing POST address - No block added!';
                    }
                    if (signature == "") {
                        throw 'Invalid/missing POST signature - No block added!';
                    }
                    let validRequest = self.mempool.validateRequestByWallet(address, signature);
                    // Respond
                    response = JSON.stringify(validRequest, null, 2) + '\n';
                } catch (err) {
                    console.log(err);
                    response = JSON.stringify(err) + '\n';
                } finally {
                    return response
                }
            }
        })

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
