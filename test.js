const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');

let myBlockChain = new BlockChain.Blockchain();

// (function theLoop (i) {
//     setTimeout(function () {
//         let blockTest = new Block.Block("Test Block - " + (i + 1));
//         // Be careful this only will work if your method 'addBlock' in the Blockchain.js file return a Promise
//         myBlockChain.addBlock(blockTest).then((result) => {
//             console.log(result);
//         });
//         i++;
//         if (i < 10) theLoop(i);
//     }, 500);
//   })(0);

/***********************************************
 ** Function to get the Height of the Chain ****
 ***********************************************/
// myBlockChain.getBlockHeight().then((height) => {
//     console.log(height);
// }).catch((err) => { console.log(err);});


/***********************************************
 ******** Function to Get a Block  *************
 ***********************************************/
// myBlockChain.getBlock(0).then((block) => {
//     console.log(JSON.stringify(block));
// }).catch((err) => { console.log(err);});


/***********************************************
 ***************** Validate Block  *************
 ************************************************/
// myBlockChain.validateBlock(0).then((valid) => {
//     console.log(valid);
// })
// .catch((error) => {
//     console.log(error);
// })


/** Tampering a Block this is only for the purpose of testing the validation methods */
// myBlockChain.getBlock(5).then((block) => {
//     let blockAux = block;
//     blockAux.body = "Tampered Block";
//     myBlockChain._modifyBlock(blockAux.Height, blockAux).then((blockModified) => {
//         if(blockModified){
//             myBlockChain.validateBlock(blockAux.Height).then((valid) => {
//                 console.log(`Block #${blockAux.Height}, is valid? = ${valid}`);
//             })
//             .catch((error) => {
//                 console.log(error);
//             })
//         } else {
//             console.log("The Block wasn't modified");
//         }
//     }).catch((err) => { console.log(err);});
// }).catch((err) => { console.log(err);});

// myBlockChain.getBlock(6).then((block) => {
//     let blockAux = block;
//     blockAux.previousBlockHash = "jndininuud94j9i3j49dij9ijij39idj9oi";
//     myBlockChain._modifyBlock(blockAux.Height, blockAux).then((blockModified) => {
//         if(blockModified){
//             console.log("The Block was modified");
//         } else {
//             console.log("The Block wasn't modified");
//         }
//     }).catch((err) => { console.log(err);});
// }).catch((err) => { console.log(err);});


/***********************************************
 ***************** Validate Chain  *************
 ***********************************************/
myBlockChain.validateChain().then((errorLog) => {
    if(errorLog.length > 0){
        console.log("The chain is not valid:");
        errorLog.forEach(error => {
            console.log(error);
        });
    } else {
        console.log("No errors found, The chain is Valid!");
    }
})
.catch((error) => {
    console.log("caught: " + error);
})



