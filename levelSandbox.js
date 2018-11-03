/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/
// Importing the module 'level'
const level = require('level');
// Declaring the folder path that store the data
const chainDB = './chaindata';
// Declaring a class
class LevelSandbox {
  // Declaring the class constructor
  constructor() {
    this.db = level(chainDB);
  }

  // Get data from levelDB with key (Promise)
  getLevelDBData(key) {
    // because we are returning a promise we will need this to be able to
    // reference this outside 'this' *inside* the Promise constructor
    let self = this;

    return new Promise(function(resolve, reject) {
      // self.db.get(key, (err, value) => {
      //   if (err) {
      //     if (err.type == 'NotFoundError') {
      //       resolve(undefined);
      //     } else {
      //       console.log('Block ' + key + ' get failed', err);
      //       reject(err);
      //     }
      //   } else {
      //     resolve(value);
      //   }
      // });
      self.db.get(key)
        .then((value) => {resolve(value)})
        .catch((err) => {reject('Block ' + key + ' get failed : ' + err)})
    });
  }

  // Add data to levelDB with key and value (Promise)
  addLevelDBData(key, value) {
    // because we are returning a promise we will need this to be able to
    // reference this outside 'this' *inside* the Promise constructor
    let self = this;

    return new Promise(function(resolve, reject) {
      self.db.put(key, value)
        .then(() => {resolve(value)})
        .catch((err) => { reject('Block ' + key + ' submission failed : ' + err); })
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
            .then((value) => {resolve(count)})
            .catch((err) => {reject(err)})
        })
        .catch((err) => {reject(err)})
    });
  }

  // get the how many objects you have inserted in your DB
  // Implement this method
  getBlocksCount() {
    // because we are returning a promise we will need this to be able to
    // reference this outside 'this' *inside* the Promise constructor
    let self = this;

    return new Promise(function(resolve, reject) {
      let i = 0;
      self.db.createReadStream()
        .on('data', function(data) {
          // Count each object inserted
          i++;
        })
        .on('error', function(err) {
          // reject with error
          reject('Unable to read data stream : ' + err);
        })
        .on('close', function() {
          //resolve with the i value
          resolve(i)
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
