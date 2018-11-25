const TimeoutRequestsWindowTime = 1 * 60 * 1000;

class Request {

    constructor(walletAddress) {
        // UTC timestamp
        this.requestTimeStamp = new Date().getTime().toString().slice(0, -3);
        // Set wallet address and copt that to message too.
        this.walletAddress = walletAddress;
        this.message = walletAddress;
    }

    // For JSON.stringify()
    toJSON() {
        return {
            requestTimeStamp: this.requestTimeStamp,
            walletAddress: this.walletAddress,
            message: this.message,
            validationWindow: this.validationWindow
        }
    }

    // Validationn window attribute
    get validationWindow() {
        let now = new Date().getTime().toString().slice(0, -3)
        let timeElapse = now - this.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime / 1000) - timeElapse;
        return timeLeft;
    }

}


class Mempool {

    constructor() {
        this.mempool = [];
        this.timeoutRequests = [];
    }

    // Add a validation request to the mempool.
    addRequestValidation(walletAddress) {
        let self = this;
        let requestObject;
        // Check if already in the mempool
        if (!this.mempool.includes(walletAddress)) {
            // Create a timestamped request object.
            requestObject = new Request(walletAddress);
            // Request is not in mempool
            this.mempool.push(requestObject.walletAddress);
            // Set a callback functionn to remove the requestObject after time out
            this.timeoutRequests[requestObject.walletAddress] = setTimeout(
                function() {
                    self.removeValidationRequest(requestObject)
                }, TimeoutRequestsWindowTime);
            console.log('Added request address: ' + walletAddress);
        } else {
            console.log('Not adding another - same address: ' + walletAddress);
        }
        return requestObject;
    }

    removeValidationRequest(requestObject) {
        let index = this.mempool.indexOf(requestObject.walletAddress);
        if (index > -1) {
            console.log('Removing: ' + requestObject.walletAddress);
            this.mempool.splice(index, 1);
            this.timeoutRequests.splice(index, 1);
            console.log('Mempool is: ' + this.mempool);
        }
    }

}


// Export the classes
module.exports = {
    Mempool
};
