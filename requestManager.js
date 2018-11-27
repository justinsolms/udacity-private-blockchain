const format = require('string-format')
format.extend(String.prototype, {})

const bitcoinMessage = require('bitcoinjs-message');

const TimeoutRequestsWindowTime = 5 * 60 * 1000;


class Request {

    constructor(walletAddress) {
        // UTC timestamp
        this.requestTimeStamp = new Date().getTime().toString().slice(0, -3);
        // Set wallet address and copt that to message too.
        this.walletAddress = walletAddress;
        this.messageSignature = false;
        // Special format for message
        this.message = '{walletAddress}:{requestTimeStamp}:starRegistry'.format(this);
    }

    // For JSON.stringify()
    toJSON() {
        return {
            walletAddress: this.walletAddress,
            requestTimeStamp: this.requestTimeStamp,
            message: this.message,
            validationWindow: this.validationWindow,
            messageSignature: this.messageSignature
        }
    }

    // Validationn window attribute getter
    get validationWindow() {
        let now = new Date().getTime().toString().slice(0, -3)
        let timeElapse = now - this.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime / 1000) - timeElapse;
        return timeLeft;
    }

}


class Mempool {

    constructor() {
        this.mempool = new Object();
        this.timeoutRequests = new Object();
        this.mempoolValid = new Object();
    }

    // Add a validation request to the mempool.
    addRequestValidation(walletAddress) {
        let requestObject;
        // Check if already in the mempool
        if (!(walletAddress in this.mempool)) {
            // Create a timestamped request object.
            requestObject = new Request(walletAddress);
            // Add a validation request to the mempool with timeout.
            this.addRequestMempoolTimeOut(requestObject, TimeoutRequestsWindowTime);
            console.log('Added request: ' + requestObject.walletAddress);
        } else {
            // TODO: Rather return JSON error objects.
            console.log('Not adding another - same address: ' + walletAddress);
        }
        return this.mempool[walletAddress];
    }

    // Add a validation request to the mempool.
    addRequestMempoolValid(requestObject) {
        this.mempoolValid[requestObject.walletAddress] = requestObject;
    }

    // Add a validation request to the mempool with timeout.
    addRequestMempoolTimeOut(requestObject, TimeoutRequestsWindowTime) {
        let self = this;
        // Put the request object back and restore its timeout
        this.mempool[requestObject.walletAddress] = requestObject;
        // Set a callback function to remove the requestObject after
        // time out
        this.timeoutRequests[requestObject.walletAddress] = setTimeout(
            function() {
                console.log('Removing: ' + requestObject.walletAddress);
                self.removeRequestMempoolTimeOut(requestObject)
                console.log('Mempool is now: ' + this.mempool);
            }, TimeoutRequestsWindowTime);
    }

    // Remove a request and its timeout.
    removeRequestMempoolTimeOut(requestObject) {
        delete this.mempool[requestObject.walletAddress]
        delete this.timeoutRequests[requestObject.walletAddress]
    }

    // Validate a request message or not.
    // TODO: Return JSON objecvt for everything.
    validateRequestByWallet(address, signature) {
        let validRequest;
        // Check if request is in the mempool
        if (address in this.mempool) {
            // It is in the mempool -> it was inserted & it hasn't timed out &
            // hasn't been validated.
            let requestObject = this.mempool[address];
            // Copy the request object from the mempool & delete it and its
            // timout. If it cannot be verified we'll put the object back
            // with a fresh timeout with the proper time left.
            this.removeRequestMempoolTimeOut(requestObject);
            // Verify the message
            let message = requestObject.message;
            console.log({
                message : message,
                address : address,
                signature : signature
            });
            let isValid;
            isValid = bitcoinMessage.verify(message, address, signature);
            try {
            } catch (err) {
                // TODO: Return error to poster.
            } finally {

            }
            if (isValid) {
                // Mark as valid
                requestObject.messageSignature = isValid;
                // Construct validated object.
                let validObject = new Object();
                validObject.status = requestObject;
                validObject.registerStar = true;
                this.addRequestMempoolValid(validObject);
                console.log('Validated request address: ' + validObject.walletAddress);
                return validObject;
            } else {
                let invalidObject = requestObject;
                let TimeoutRequestsWindowTime = invalidObject.validationWindow;
                this.addRequestMempoolTimeOut(invalidObject, TimeoutRequestsWindowTime);
                console.log('InValidated request: ' + invalidObject.walletAddress);
            }
        } else {
            console.log('No such address or validated or expired');
        }
    }

}


// Export the classes
module.exports = {
    Mempool
};
