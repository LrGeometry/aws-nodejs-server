var promise = require('bluebird');
var environment = require('./app');
var util = require('util');
var parseString = require('xml2js').parseString;
var jwt = require('jsonwebtoken');
var FIXIE_URL = process.env.FIXIE_URL;
var request = require('request')
const uuidv4 = require('uuid/v4');
// var ApiKeys = require('./firebase')
const importEnv = require('import-env');
var config = {
      apiKey: process.env.FIREBASE_APIKEY,
      authDomain: process.env.FIREBASE_AUTHDOMAIN,
      databaseURL: process.env.FIREBASE_DBURL,
      projectId: process.env.FIREBASE_PROJECTID,
      storageBucket: process.env.FIREBASE_STORAGEBUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID
    }
var firebase = require('firebase')
firebase.initializeApp(config);
const rootRef = firebase.database().ref();

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var DATABASE_URL = "postgres://127.0.0.1:5432/hercules_node";
var cn = {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: 5432
};
var db = pgp(cn);
// if (environment.environment === 'development'){
//   var db = pgp(DATABASE_URL);
// } else {
//   var cn = {
//       host: process.env.DB_HOST,
//       database: process.env.DB_NAME,
//       user: process.env.DB_USERNAME,
//       password: process.env.DB_PASSWORD,
//       port: 5432
//   };
//   var db = pgp(cn);
// }


function getAllIdentities(req, res, next) {
  db.any('select * from identity')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL identities'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function getSingleIdentity(req, res, next) {
  var identityID = parseInt(req.params.id);
  db.one('select * from identity where id = $1', identityID)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE identity'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


/*
*
* TODO: Write a function that iterates through array, append to a string
*
*/
var USERNAME = process.env.USERNAME;
var PASSWORD = process.env.PASSWORD;
var data = {
      'username' : USERNAME, //YOUR ExpectID USERNAME (16)
      'password' : PASSWORD, //YOUR ExpectID PASSWORD
      'invoice': '', //YOUR INVOICE OR ORDER NUMBER (30)
      'amount': '', //ORDER AMOUNT
      'shipping': '', //SHIPPING AMOUNT
      'tax': '',//TAX AMOUNT
      'total': '',//TOTAL AMOUNT(SUM OF THE ABOVE)
      'idType': '',//TYPE OF ID PROVIDED
      'idIssuer': '',//ISSUING AGENCY OF ID
      'idNumber': '',//NUMBER ON ID
      'paymentMethod': '',//PAYMENT METHOD
      'firstName' : 'JOHN',
      'lastName' : 'SMITH',
      'address': '222333 peachtree place', //STREET ADDRESS
      'city': '',
      'state': '', //STATE (2)
      'zip' : '30318', //5-DIGIT ZIP CODE (5)
      'ssnLast4': '3333',//LAST 4 DIGITS OF SSN(4)
      'ssn': '112-22-3333', //FULL SSN
      'dobMonth': '02',//MONTH OF BIRTH (2)
      'dobDay': '28',//DAY OF BIRTH (2)
      'dobYear': '1975', //YEAR OF BIRTH (4)
      'ipAddress': '',//IP ADDRESS E.G. 11.111.111.11
      'email': '',//EMAIL ADDRESS
      'telephone': '', //PHONE NUMBER
      'sku': '',
      'uid': '', //USER ID (EXTERNAL APPLICATION)
      'altAddress': '',
      'altCity': '',
      'altState': '',
      'altZip': '',
    }

function parseXMLResponse(xml) {
  var parseString = require('xml2js').parseString;
  parseString(xml, function (err, result) {
      // console.log(util.inspect(result, false, null))
      var resultKey = result.response.results.key
      var summaryResults = result.response['summary-result'].key
      var qualifier = result.response.qualifiers[0].qualifier[0].key[0]
      var question = result.response.questions[0].question
      var differentiatorQuestion = result.response['differentiator-questions']
      if (differentiatorQuestion) {
        /*
        Send differentiator question and answers to Frontend.
        Post response to https://web.idologylive.com/api/differentiator-answer.svc https://web.idologylive.com/api/differentiator-answer-iq.svc
        refer to "API Guide - ExpectID IQ(3).pdf"
        */
      }
      if (question) {
        //Submit answers with : https://web.idologylive.com/api/idliveq-answers.svc
      }
  });
}

function createIdentity(req, res, next) {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.ENCRYPTION_KEY, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    console.log("Decoded: ", decoded);

    parseXMLResponse(process.env.xml);

    request.post({
      proxy: FIXIE_URL,
      url: 'https://web.idologylive.com/api/idiq.svc',
      form: data
    }, function(error, response, body){
      console.log(body)
    });

    // axios.post(`https://web.idologylive.com/api/idiq.svc?username=${USERNAME}&password=${PASSWORD}&firstName=${req.body.firstName}&lastName=${req.body.lastName}&address=${req.body.address}&zip=${req.body.zipCode}`)
    // axios.post(`https://web.idologylive.com/api/idiq.svc?username=${USERNAME}&password=${PASSWORD}&firstName=${data.firstName}&lastName=${data.lastName}&address=${data.address}&zip=${data.zip}`,
    //   { proxy:
    //     { host: process.env.FIXIE_URL_HOST, port: process.env.FIXIE_URL_PORT }
    //   })
    //   .then (res => {
    //     console.log(res.data)
    //   })
    //   .catch(error => {
    //     console.log(error)
    //   })

    writeUserData(req.body.edgeAccount, req.body.firstName, req.body.lastName, req.body.address, req.body.zipCode)

    var parseString = require('xml2js').parseString;
    parseString(process.env.xml, function (err, result) {
        var questions = result.response.questions[0].question
        res.status(200)
          .json({questions});
      });

    db.none('insert into identity(edgeAccount, firstName, lastName, address, zipCode, epochTimestamp)' +
        'values(${edgeAccount}, ${firstName}, ${lastName}, ${address}, ${zipCode},'+ Date.now() +')',
      req.body)
      .then(function () {
        console.log('Inserted on identity into PostgreSQL DB')
        // res.status(200)
        //   .json({
        //     status: 'success',
        //     message: 'Inserted one identity'
        //   });
      })
      .catch(function (err) {
        return next(err);
      });
    });
}


function writeUserData(username, firstName, lastName, zipCode, address) {
  var id = uuidv4()
  /* TODO: Return the UUID to the front, store it in redux, encode it in the authToken */
  console.log("UUID: ", id)
  rootRef.child('idology').child(username).set({
    id: id,
    username: username,
    firstName: firstName,
    lastName : lastName,
    zipCode : zipCode,
    address : address,
    epochTimestamp: Date.now()
  }, function() {
    return rootRef
      .child('idology')
      .child(username)
      .once('value')
      .then(function(snapshot) {
        console.log(snapshot.val())
      });
  });
}


/* This is a debugging function. It returns a single user from firebase */
function readUserData(req, res, next) {
  var username = req.params.slug;
  return rootRef
    .child('idology')
    .child(username)
    .once('value')
    .then(function(snapshot) {
      console.log(snapshot.val())
      res.status(200)
        .json({
          status: 'success',
          data: snapshot.val(),
          message: 'Retrieved ONE user ' + username
        });
    });
}

function sendQuestions(req, res, next){
  var parseString = require('xml2js').parseString;
  parseString(process.env.xml, function (err, result) {
      // console.log(util.inspect(result, false, null))
      var questions = result.response.questions[0].question
      for (i = 0; i < questions.length; i++) {
        console.log(questions[i], "number : ", i)
      }
      res.status(200)
        .json({questions});
    });
}

function submitAnswers (req, res, next) {
  console.log("======SCRIPTY1",req.body)
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.ENCRYPTION_KEY, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    res.status(200).send(decoded);

    // var data = {['4','3','1']:[]} /* NOTE: Looks like {['4','3','1']:[]}*/

    request.post({
      proxy: FIXIE_URL,
      url: 'https://web.idologylive.com/api/idliveq-answers.svc',
      form: data
    }, function(error, response, body){
      console.log(body)
    });

    /*
    TODO: Make a post request to IDOLOGY: https://web.idologylive.com/api/idliveq-answers.svc
    TODO: use decoded to grab UUID/username. update firebase with datetime of submission and boolean value
    */

  });
}


function token(req, res, next) {
  var username = req.params.username
  var token = jwt.sign({ data: 'some_payload', username: username }, process.env.ENCRYPTION_KEY, {
    expiresIn: 86400 //expires in 24 hours
  });
  res.status(200).json(token);
  // res.status(200).send({ auth: true, token: token });
}

function parseToken(req, res, next) {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.ENCRYPTION_KEY, function(err, decoded) {
    console.log("TOKEN: ", token)
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    res.status(200).send(decoded);
  });
}


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
  var mnemonic = mnemonicGenerate(128);
  console.log('Mnemonic geneator: ', mnemonic)
  console.log('Mnemonic check: ', mnemonicCheck(mnemonic))
  console.log('Time: ', utilTimestamp())

  const bucketId = 'AC67BBD5A7A6E36DBDAFF71A';
  const filePath = './handwriting_7_Awesome_5.data';
  const julie = storj.getInfo(function(err, result) {
    console.log(result)
  })
  const state = storj.storeFile(bucketId, filePath, {
    filename: 'handwriting_7_Awesome_5.data',
    progressCallback: function(progress, downloadedBytes, totalBytes) {
      console.log('progress:', progress);
    },
    finishedCallback: function(err, fileId) {
      if (err) {
        return console.error(err);
      }
      console.log('File complete:', fileId);
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

  const testBucketName = 'test-bucket';
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
  getAllIdentities: getAllIdentities,
  getSingleIdentity: getSingleIdentity,
  createIdentity: createIdentity,
  readUserData: readUserData,
  token: token,
  parseToken: parseToken,
  sendQuestions: sendQuestions,
  submitAnswers: submitAnswers,
  storjUploadFile: storjUploadFile,
  storjGetBucketId: storjGetBucketId,
  storjListBuckets: storjListBuckets,
  storjCreateBucket: storjCreateBucket,
  storjBucketListFiles: storjBucketListFiles
};

/*
============
  RESOURCES
=============
http://mherman.org/blog/2016/03/13/designing-a-restful-api-with-node-and-postgres/
*/
