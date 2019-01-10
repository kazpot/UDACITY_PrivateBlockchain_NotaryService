class ValidRequest{
    constructor(regObj){
        this.registerStar = true;
        this.status = {
            walletAddress: regObj.walletAddress,
            requestTimeStamp: regObj.requestTimeStamp,
            message: regObj.message,
            validationWindow: regObj.validationWindow,
            messageSignature: "valid"
        };
    }
}

module.exports.ValidRequest = ValidRequest;
