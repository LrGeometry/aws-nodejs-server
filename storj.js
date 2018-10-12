const importEnv = require('import-env');
const { Environment, mnemonicGenerate, mnemonicCheck, utilTimestamp } = require('storj');
var STORJ_BRIDGE_USER = process.env.STORJ_BRIDGE_USER;
var STORJ_BRIDGE_PASS = process.env.STORJ_BRIDGE_PASS;
var base64Img = require('base64-img');

const storj = new Environment({
  bridgeUrl: 'https://api.storj.io',
  bridgeUser: STORJ_BRIDGE_USER,
  bridgePass: STORJ_BRIDGE_PASS,
  encryptionKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  logLevel: 4
});

var body = { 'data:image/jpg;base64,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': '=' }

function uploadFile(req, res, next){
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
  var code = req.body
  console.log("unclean", code)
  // console.log("STORJ UPLOAD: ", Object.keys(code))
  // var cleancode = Object.keys(code)[0]
  // base64Img.img(Object.keys(code)[0], 'upload-files', '2', function(err, filepath) {
  //   if (err) {console.log(err)}
  //   console.log("success", filepath)
  // })

  // const bucketId = '2443acd6222d73b373cbf18e';
  // const filePath = 'upload-files/handwriting_7_Awesome_5_sample.data';
  // const state = storj.storeFile(bucketId, filePath, {
  //   filename: 'handwriting_7_Awesome_5_sample.data',
  //   progressCallback: function(progress, downloadedBytes, totalBytes) {
  //     console.log('progress:', progress);
  //   },
  //   finishedCallback: function(err, fileId) {
  //     if (err) {
  //       return console.error(err);
  //     }
  //     console.log('File complete:', fileId);
  //     res.send(fileId);
  //     storj.destroy();
  //   }
  // });
}

function downloadFile () {
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

function deleteFile () {
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
  var bucketId = req.params.id;
  storj.deleteBucket(bucketId, function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('Deleted bucket: ', bucketID)
  })
}


function listBuckets () {
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
