/* ===== Block Class ==============================
|  Class with a constructor for block              |
|  ===============================================*/

class Block{
    constructor(data){
        this.hash = "";
        this.Height = 0;
        this.body = data;
        this.time = 0;
        this.previousblockhash = "";
    }
}

module.exports.Block = Block;
