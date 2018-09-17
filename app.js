// require('dotenv').load();
var express = require ('express')
var app = express()
var fs = require('fs')
const body_parser = require('body-parser');
const importEnv = require('import-env');
const port = process.env.PORT || 8000;

if (app.get('env') === 'development') {
  // no stacktraces leaked to user
  /* TEST WITH COMMAND
  NODE_ENV=production PORT=5000 node app.js
  */
  /* Setting the environment variable to dictate which DB */
  environment = {environment: 'development'};
  app.use(function(err, req, res, next) {
    res.status( err.code || 500 )
    .json({
      status: 'error',
      message: err
    });
  });
} else {
  environment = {environment: 'production'};
}
module.exports.environment = app.get('env');
var db = require('./queries');

app.use(body_parser.urlencoded({extended: false}));
app.set('view engine', 'hbs');
app.use(express.static('public'));


app.get('/', function(req, res){
  response = '';
  res.render('index.hbs', {'response':response});
});

app.get('/api/identities', db.getAllIdentities);
app.get('/api/identities/:id', db.getSingleIdentity);
app.post('/api/identities', db.createIdentity);
app.get('/api/firebase/:slug', db.readUserData);
app.get('/api/token/:username', db.token);
app.get('/api/parsetoken', db.parseToken);
app.get('/api/questions', db.sendQuestions);
app.post('/api/submitanswers', db.submitAnswers);
app.get('/api/storj/upload', db.storjUploadFile);
app.get('/api/storj/bucket/get', db.storjGetBucketId);
app.get('/api/storj/bucket/list', db.storjListBuckets);
app.get('/api/storj/bucket/create', db.storjCreateBucket);
app.get('/api/storj/bucket/files', db.storjBucketListFiles);
app.get('/api/csv', db.csvParser);

app.listen(port, function(){
  console.log('listening on port ' + port)
});
