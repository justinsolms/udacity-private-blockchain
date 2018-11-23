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

A set of 5 block labelled as 1 to 5 are inserted after the Genesis block as test data. If the app is quit (``^C``) and restarted then no Genesis block shall be added but another 5 test blocks shall be added with the label number starting off one higher then the last block found in the database. For example runningthe app twice will yiled a query to block 14 labelled - you guessed it - "Test Block - 14":

    {
      "hash": "fe868d457550622acd7f1e13259eb76a794ed704cf8e09cf70544eea6dac8a1f",
      "height": 14,
      "body": "Test Block - 14",
      "time": "1542985791",
      "previousBlockHash": "b91fd18db1fa1b91978356f4ea94db390879f5e834d5b3acd081fff87c8a7283"
    }

# API Service Port Configuration

The project’s API service is configured to run on port 8000. The default URL is http://localhost:8000.

# GET Block Endpoint

The web API contains a GET endpoint that responds to a request using a URL path with a block height parameter or properly handles an error if the height parameter is out of bounds.

The response for the endpoint provides a block object in JSON format.

Usage to GET block 5:

    URL: http://localhost:8000/block/5

This should respond with:

    {
      "hash": "298242e073a2046f9d78930d88127b92d0d4b5e5be5c7d773a61ea4429277528",
      "height": 5,
      "body": "Test Block - 5",
      "time": "1542982498",
      "previousBlockHash": "ad4f597526e6b2740a9ac75f28ebd0607ae794d66b4abe025361caed5c1ab515"
    }

# POST Block Endpoint

The web API contains a POST endpoint that allows posting a new block with the data payload option to add data to the block body. Block body should support a string of text.

Usage to POST a block:

    URL: http://localhost:8000/block?data=Testing block with test string data

If this was to become block 12 (excluding the Genesis block) then a typical response would be:

    {
      "hash": "4a44ff387c89bd9267ef7693d8fd5e109ce1adc0600a1e49f3c7b62c302ed4c1",
      "height": 12,
      "body": "Testing block with test string data",
      "time": "1542984246",
      "previousBlockHash": "1e771b1bbde954973ba3c05bcb93df0e0e6b9183314be6ca35ddc5f51e55ed70"
    }

# Errors

Service responds with appropriate error responses when posting or getting contents.

## Empty POST

A common error to watch out for - When posting to localhost:8000/block without any content on the payload, the service shall not create a block. It shall respond with:

    "Empty POST data - No block added!"

## Invalid GET key

A common error to watch out for - When getting from localhost:8000/block/{index} when there is no key={index} in the database, such as:

    curl http://localhost:8000/block/100

then the service shall respond with:

    "getBlock Error: err=getLevelDBData Error: key=100, err=NotFoundError: Key not found in database [100]"

## Systematic errors

If a systematic error is thrown or a promise is rejected then the system will respond with the error output in the endpoint.

For example, commenting in levelSandbox.js[lines 53-55] will produce on the POST of a block # 7:

    "Mock Error!"



Another example, commenting in levelSandbox.js[lines 29-31] will produce on the GET of a block # 7:

    curl http://localhost:8000/block/7
    "getBlock Error: err=getLevelDBData Error: key=7, err=NotFoundError: Key not found in database [7]"

> Note: Remember to make sure these lines are always commented out.
