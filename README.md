# Student declaration

Some text is copied and pasted form the rubric because of familiar word use.

# Node.js framework

The Hapi framework was chosen as it:

1. Made intuitive sense to me when I read the docs.
2. It seemed well maintained (by WalMart). The GitHub repository had lost of commits in 2018 which makes me feel better about security.
3. It claims to be "A rich framework for building applications and services." The blog post [13 Node.js Frameworks to Build Web APIs](https://nordicapis.com/13-node-js-frameworks-to-build-web-apis/) claims that "Hapi.js is a one of the most enterprise-centric frameworks in this piece". This suits my ambitions.

# Running the app

Run the app with

    node app.js

Quit with ``^C``

# Mock data

A set of 5 block labelled as 1 to 5 are inserted after the Genesis block as test data. If the app is quit (``^C``) and restarted then no Genesis block shall be added but another 5 test blocks shall be added with the label number starting off one higher then the last block found in the database. For example running the app three times with no requests will have created 15 mock star data blocks and a query to block 14 will yield:

    {
      "hash": "f8b94d9f176f0ca0785cd68571f206ab94e053a78f7a969a43373cbeb6deee93",
      "height": 14,
      "body": {
        "address": "1LAmWfKNvtgkn2FWTpiXjPw6yQemyDFDbt",
        "star": {
          "ra": "16.56564",
          "dec": "68.434252",
          "story": "4d6f636b2073746172206e756d62657220233134",
          "storyDecoded": "Mock star number #14"
        }
      },
      "time": "1543579603",
      "previousBlockHash": "67d554364bcce2345d4599fab7347b591773f7fc54c779f54de60e80297e1d6c"
    }

# API Service Port Configuration

The project’s API service is configured to run on port 8000. The default URL is http://localhost:8000.


# Blockchain ID validation routine

## Request validation JSON

The Web API POST endpoint returns a validation JSON response.

The response contains message details, request timestamp, and time remaining for validation window response in JSON format with a message to sign.

The message format is ``[walletAddress]:[timeStamp]:starRegistry``

Usage to request a validation JSON response is:

    curl -X POST \
        http://localhost:8000/requestValidation \
        -H "Content-Type: application/json" \
        -H 'cache-control: no-cache' \
        -d '{"address":"1G2qu3LAFUDWzapwy1fMp2FYo6yLpvWe1o"}'

This should respond with:

    {
      "walletAddress": "1G2qu3LAFUDWzapwy1fMp2FYo6yLpvWe1o",
      "requestTimeStamp": "1543580713",
      "message": "1G2qu3LAFUDWzapwy1fMp2FYo6yLpvWe1o:1543580713:starRegistry",
      "validationWindow": 300,
      "messageSignature": false
    }

Re-submitting the request should respond with:

    "Request awating validation, timeout in 193"


## Validate message

The Web API POST endpoint returns a validated JSON response.

The response contains the original validation JSON as a ``status`` attribute and another ``registerStar`` attribute set to ``true``.

Usage to request a validation JSON response is:

    curl -X POST \
    http://localhost:8000/validate \
    -H "Content-Type: application/json" \
    -H 'cache-control: no-cache' \
    -d '{"address":"1G2qu3LAFUDWzapwy1fMp2FYo6yLpvWe1o","signature":"IApgZvgVNFWwYK+huX4DqMuXF7bKXFm4JN7XprDVOni2aCCti5D72D37CV87iRVjbW1R6EDcDIvpQUioe4PCSNI="}'

This should respond with:

    {
      "status": {
        "walletAddress": "1G2qu3LAFUDWzapwy1fMp2FYo6yLpvWe1o",
        "requestTimeStamp": "1543580713",
        "message": "1G2qu3LAFUDWzapwy1fMp2FYo6yLpvWe1o:1543580713:starRegistry",
        "validationWindow": 77,
        "messageSignature": true
      },
      "registerStar": true
    }

Resubmitting the validation should respond with:

    "Request already validated"

Submitting the validation with an non-existent address should respond with:

    "Request does not exist"

Submitting the validation the correct address but anything wrong with the signature should respond with:

    "Invalid signature"

# Star registration Endpoint

The Web API POST endpoint stores the Star object and properties within the body of the block and places the block on the blockchain.

Usage to request a validation JSON response is:

    curl -X POST \
        http://localhost:8000/block \
        -H "Content-Type: application/json" \
        -H 'cache-control: no-cache' \
        -d '{"address":"14sW3HAjFBZfNEbphLoWqVNyZetrW8f19R", "star": {"dec": "68.434252", "ra": "16.56564", "story": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lobortis neque leo, id faucibus sapien mattis eget. Sed efficitur vehicula ligula, sed porttitor mi porttitor quis. Duis tortor nisi, aliquam ac varius pretium, molestie vitae sem. Cras mattis id magna laoreet blandit. Pellentesque tempus ipsum sit amet magna ultrices, nec efficitur justo commodo. Praesent porta in nunc vel dictum. Pellentesque commodo purus et interdum porta. Maecenas vulputate vulputate eros, non suscipit magna fringilla eget. Curabitur quis velit sed lectus efficitur consequat et ut metus. Phasellus id arcu ullamcorper, vestibulum arcu eget, aliquet lacus. Aliquam erat volutpat. Ut ut aliquet nulla, ut blandit mi. Ut at massa eu lectus pharetra scelerisque tristique vitae dolor. " } }'

This should respond with:

    {
      "hash": "198699216db21edb7764b4cb2657474a644a5b9336c97266800e2fc6f7dfafd7",
      "height": 6,
      "body": {
        "address": "1G2qu3LAFUDWzapwy1fMp2FYo6yLpvWe1o",
        "star": {
          "ra": "16.56564",
          "dec": "68.434252",
          "story": "4c6f72656d20697073756d20646f6c6f722073697420616d65742c20636f6e73656374657475722061646970697363696e6720656c69742e2043726173206c6f626f72746973206e65717565206c656f2c2069642066617563696275732073617069656e206d617474697320656765742e2053656420656666696369747572207665686963756c61206c6967756c612c2073656420706f72747469746f72206d6920706f72747469746f7220717569732e204475697320746f72746f72206e6973692c20616c697175616d20616320766172697573207072657469756d2c206d6f6c65737469652076697461652073656d2e20437261732e2e2e",
          "storyDecoded": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lobortis neque leo, id faucibus sapien mattis eget. Sed efficitur vehicula ligula, sed porttitor mi porttitor quis. Duis tortor nisi, aliquam ac varius pretium, molestie vitae sem. Cras..."
        }
      },
      "time": "1543581936",
      "previousBlockHash": "afa22d39ccc356d468f29accb69400400de40fe0d01661c774cc4d2f9d031c1c"
    }

with the star story truncated to 250 words which end in ellipses.

Submitting the star data without a validation request or incorrect address or expired request should respond with:

    "Request does not exist"

Submitting the start data without a signed validation should respond with:

    "Request not validated"

# Star Lookup

## GET Block by height

The web API contains a GET endpoint that responds to a request using a URL path with a block height parameter or properly handles an error if the height parameter is out of bounds.

The response for the endpoint provides a block object in JSON format.

Usage to GET block 5:

    URL: http://localhost:8000/block/5

This should respond with:

    {
      "hash": "6bff1dd031c58f0baf84a4f784c7ad51ef91bac811e6e7b14e3d75ba12f4a65e",
      "height": 5,
      "body": {
        "address": "1LAmWfKNvtgkn2FWTpiXjPw6yQemyDFDbt",
        "star": {
          "ra": "16.56564",
          "dec": "68.434252",
          "story": "4d6f636b2073746172206e756d626572202335",
          "storyDecoded": "Mock star number #5"
        }
      },
      "time": "1543579293",
      "previousBlockHash": "51253d3e5f5fa98163a98fe381cc7650a325de335bf1155a4140e63553567360"
    }


## GET Block by hash

The web API contains a GET endpoint that responds to a request using a URL path with a block hash parameter or properly handles an error if the does not exist by returning and empty JSON output of ``{}``.

The response for the endpoint provides a block object in JSON format.

Usage to GET block with hash ``6bff1dd031c58f0baf84a4f784c7ad51ef91bac811e6e7b14e3d75ba12f4a65e``:

    URL: http://localhost:8000/hash:6bff1dd031c58f0baf84a4f784c7ad51ef91bac811e6e7b14e3d75ba12f4a65e

This should respond with:

    {
      "hash": "6bff1dd031c58f0baf84a4f784c7ad51ef91bac811e6e7b14e3d75ba12f4a65e",
      "height": 5,
      "body": {
        "address": "1LAmWfKNvtgkn2FWTpiXjPw6yQemyDFDbt",
        "star": {
          "ra": "16.56564",
          "dec": "68.434252",
          "story": "4d6f636b2073746172206e756d626572202335",
          "storyDecoded": "Mock star number #5"
        }
      },
      "time": "1543579293",
      "previousBlockHash": "51253d3e5f5fa98163a98fe381cc7650a325de335bf1155a4140e63553567360"
    }


## GET Block by wallet address

The web API contains a GET endpoint that responds to a request using a URL path with a wallet address parameter or properly handles an error if the does not exist by returning and empty JSON output of ``{}``.

The response for the endpoint provides a block object in JSON format.

Usage to GET block with wallet address ``14sW3HAjFBZfNEbphLoWqVNyZetrW8f19R``:

    URL: http://localhost:8000/address:14sW3HAjFBZfNEbphLoWqVNyZetrW8f19R

This should respond with something similar to:

    [
      {
        "hash": "cccdbf32e403b80c504cd7be1ebfb3feeccef44537f3021ed240ec27a96ba3ab",
        "height": 1,
        "body": {
          "address": "14sW3HAjFBZfNEbphLoWqVNyZetrW8f19R",
          "star": {
            "ra": "16.56564",
            "dec": "68.434252",
            "story": "4d6f636b2073746172206e756d626572202331",
            "storyDecoded": "Mock star number #1"
          }
        },
        "time": "1543580147",
        "previousBlockHash": "cc1e2d2ec0c117f2d0af9291e9eb5efa4c8be4827b9cb91b80b8bebbc68e7bef"
      },
      {
        "hash": "8b2b7150c514be374d2b597c790b06056eaf7871e7d02525a59df57af3e5d626",
        "height": 2,
        "body": {
          "address": "14sW3HAjFBZfNEbphLoWqVNyZetrW8f19R",
          "star": {
            "ra": "16.56564",
            "dec": "68.434252",
            "story": "4d6f636b2073746172206e756d626572202332",
            "storyDecoded": "Mock star number #2"
          }
        },
        "time": "1543580147",
        "previousBlockHash": "cccdbf32e403b80c504cd7be1ebfb3feeccef44537f3021ed240ec27a96ba3ab"
      }
    ]
