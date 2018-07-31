// require('dotenv').load();
var express = require ('express')
var app = express()
var fs = require('fs')
var axios = require ('axios')
const body_parser = require('body-parser');
const importEnv = require('import-env');
const port = process.env.PORT || 8000;

// const { Client } = require('pg');
//
// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true,
// });
//
// client.connect();
//
// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//   if (err) throw err;
//   for (let row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
//   client.end();
// });

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

/* Date Time Conversion */
var regularTimestamp = new Date()
console.log("Time is: ", regularTimestamp)
var time = "2018-07-13T00:02:59.781Z" //sample format of Date()
console.log("Parsed regularTimestamp: ",Date.parse(time));//converts into Unix epoch

var epochTimestamp = Date.now()//returns time in milliseconds from Unix epoch
console.log("epoch time: ", epochTimestamp)
var d = new Date(epochTimestamp)
console.log("Converted epochTimestamp to regularTimestamp",d)


app.use(body_parser.urlencoded({extended: false}));
app.set('view engine', 'hbs');
app.use(express.static('public'));


app.get('/', function(req, res){
  response = '';
  res.render('index.hbs', {'response':response});
});


app.get('/api/puppies', db.getAllPuppies);
app.get('/api/puppies/:id', db.getSinglePuppy);
app.post('/api/puppies', db.createPuppy);
app.put('/api/puppies/:id', db.updatePuppy);
app.delete('/api/puppies/:id', db.removePuppy);

app.get('/api/identities', db.getAllIdentities);
app.get('/api/identities/:id', db.getSingleIdentity);
app.post('/api/identities', db.createIdentity);
app.get('/api/firebase/:slug', db.readUserData);
app.get('/api/jwt', db.tokenize);


app.listen(port, function(){
  console.log('listening on port ' + port)
});
