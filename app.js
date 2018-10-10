var express = require('express')
var app = express()
var fs = require('fs')
var Web3 = require('web3');
const body_parser = require('body-parser');
const importEnv = require('import-env');
const port = process.env.PORT || 8000;
var web3;
if (app.get('env') === 'development') {
  // no stacktraces leaked to user
  /* TEST WITH COMMAND
  NODE_ENV=production PORT=8000 node app.js
  */
  /* Setting the environment variable to dictate which DB */

  web3 = new Web3(process.env.INFURA_ROPSTEN);
  // console.log(web3, "ropsten")
  environment = { environment: 'development' };
  app.use(function (err, req, res, next) {
    res.status(err.code || 500)
      .json({
        status: 'error',
        message: err
      });

  });
} else {
   web3 = new Web3.setProvider(process.env.INFURA_MAIN);
  environment = { environment: 'production' };
}
module.exports.environment = app.get('env');
var db = require('./queries');
var storj = require('./storj');
var factom = require('./facTom');
var ipfs = require('./ipfs');

app.use(body_parser.urlencoded({ extended: false }));
app.set('view engine', 'hbs');
app.use(express.static('public'));


app.get('/', function (req, res) {
  response = '';
  res.render('index.hbs', { 'response': response });
});

app.post('/api/identities', db.createIdentity);
app.get('/api/firebase/:slug', db.readUserData);
app.get('/api/token/:username', db.token);
app.get('/api/parsetoken', db.parseToken);
app.get('/api/questions', db.sendQuestions);
app.post('/api/submitanswers', db.submitAnswers);
app.get('/api/check', db.checkIfUserSubmittedIdologyWithinLastThreeMonths);
app.get('/api/csv', db.csvParser);

app.get('/api/storj/upload', storj.uploadFile);
app.get('/api/storj/download', storj.downloadFile);
app.get('/api/storj/delete', storj.deleteFile);
app.get('/api/storj/bucket/get', storj.getBucketId);
app.get('/api/storj/bucket/list', storj.listBuckets);
app.get('/api/storj/bucket/create', storj.createBucket);
app.get('/api/storj/bucket/files', storj.bucketListFiles);
app.get('/api/storj/bucket/delete/:id', storj.deleteBucketId);

app.post('/api/factom/chain/add', factom.createChain);
app.get('/api/factom/entry/add', factom.createEntry);
app.get('/api/factom/entry/get', factom.getEntry);
app.get('/api/factom/entry/', factom.getAllEntries);
app.get('/api/factom/chain/iterate', factom.iterateChain);
app.get('/api/factom/chain/search', factom.searchChain);

app.get('/api/ipfs/get', ipfs.ipfsGetFile);
app.post('/api/ipfs/add', ipfs.ipfsAddFile);
app.get('/test', ipfs.testipfs);

app.listen(port, function(){
  console.log('listening on port ' + port)
  console.log('yeeyah')
});
