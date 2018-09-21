const importEnv = require('import-env');
const { Environment, mnemonicGenerate, mnemonicCheck, utilTimestamp } = require('storj');
var STORJ_BRIDGE_USER = process.env.STORJ_BRIDGE_USER;
var STORJ_BRIDGE_PASS = process.env.STORJ_BRIDGE_PASS;

const storj = new Environment({
  bridgeUrl: 'https://api.storj.io',
  bridgeUser: STORJ_BRIDGE_USER,
  bridgePass: STORJ_BRIDGE_PASS,
  encryptionKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  logLevel: 4
});


function storjUploadFile(){
/* Testing API out */
  // var mnemonic = mnemonicGenerate(128);
  // console.log('Mnemonic geneator: ', mnemonic)
  // console.log('Mnemonic check: ', mnemonicCheck(mnemonic))
  // console.log('Time: ', utilTimestamp())

  const bucketId = '2443acd6222d73b373cbf18e';
  const filePath = 'upload-files/handwriting_7_Awesome_5_sample.data';
  // const julie = storj.getInfo(function(err, result) {
  //   if (err) {
  //     return console.error(err);
  //   }
  //   console.log("GetInfo Function: ",result)
  // })
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

function storjDownloadFile () {
  // Downloads a file, return state object
  var downloadFilePath = 'download-files/storj-test-download.data';
  var bucketId = '2443acd6222d73b373cbf18e';
  var fileId = '63ABF516E1DCC5E5B337EACD';
  // storj.resolveFile(bucketId, fileId, downloadFilePath)


  // download file that was just uploaded
    storj.resolveFile(bucketId, fileId, downloadFilePath, {
      progressCallback: function(progress, downloadedBytes, totalBytes) {
        console.log('Progress: %d, downloadedBytes: %d, totalBytes: %d',
                    progress, downloadedBytes, totalBytes);
      },
      finishedCallback: function(err) {
        if (err) {
          return console.error(err);
        }
        console.log('File download complete');
        storj.destroy();
      }
    });

}

function storjDeleteFile () {
  var bucketId = '2443acd6222d73b373cbf18e';
  var fileId = '63ABF516E1DCC5E5B337EACD';
  storj.deleteFile(bucketId, fileId, function(err, result) {
    if (err) {
      console.error(err);
    }
    console.log('File Deleted.');
    storj.destroy();
  })
}


function storjGetBucketId () {
  var testBucketName = 'HERC-SUPPLYCHAIN';
  storj.getBucketId(testBucketName, function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('info.name:', result.name);
    console.log('info.id:', result.id);
    storj.destroy();
  });
}

function storjDeleteBucketId (req, res, next){
  var bucketId = req.params.id;
  storj.deleteBucket(bucketId, function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('Deleted bucket: ', bucketID)
  })
}


function storjListBuckets () {
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
  storjDownloadFile: storjDownloadFile,
  storjGetBucketId: storjGetBucketId,
  storjListBuckets: storjListBuckets,
  storjCreateBucket: storjCreateBucket,
  storjBucketListFiles: storjBucketListFiles,
  storjDeleteBucketId: storjDeleteBucketId,
  storjDeleteFile: storjDeleteFile
};
