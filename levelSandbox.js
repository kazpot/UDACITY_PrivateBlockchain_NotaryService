/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

let level = require('level');
let chainDB = './chaindata';

const hex2ascii = require('hex2ascii');

class LevelSandbox{
    constructor(){
        this.db = level(chainDB);
    }

    getLevelDBData(key){
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.get(key, (err, value) => {
                if(err){
                    if(err.type == 'NotFoundError'){
                        resolve(undefined);
                    }else{
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                }else{
                    const block = JSON.parse(value);
                    self.addStoryDecoded(block);
                    resolve(block);
                }
            });
        });
    }

    addLevelDBData(key, value){
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.put(key, value, (err) => {
                if(err){
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                const block = JSON.parse(value);
                self.addStoryDecoded(block);
                resolve(block);
            });
        });
    }

    getBlocksCount(){
        let self = this;
        return new Promise(function(resolve, reject){
            let i = 0;
            self.db.createReadStream()
            .on('data', (data) => {
                 i++;
             })
            .on('error', (err) => {
                reject(err)
             })
            .on('close', () => {
                resolve(i);
            });
        })
    }

    getBlockByHash(hash){
        let self = this;
        let block = null;
        return new Promise((resolve, reject) => {
            self.db.createReadStream()
            .on('data', (data) => {
                const obj = JSON.parse(data.value);
                if(obj.hash === hash){
                    block = obj;
                    self.addStoryDecoded(block);
                }
            })
            .on('error', (err) => {
                reject(err);
            })
            .on('close', () => {
                resolve(block);
            });
        });
    }

    getBlockByWalletAddress(address){
        let self = this;
        let blocks = [];
        let block = null;
        return new Promise((resolve, reject) => {
            self.db.createReadStream()
            .on('data', (data) => {
                const obj = JSON.parse(data.value);
                if(obj.body && obj.body.address === address){
                    block = obj;
                    self.addStoryDecoded(block);
                    blocks.push(block);
                }
            })
            .on('error', (err) => {
                reject(err);
            })
            .on('close', () => {
                resolve(blocks);
            });
        });
    }

    addStoryDecoded(block){
        if(block.body.star && block.body.star.story){
            block.body.star.storyDecoded = hex2ascii(block.body.star.story);
        }
    }
}

module.exports.LevelSandbox = LevelSandbox;







