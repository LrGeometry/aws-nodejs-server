var firebase = require('firebase')
const importEnv = require('import-env');
const { Environment, mnemonicGenerate, mnemonicCheck, utilTimestamp } = require('storj');
var base64Img = require('base64-img');
function instantiateStorjEnvironment(){
  const storj = new Environment({
    bridgeUrl: 'https://api.storj.io',
    bridgeUser: process.env.STORJ_BRIDGE_USER,
    bridgePass: process.env.STORJ_BRIDGE_PASSS,
    encryptionKey: process.env.STORJ_ENCRYPTION_KEY,
    logLevel: 0 // Range: 0 - 4
  });
  return storj
}

function testStorjUpload(){
  /* Check if Bridge is operational: https://status.storj.io/ */
  let storj = instantiateStorjEnvironment()
  const bucketId = 'ac67bbd5a7a6e36dbdaff71a';
  const filePath = 'upload-files/handwriting_7_Awesome_5_sample.data';
  const state = storj.storeFile(bucketId, filePath, {
    filename: 'test_' + Date.now() + '.data',
    progressCallback: function(progress, downloadedBytes, totalBytes) {
      console.log('progress:', progress);
    },
    finishedCallback: function(err, fileId) {
      if (err) { return console.error(err)}
      console.log('Success Storj file upload:', fileId);
      storj.destroy();
    }
  });
}

function uploadFile(req, res, next){
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    let storj = instantiateStorjEnvironment()
    var cleanedBody = JSON.parse(Object.keys(req.body)[0])
    var base64 = cleanedBody.data
    var obj = {}
    obj.key = cleanedBody.key // {key: 'images'}
    obj.hash = null // {key: 'images', hash: null}

    base64Img.img(base64, 'upload-files', '1', function(err, filepath) {
      if (err) {console.log("Storj Upload Error: ", err)}

      const bucketId = 'ac67bbd5a7a6e36dbdaff71a';
      const filePath = filepath;
      const state = storj.storeFile(bucketId, filePath, {
        filename: 'transaction_image_' + Date.now() + '.jpg', //could be named with identifying information
        progressCallback: function(progress, downloadedBytes, totalBytes) {
          console.log('progress:', progress);
        },
        finishedCallback: function(err, fileId) {
          if (err) { return console.error(err)}
          console.log('Success Storj file upload:', fileId);
          obj.hash = fileId
          res.send(obj);
          storj.destroy();
        }
      });
    })
  })
  .catch(err => {
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  })
}

function downloadFile () {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    // Downloads a file, return state object
    let storj = instantiateStorjEnvironment()
    var downloadFilePath = 'download-files/storj-test-download.data';
    var bucketId = 'ac67bbd5a7a6e36dbdaff71a';
    var fileId = '63ABF516E1DCC5E5B337EACD';
    // storj.resolveFile(bucketId, fileId, downloadFilePath)


    // download file that was just uploaded
      storj.resolveFile(bucketId, fileId, downloadFilePath, {
        progressCallback: function(progress, downloadedBytes, totalBytes) {
          console.log('Progress: %d, downloadedBytes: %d, totalBytes: %d',
                      progress, downloadedBytes, totalBytes);
        },
        finishedCallback: function(err) {
          if (err) { return console.error(err)}
          console.log('File download complete');
          storj.destroy();
        }
      });
    })
  .catch(err => {
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  })
}

function deleteFile () {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    let storj = instantiateStorjEnvironment()
    var bucketId = 'ac67bbd5a7a6e36dbdaff71a';
    var fileId = '63ABF516E1DCC5E5B337EACD';
    storj.deleteFile(bucketId, fileId, function(err, result) {
      if (err) { return console.error(err)}
      console.log('File Deleted.');
      storj.destroy();
    })
  })
  .catch(err => {
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  })
}


function getBucketId () {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    let storj = instantiateStorjEnvironment()
    var testBucketName = 'HERC-SUPPLYCHAIN';
    storj.getBucketId(testBucketName, function(err, result) {
      if (err) { return console.error(err)}
      console.log('info.name:', result.name);
      console.log('info.id:', result.id);
      storj.destroy();
    });  })
  .catch(err => {
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  })
}

function deleteBucketId (req, res, next){
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    let storj = instantiateStorjEnvironment()
    var bucketId = req.params.id;
    storj.deleteBucket(bucketId, function(err, result) {
      if (err) { return console.error(err)}
      console.log('Deleted bucket: ', bucketID)
    })
  })
  .catch(err => {
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  })
}


function listBuckets () {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    let storj = instantiateStorjEnvironment()
    storj.getInfo(function(err, result) {
      if (err) { return console.error(err)}
      console.log('info:', result);
      storj.getBuckets(function(err, result) {
        if (err) { return console.error(err)}
        console.log('buckets:', result);
        storj.destroy();
      });
    });
  })
  .catch(err => {
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  })
}


function createBucket () {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    let storj = instantiateStorjEnvironment()
    const testBucketName = 'test-' + Date.now();
    storj.createBucket(testBucketName, function(err, result) {
      if (err) { return console.error(err)}
      console.log('info:', result);
      storj.destroy();
    });
  })
  .catch(err => {
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  })
}


function bucketListFiles() {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    let storj = instantiateStorjEnvironment()
    var bucketID = "2443acd6222d73b373cbf18e"
    storj.listFiles(bucketID, function(err, result) {
      if (err) { return console.error(err)}
      console.log('Bucket Files:', result);
      storj.destroy();
    });
  })
  .catch(err => {
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  })
}


module.exports = {
  uploadFile: uploadFile,
  downloadFile: downloadFile,
  getBucketId: getBucketId,
  listBuckets: listBuckets,
  createBucket: createBucket,
  bucketListFiles: bucketListFiles,
  deleteBucketId: deleteBucketId,
  deleteFile: deleteFile,
  testStorjUpload:testStorjUpload
};
