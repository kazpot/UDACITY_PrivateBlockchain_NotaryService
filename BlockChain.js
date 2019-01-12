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

    async generateGenesisBlock(){
        const self = this;
        try{
            const height = await self.getBlockHeight();
            if(height === 0){
                const result = await self.addBlock(new Block.Block("Genesis block"));
                coonsole.log(result);
            }
        }catch(err){
            console.log(err);
        }
    }

    async getBlockHeight() {
        const self = this;
        try{
            return await self.db.getBlocksCount();
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    async getBlockByHash(hash) {
        const self = this;
        try{
            return await self.db.getBlockByHash(hash);
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    async getBlockByWalletAddress(address) {
        const self = this;
        try{
            return await self.db.getBlockByWalletAddress(address);
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    async addBlock(newBlock){
        const self = this;
        try{
            const height = await self.getBlockHeight();
            newBlock.time = new Date().getTime().toString().slice(0,-3);

            const prevBlock = await self.getBlock(height - 1);

            // skip if there is no block or it is genesis block
            if(height > 0){
                newBlock.Height = height;
                newBlock.previousblockhash = prevBlock.hash;
            }

            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

            const block = await self.db.addLevelDBData(height, JSON.stringify(newBlock).toString());
            if(block === undefined){
                throw Error ('Failed to store block to db');
            }else{
                return block;
            }
        }catch(err){
            throw err;
        }
    }

    async getBlock(height) {
        const self = this;
        try{
            const block = await self.db.getLevelDBData(height);
            if(block !== undefined){
                return block;
            }else{
                return undefined;
            }
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    async validateBlock(height) {
        const self = this;
        try{
            const block = await self.getBlock(height);
            if(block === undefined){
                throw Error("Error retrieving block");
            }
            const blockHash = block.hash;
            block.hash = "";
            const validHash = SHA256(JSON.stringify(block)).toString();
            if (blockHash === validHash){
                return true;
            }else{
                return false;
            }
        }catch(err){
            throw err;
        }
    }

    async validateChain() {
        const self = this;
        let errorLog = [];
        try{
            const height = await self.getBlockHeight();
            const heights = await Array.from(Array(height).keys());
            for(let i=0; i<heights.length; i++){
                let h = heights[i];
                const result = await self.validateBlock(h);
                if(!result){
                    errorLog.push(`error validating block (height=${h})`);
                }

                if(h < height - 1){
                    const block = await self.getBlock(h);
                    const nextBlock = await self.getBlock(h + 1);
                    if(block.hash !== nextBlock.previousblockhash){
                        errorLog.push(`error validating link (${h} and ${h+1})`);
                    }
                }
            }
            return errorLog;
        }catch(err){
            throw err;
        }
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
