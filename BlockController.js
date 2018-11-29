const SHA256 = require('crypto-js/sha256');

const hex2ascii = require('hex2ascii');

const SimpleChain = require('./simpleChain.js');
const { Block, Blockchain } = SimpleChain;

const RequestManager = require('./requestManager.js');
const {Mempool} = RequestManager;

const mockStarData = require('./mockStarData.js');

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
        mockStarData.initializeMockData(this);
        this.getBlockByHeight();
        this.getBlockByHash();
        this.getBlockByAddress();
        this.postNewBlock();
        this.requestValidation();
        this.validateRequestByWallet();
        this.addBlock();
    }

    // Get block by block Height
    // TODO: Decode story
    getBlockByHeight() {
        this.server.route({
            method: 'GET',
            path: '/height/{height}',
            handler: async (request, h) => {
                // Get requested block
                let height = request.params.height;
                let response = JSON.stringify("Ooops") + '\n';
                try {
                    let block = await this.blocks.getBlockByHeight(height);
                    response = JSON.stringify(block, null, 2) + '\n';
                } catch (err) {
                    response = JSON.stringify(err) + '\n';
                } finally {
                    return response
                }
            }
        });
    }

    // TODO: Get block by block Hash
    // TODO: Decode story
    getBlockByHash() {
        this.server.route({
            method: 'GET',
            path: '/hash/{hash}',
            handler: async (request, h) => {
                // Get requested block
                let hash = request.params.hash;
                let response = JSON.stringify("Ooops") + '\n';
                try {
                    let block = await this.blocks.getBlockByHash(hash);
                    response = JSON.stringify(block, null, 2) + '\n';
                } catch (err) {
                    response = JSON.stringify(err) + '\n';
                } finally {
                    return response
                }
            }
        });
    }

    // TODO: Get block by wallet Address
    // TODO: Decode story
    getBlockByAddress() {
        this.server.route({
            method: 'GET',
            path: '/address/{address}',
            handler: async (request, h) => {
                // Get requested block
                let address = request.params.address;
                let response = JSON.stringify("Ooops") + '\n';
                try {
                    let block = await this.blocks.getBlockByAddress(address);
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
            path: '/oldblock',
            handler: async (request, h) => {
                // Get posted data.
                let response = JSON.stringify("Ooops") + '\n';
                try {
                    // Expect `data` parameter
                    let data = request.payload.data;
                    // Check if there is data in the post
                    if (data == "") 'Empty POST data - No block added!';
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
            path: '/request',
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
                    let requestObject = self.mempool.addValidationRequest(address);
                    // Respond
                    response = JSON.stringify(requestObject, null, 2) + '\n';
                } catch (err) {
                    response = JSON.stringify(err) + '\n';
                }
                return response
            }
        })
    }

    validateRequestByWallet() {
        let self = this;
        this.server.route({
            method: 'POST',
            path: '/validate',
            handler: async (request, h) => {
                let response = JSON.stringify("Ooops") + '\n';  // Scope!!
                // Get posted wallet address.
                try {
                    // Expect `address` parameter
                    let address = request.payload.address;
                    let signature = request.payload.signature;
                    // Check
                    if (address == "") throw 'Expected address';
                    if (signature == "") throw 'Expected signature';
                    // Validate
                    let validRequest = self.mempool.validateRequestByWallet(address, signature);
                    // Respond
                    response = JSON.stringify(validRequest, null, 2) + '\n';
                } catch (err) {
                    response = JSON.stringify(err) + '\n';
                }
                return response
            }
        })

    }

    addBlock() {
        let self = this;
        this.server.route({
            method: 'POST',
            path: '/block',
            handler: async (request, h) => {
                let response = JSON.stringify("Ooops") + '\n';  // Scope!!
                // Get posted wallet address.
                try {
                    // Expect `address` parameter
                    let address = request.payload.address;
                    let star = request.payload.star;
                    let dec = star.dec;
                    let ra = star.ra;
                    let story = star.story;
                    // Check
                    if (address == "") throw 'Expected address';
                    if (star == "") throw 'Expected star';
                    if (dec == "") throw 'Expected declination (dec:)';
                    if (ra == "") throw 'Expected right ascension (ra:)';
                    if (story == "") throw 'Expected a story';
                    // Verify
                    let isValid = self.mempool.verifyRequest(address);
                    if (!isValid) throw 'Request not validated';
                    // The verified request served its purpose so delete it so
                    // the same address can request again
                    self.mempool.deleteVerifiedRequest(address);  // TODO: TEST
                    // Create block
                    let body = {
                        address: address,
                        star: {
                            ra: ra,
                            dec: dec,
                            story: Buffer(story).toString('hex')
                        }
                    }
                    let newBlock = new Block(body);
                    // Add to private blockchain
                    let addedBlock = await this.blocks.addBlock(newBlock);
                    // Decode story
                    addedBlock.body.star.storyDecoded = hex2ascii(addedBlock.body.star.story);
                    // Respond
                    response = JSON.stringify(addedBlock, null, 2) + '\n';
                } catch (err) {
                    response = JSON.stringify(err) + '\n';
                }
                return response
            }
        })

    }



}


/**
 * Exporting the BlockController class
 * @param {*} server
 */
module.exports = (server) => {
    return new BlockController(server);
}
