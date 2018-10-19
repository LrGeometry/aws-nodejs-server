const importEnv = require('import-env');
const { Environment, mnemonicGenerate, mnemonicCheck, utilTimestamp } = require('storj');
var STORJ_BRIDGE_USER = process.env.STORJ_BRIDGE_USER;
var STORJ_BRIDGE_PASS = process.env.STORJ_BRIDGE_PASS;
var base64Img = require('base64-img');

function instantiateStorjEnvironment(){
  const storj = new Environment({
    bridgeUrl: 'https://api.storj.io',
    bridgeUser: STORJ_BRIDGE_USER,
    bridgePass: STORJ_BRIDGE_PASS,
    encryptionKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    logLevel: 4
  });
  return storj
}

function uploadFile(req, res, next){
  let storj = instantiateStorjEnvironment()
/* Testing API out */
  // var mnemonic = mnemonicGenerate(128);
  // console.log('Mnemonic geneator: ', mnemonic)
  // console.log('Mnemonic check: ', mnemonicCheck(mnemonic))
  // console.log('Time: ', utilTimestamp())

  // const julie = storj.getInfo(function(err, result) {
  //   if (err) {
  //     return console.error(err);
  //   }
  //   console.log("GetInfo Function: ",result)
  // })

  var cleanedBody = JSON.parse(Object.keys(req.body)[0])
  var base64 = cleanedBody.data
  var obj = {}
  obj.key = cleanedBody.key // {key: 'images'}
  obj.hash = null // {key: 'images', hash: null}

  base64Img.img(base64, 'upload-files', '1', function(err, filepath) {
    if (err) {console.log(err)}
    console.log("success", filepath)

    const bucketId = '2443acd6222d73b373cbf18e';
    const filePath = filepath;
    const state = storj.storeFile(bucketId, filePath, {
      filename: 'transaction_image_' + Date.now() + '.jpg', //could be named with identifying information
      progressCallback: function(progress, downloadedBytes, totalBytes) {
        console.log('progress:', progress);
      },
      finishedCallback: function(err, fileId) {
        if (err) {
          return console.error(err);
        }
        console.log('File complete:', fileId);
        obj.hash = fileId
        res.send(obj);
        storj.destroy();
      }
    });
  })

}

function downloadFile () {
  // Downloads a file, return state object
  let storj = instantiateStorjEnvironment()
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

function deleteFile () {
  let storj = instantiateStorjEnvironment()
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


function getBucketId () {
  let storj = instantiateStorjEnvironment()
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

function deleteBucketId (req, res, next){
  let storj = instantiateStorjEnvironment()
  var bucketId = req.params.id;
  storj.deleteBucket(bucketId, function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('Deleted bucket: ', bucketID)
  })
}


function listBuckets () {
  let storj = instantiateStorjEnvironment()
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


function createBucket () {
  let storj = instantiateStorjEnvironment()
  const testBucketName = 'test-' + Date.now();
  storj.createBucket(testBucketName, function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('info:', result);
    storj.destroy();
  });
}


function bucketListFiles() {
  let storj = instantiateStorjEnvironment()
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
  uploadFile: uploadFile,
  downloadFile: downloadFile,
  getBucketId: getBucketId,
  listBuckets: listBuckets,
  createBucket: createBucket,
  bucketListFiles: bucketListFiles,
  deleteBucketId: deleteBucketId,
  deleteFile: deleteFile
};
