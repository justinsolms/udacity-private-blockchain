const starData = [{
        "address": "14sW3HAjFBZfNEbphLoWqVNyZetrW8f19R",
        "star": {
            "ra": "16.56564",
            "dec": "68.434252",
            "story": "4920616c736f20666f756e6420612073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },

    {
        "address": "14sW3HAjFBZfNEbphLoWqVNyZetrW8f19R",
        "star": {
            "ra": "16.56564",
            "dec": "68.434252",
            "story": "4920616c736f20666f756e6420612073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },

    {
        "address": "1LAmWfKNvtgkn2FWTpiXjPw6yQemyDFDbt",
        "star": {
            "ra": "16.56564",
            "dec": "68.434252",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },

    {
        "address": "1LAmWfKNvtgkn2FWTpiXjPw6yQemyDFDbt",
        "star": {
            "ra": "16.56564",
            "dec": "68.434252",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },

    {
        "address": "1LAmWfKNvtgkn2FWTpiXjPw6yQemyDFDbt",
        "star": {
            "ra": "16.56564",
            "dec": "68.434252",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
]

const SimpleChain = require('./simpleChain.js');
const { Block, Blockchain } = SimpleChain;


// Function to inizialize a mock start dataset
function initializeMockData(blockController) {
    async function theLoop(blockChain) {
        let genesisBlock = await blockChain.createGenesisBlock();
        // console.log(genesisBlock);
        // Get height so we can label our block-test data properly; with the height.
        let height = await blockChain.getBlockHeight();
        console.log(height);
        // Start loop at height plus 1.
        for (let i = 0; i < 5; i++) {
            data = starData[i];
            story = "Mock star number #" + (height + i + 1);
            console.log(story);
            data.star.story = Buffer(story).toString('hex');
            let blockTest = new Block(data);
            let addedBlock = await blockChain.addBlock(blockTest);
            // console.log(addedBlock);
        }
        return true;
    }
    theLoop(blockController.blocks)
        // Do it one more time just to be sure.
        .then(() => blockController.blocks.validateChain())
        .catch(err => console.log(err))

}


// Export the class
module.exports.initializeMockData = initializeMockData;
