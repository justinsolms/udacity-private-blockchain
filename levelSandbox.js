/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/
// Importing the module 'level'
// const leveldown = require('leveldown');
// const levelup = require('levelup');
const level = require('level');
// Declaring the folder path that store the data
const chainDB = './chaindata';
// Declaring a class
class LevelSandbox {
    // Declaring the class constructor
    constructor() {
        this.db = level(chainDB, {
            valueEncoding: 'json'
        });
        // this.db = levelup(leveldown(chainDB));
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key) {
        // because we are returning a promise we will need this to be able to
        // reference this outside 'this' *inside* the Promise constructor
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.get(key)
                .then((value) => {
                    // TEST: POST Error reporting.
                    // if (key == 7) {
                    //     reject('Mock Error!')
                    // }
                    resolve(value)
                })
                .catch((err) => {
                    reject('getLevelDBData Error: key=' + key + ', err=' + err);
                })
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        // because we are returning a promise we will need this to be able to
        // reference this outside 'this' *inside* the Promise constructor
        let self = this;
        // console.log('db.put()');
        return new Promise(function(resolve, reject) {
            self.db.put(key, value)
                .then(function() {
                    return self.db.get(key)
                })
                .then(function(value) {
                    // TEST: POST Error reporting.
                    // if (key == 7) {
                    //     reject('Mock Error!')
                    // }
                    resolve(value)
                })
                .catch((err) => {
                    reject('addLevelDBData Error: key=' + key + ', err=' + err);
                })
        });
    }

    addDataToLevelDB(value) {
        // because we are returning a promise we will need this to be able to
        // reference this outside 'this' *inside* the Promise constructor
        let self = this;
        return new Promise(function(resolve, reject) {
            self.getBlocksCount()
                .then((count) => {
                    self.addLevelDBData(count, value)
                        .then((value) => {
                            resolve(count)
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }

    // get the how many objects you have inserted in your DB
    // Implement this method
    getBlocksCount() {
        // because we are returning a promise we will need this to be able to
        // reference this outside 'this' *inside* the Promise constructor
        let self = this;
        return new Promise(function(resolve, reject) {
            let count = 0;
            self.db.createReadStream()
                .on('data', function(data) {
                    // Count each object inserted
                    count++;
                })
                .on('error', function(err) {
                    // reject with error
                    reject('createReadStream Error: err=' + err);
                })
                .on('close', function() {
                    //resolve with the i value
                    resolve(count)
                });
        });
    }

    // Get block by block Hash
    getBlockByHash(hash) {
        let self = this;
        let block = null;
        return new Promise(function(resolve, reject) {
            self.db.createReadStream()
                .on('data', function(data) {
                    if (data.value.hash === hash) {
                        block = data;
                    }
                })
                .on('error', function(err) {
                    reject(err)
                })
                .on('close', function() {
                    resolve(block);
                });
        });
    }

    // Get block by wallet Address
    getBlockByAddress(address) {
        let self = this;
        let block = [];
        return new Promise(function(resolve, reject) {
            self.db.createReadStream()
                .on('data', function(data) {
                    if (data.value.body.address === address) {
                        block.push(data);
                    }
                })
                .on('error', function(err) {
                    reject(err)
                })
                .on('close', function() {
                    resolve(block);
                });
        });
    }

}





// Export the class
module.exports.LevelSandbox = LevelSandbox;


// const ls = new LevelSandbox();
//
// (function theLoop(i) {
//   setTimeout(function() {
//     ls.addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);
