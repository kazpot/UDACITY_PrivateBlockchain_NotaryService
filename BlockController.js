const SHA256 = require('crypto-js/sha256');
const bitcoinMessage = require('bitcoinjs-message');

const BlockClass = require('./Block.js');
const BlockChain = require('./BlockChain.js');
const Star = require('./Star.js');
const RequestObject = require('./RequestObject.js');
const ValidRequest = require('./ValidRequest.js');
const Utils = require('./helpers/utility.js');

let blockChain = new BlockChain.Blockchain();

class BlockController{

    constructor(app){
        this.app = app;
        this.blocks = [];
        this.getBlockByHeight();
        this.postNewBlock();
        this.requestValidation();
        this.validateRequestByWallet();
        this.getBlockByHash();
        this.getBlockByWalletAddress();
        this.mempool = [];
        this.timeoutRequests = {};
        this.mempoolValid = [];
    }

    requestValidation(){
        this.app.post("/requestValidation", (req, res) => {
            const body = req.body;
            if (Utils.isEmpty(body)){
                res.send({error: "Unacceptable content"});
            }else{
                const address = body.address;
                const index = this.mempool.findIndex(obj => obj.walletAddress === address)
                
                let reqObj;
                if(index > -1){
                    reqObj = this.mempool[index];
                    this.setCuurentValidationWindow(reqObj);
                }else{
                    reqObj = new RequestObject.RequestObject(address);
                    this.mempool.push(reqObj);
                    console.log(this.mempool);
                    this.timeoutRequests[address] = setTimeout(() => {
                        this.removeValidationRequest(address)
                    }, reqObj.validationWindow * 1000);  
                }
                res.send(reqObj);
            }
        });
    }

    validateRequestByWallet(){
        this.app.post("/message-signature/validate", (req, res) => {
            const body = req.body;
            if (Utils.isEmpty(body)){
                res.send({error: "Unacceptable content"});
            }else{
                const address = body.address;
                const index = this.mempool.findIndex(obj => obj.walletAddress === address)
                let reqObj;
                if(index > -1){
                    const signature = body.signature;
                    reqObj = this.mempool[index];
                    this.setCuurentValidationWindow(reqObj);
                    if (reqObj.validationWindow < 0){
                        res.send({error: "Time verification failed"});
                    }
                    if(!bitcoinMessage.verify(reqObj.message, address, signature)){
                        res.send({error: "Signature verification failed"});
                    }
                    const validRequest = new ValidRequest.ValidRequest(reqObj);
                    this.mempoolValid.push(validRequest);
                    console.log(this.mempoolValid);

                    // remove request object from mempool
                    delete this.timeoutRequests[address];
                    this.removeValidationRequest(address);
                    console.log(this.timeoutRequests);
                    console.log(this.mempool);

                    res.send(validRequest);
                }else{
                    res.send({error: "Request object is not found"});
                }
            }
        });
    }

    getBlockByHeight(){
        this.app.get("/block/:height", (req, res) => {
            const height = req.params.height;
            blockChain.getBlock(height).then((block) => {
                if(block === undefined){
                    res.send({error:`Block was not found for height #${height}`});
                }else{
                    res.send(block);
                }
            }).catch((err) => {
                res.send({error:`Block of height #${height} was not found`});
            });
        });
    }

    getBlockByHash(){
        this.app.get("/stars/hash::hash", (req, res) => {
            const hash = req.params.hash;
            blockChain.getBlockByHash(hash).then((block) => {
                if(block === undefined || block === null){
                    res.send({error:`Block was not found for hash(${hash})`});
                }else{
                    res.send(block);
                }
            }).catch((err) => {
                res.send({error:`hash(${hash}) was not found`});
            });
        });
    }

    getBlockByWalletAddress(){
        this.app.get("/stars/address::address", (req, res) => {
            const address = req.params.address;
            blockChain.getBlockByWalletAddress(address).then((blocks) => {
                if(blocks === undefined){
                    res.send({error:`Blocks were not found for address(${address})`});
                }else{
                    res.send(blocks);
                }
            }).catch((err) => {
                res.send({error:`address(${address}) was not found`});
            });
        });
    }

    postNewBlock(){
        this.app.post("/block", (req, res) => {
            const body = req.body;
            if (Utils.isEmpty(body)){
                res.send({error: "Unacceptable content"});
            }else{
                const address = body.address;
                const star = body.star;
                if(star instanceof Array){
                    res.send({error: "Only one star is acceptable"});
                }else{
                    if(this.verifyAddressRequest(address)){
                        let star = new Star.Star(body);
                        let newBlock = new BlockClass.Block(star);
                        blockChain.addBlock(newBlock).then((block) => {

                            // Upon validation the user is granted access to register a single star
                            this.removeValidation(address);
                            console.log(this.mempoolValid);

                            res.send(block);
                        }).catch((err) => {
                            res.send({error: err});
                        });
                    }else{
                        res.send({error: "You are not granted access to register a star"});
                    }
                }
            }
        });
    }

    removeValidationRequest(address){
        this.mempool.splice(this.mempool.findIndex(obj => obj.walletAddress === address), 1);
        console.log(`Request object has been removed from mempool - ${address}`);
    }

    removeValidation(address){
        this.mempoolValid.splice(this.mempoolValid.findIndex(obj => obj.status.walletAddress === address), 1);
        console.log(`Request object has been removed from mempoolValid - ${address}`);
    }

    setCuurentValidationWindow(reqObj){
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - reqObj.requestTimeStamp;
        let timeLeft = 300 - timeElapse;
        reqObj.validationWindow = timeLeft;
    }

    verifyAddressRequest(address){
        const index = this.mempoolValid.findIndex(obj => obj.status.walletAddress === address)
        if(index > -1){
            return true;
        }else{
            return false;
        }
    }
}


module.exports = (app) => {return new BlockController(app);}
