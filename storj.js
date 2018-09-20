const importEnv = require('import-env');


function storjUploadFile(){
  const { Environment, mnemonicGenerate, mnemonicCheck, utilTimestamp } = require('storj');
  var STORJ_BRIDGE_USER = process.env.STORJ_BRIDGE_USER;
  var STORJ_BRIDGE_PASS = process.env.STORJ_BRIDGE_PASS;

  const storj = new Environment({
    bridgeURL: 'https://api.storj.io',
    bridgeUser: STORJ_BRIDGE_USER,
    bridgePass: STORJ_BRIDGE_PASS,
    encryptionKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    logLevel: 4
  });

/* Testing API out */
  // var mnemonic = mnemonicGenerate(128);
  // console.log('Mnemonic geneator: ', mnemonic)
  // console.log('Mnemonic check: ', mnemonicCheck(mnemonic))
  // console.log('Time: ', utilTimestamp())

  const bucketId = '2443acd6222d73b373cbf18e';
  const filePath = './handwriting_7_Awesome_5_sample.data';
  const julie = storj.getInfo(function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log("GetInfo Function: ",result)
  })
  const state = storj.storeFile(bucketId, filePath, {
    filename: 'handwriting_7_Awesome_5_sample.data',
    progressCallback: function(progress, downloadedBytes, totalBytes) {
      console.log('progress:', progress);
    },
    finishedCallback: function(err, fileId) {
      if (err) {
        return console.error(err);
      }
      console.log('File complete:', fileId);
      storj.destroy();
    }
  });
}


function storjGetBucketId () {
  const { Environment } = require('storj');
  var STORJ_BRIDGE_USER = process.env.STORJ_BRIDGE_USER;
  var STORJ_BRIDGE_PASS = process.env.STORJ_BRIDGE_PASS;

  const storj = new Environment({
    bridgeUrl: 'https://api.storj.io',
    bridgeUser: STORJ_BRIDGE_USER,
    bridgePass: STORJ_BRIDGE_PASS,
    encryptionKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    logLevel: 0
  });

  const testBucketName = 'HERC-SUPPLYCHAIN';
  storj.getBucketId(testBucketName, function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('info.name:', result.name);
    console.log('info.id:', result.id);
    storj.destroy();
  });
}


function storjListBuckets () {
  const { Environment } = require('storj');
  var STORJ_BRIDGE_USER = process.env.STORJ_BRIDGE_USER;
  var STORJ_BRIDGE_PASS = process.env.STORJ_BRIDGE_PASS;

  const storj = new Environment({
    bridgeUrl: 'https://api.storj.io',
    bridgeUser: STORJ_BRIDGE_USER,
    bridgePass: STORJ_BRIDGE_PASS,
    encryptionKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    logLevel: 0
  });

  storj.getInfo(function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('info:', result);

    storj.getBuckets(function(err, result) {
      if (err) {
        return console.error(err);
      }
      console.log('buckets:', result);
      storj.destroy();
    });
  });
}


function storjCreateBucket () {
  const { Environment } = require('storj');
  var STORJ_BRIDGE_USER = process.env.STORJ_BRIDGE_USER;
  var STORJ_BRIDGE_PASS = process.env.STORJ_BRIDGE_PASS;

  const storj = new Environment({
    bridgeUrl: 'https://api.storj.io',
    bridgeUser: STORJ_BRIDGE_USER,
    bridgePass: STORJ_BRIDGE_PASS,
    encryptionKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    logLevel: 0
  });

  const testBucketName = 'test-' + Date.now();
  storj.createBucket(testBucketName, function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('info:', result);
    storj.destroy();
  });
}


function storjBucketListFiles() {
  const { Environment } = require('storj');
  var STORJ_BRIDGE_USER = process.env.STORJ_BRIDGE_USER;
  var STORJ_BRIDGE_PASS = process.env.STORJ_BRIDGE_PASS;

  const storj = new Environment({
    bridgeUrl: 'https://api.storj.io',
    bridgeUser: STORJ_BRIDGE_USER,
    bridgePass: STORJ_BRIDGE_PASS,
    encryptionKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    logLevel: 0
  });

  var bucketID = "2443acd6222d73b373cbf18e"
  storj.listFiles(bucketID, function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('Bucket Files:', result);
    storj.destroy();
  });
}


module.exports = {
  storjUploadFile: storjUploadFile,
  storjGetBucketId: storjGetBucketId,
  storjListBuckets: storjListBuckets,
  storjCreateBucket: storjCreateBucket,
  storjBucketListFiles: storjBucketListFiles,
};
