class RequestObject{
    constructor(address){
        this.walletAddress = address;
        this.requestTimeStamp = new Date().getTime().toString().slice(0,-3);
        this.message = `${this.walletAddress}:${this.requestTimeStamp}:starRegistry`;
        this.validationWindow = 300;
    }
}

module.exports.RequestObject = RequestObject;
