/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain      |
|  ================================================*/


const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain{
    constructor(){
        this.db = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    generateGenesisBlock(){
        const self = this;
        self.getBlockHeight().then((height) => {
            if(height === 0){
                self.addBlock(new Block.Block("Genesis block"))
                .then((result) => {
                    console.log(result);
                }).catch((err) => {
                    console.log(err);
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    getBlockHeight() {
        const self = this;
        return new Promise((resolve, reject) => {
            self.db.getBlocksCount().then((result) => {
                resolve(result);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    getBlockByHash(hash) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.db.getBlockByHash(hash).then((block) => {
                resolve(block);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    getBlockByWalletAddress(address) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.db.getBlockByWalletAddress(address).then((blocks) => {
                resolve(blocks);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }
    
    addBlock(newBlock){
        const self = this;
        return new Promise((resolve, reject) => {
            self.getBlockHeight().then((height) => {
                newBlock.time = new Date().getTime().toString().slice(0,-3);

                // get prev block
                self.getBlock(height - 1)
                .then((prevBlock) => {
                    // skip if there is no block or it is genesis block
                    if(height > 0){
                        newBlock.Height = height;
                        newBlock.previousblockhash = prevBlock.hash;
                    }

                    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

                    self.db.addLevelDBData(height, JSON.stringify(newBlock).toString())
                    .then((block) => {
                        if(block === undefined){
                            reject(err);
                        }else{
                            resolve(block);
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }

    getBlock(height) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.db.getLevelDBData(height).
            then((block) => {
                if(block !== undefined){
                    resolve(block);
                }else{
                    resolve(undefined);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    validateBlock(height) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.getBlock(height)
            .then((block) => {
                if(block === undefined){
                    throw Error("Error retrieving block");
                }
                const blockHash = block.hash;
                block.hash = "";
                const validHash = SHA256(JSON.stringify(block)).toString();
                if (blockHash === validHash){
                    resolve(true);
                }else{
                    resolve(false);
                }
            }).catch((err) => {
                console.log(err);
            });
        });
    }

    validateChain() {
        const self = this;
        let results = [];
        return self.getBlockHeight().then((height) => {
            const heights = Array.from(Array(height).keys());
            return Promise.all(
                heights.map((h) => 
                    self.validateBlock(h)
                    .then( (result) => {
                        if(!result){
                            results.push(`error validating block (height=${h})`);
                        }
                    }).then(() => {
                        if(h < height - 1){
                            return self.getBlock(h).then((block) => {
                                return block;
                            });
                        }
                    }).then((block) => {
                        if(block !== undefined){
                            return self.getBlock(h + 1).then((nextBlock) => {
                                if(block.hash !== nextBlock.previousblockhash){
                                    return `error validating link (${h} and ${h+1})`;
                                }
                            });
                        }
                    }).then((errorLog) => {
                        if(errorLog !== undefined){
                            results.push(errorLog);
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
                )
            ).then(() => {
                return results;
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    _modifyBlock(height, block){
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.addLevelDBData(height, JSON.stringify(block).toString())
            .then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        })

    }
}

module.exports.Blockchain = Blockchain;
