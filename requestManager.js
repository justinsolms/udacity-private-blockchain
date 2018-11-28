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

    // Remove a request and its timeout.
    removeRequest(requestObject) {
        delete this.mempool[requestObject.walletAddress];
        clearTimeout(this.timeoutRequests[requestObject.walletAddress]);
        delete this.timeoutRequests[requestObject.walletAddress];
    }

    // Add a validation request to the mempool with timeout.
    addRequestWithTimeOut(requestObject, TimeoutRequestsWindowTime) {
        let self = this;
        // Put the request object back and restore its timeout
        this.mempool[requestObject.walletAddress] = requestObject;
        // Set a callback function to remove the requestObject after
        // time out
        this.timeoutRequests[requestObject.walletAddress] = setTimeout(
            () => self.removeRequest(requestObject),
            TimeoutRequestsWindowTime
        );
    }

    // Add a validated request to the mempool.
    addValidatedRequest(requestObject) {
        let address = requestObject.status.walletAddress;
        this.mempoolValid[address] = requestObject;
    }

    // =========================================================================

    // Request a vaidation object for signature
    addValidationRequest(walletAddress) {
        let requestObject;
        // Check if already in the mempool
        if (walletAddress in this.mempool) {
            // Thow rather than return
            let timeLeft = this.mempool[walletAddress].validationWindow;
            throw 'Request awating validation, timeout in ' + timeLeft;
        } else if (walletAddress in this.mempoolValid) {
            // Thow rather than return
            throw 'Request already validated';
        } else {
            // Create a timestamped request object.
            requestObject = new Request(walletAddress);
            // Add a validation request to the mempool with timeout.
            this.addRequestWithTimeOut(requestObject, TimeoutRequestsWindowTime);
            return this.mempool[walletAddress];
        }
    }

    // Validate a request message or not.
    validateRequestByWallet(address, signature) {
        // Check if request is in the mempool
        if (address in this.mempool) {
            // It is in the mempool -> it was inserted & it hasn't timed out &
            // hasn't been validated.
            let requestObject = this.mempool[address];
            // Verify the message
            try {
                let message = requestObject.message;
                let isValid = bitcoinMessage.verify(message, address, signature);
                if (!isValid) throw Error("Invalid signature")
            } catch (err) {
                // Thow rather than return
                throw err.message;
            }
            // Remove request form mempool
            this.removeRequest(requestObject);
            // Mark as valid
            requestObject.messageSignature = true;
            // Construct validated object.
            let validObject = {
                status: requestObject,
                registerStar: true
            };
            this.addValidatedRequest(validObject);
            return this.mempoolValid[requestObject.walletAddress];
        } else if (address in this.mempoolValid) {
            // Thow rather than return
            throw 'Request already validated';
        } else {
            // Thow rather than return
            console.log('Request not in mempool');
            log(this.mempool)
            console.log('-');
            throw 'Request not in mempool';
        }
    }

}


// Export the classes
module.exports = {
    Mempool
};
