var promise = require('bluebird');
var environment = require('./app');
var util = require('util');
var parseString = require('xml2js').parseString;
var jwt = require('jsonwebtoken');
var axios = require('axios');
var FIXIE_URL = process.env.FIXIE_URL;
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

if (environment.environment === 'development'){
  var db = pgp(DATABASE_URL);
} else {
  var cn = {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      port: 5432
  };
  var db = pgp(cn);
}


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

    // res.status(200).send(decoded);
    console.log("Decoded: ", decoded);

    parseXMLResponse(process.env.xml);

/*Using axios*/
    var config = { proxy: { host: process.env.FIXIE_URL_HOST, port: process.env.FIXIE_URL_PORT } }
      // axios.get(url, config)
      // .then(result => {})
      // .catch(error => {console.log(error)})

/*Using requests*/
    // const request = require('request')
    // const fixieRequest = request.defaults({'proxy': process.env.FIXIE_URL});
    //
    // fixieRequest('http://www.example.com', (err, res, body) => {
    //   console.log(`Got response: ${res.statusCode}`);
    // });

    axios.post(`https://web.idologylive.com/api/idiq.svc?username=${USERNAME}&password=${PASSWORD}&firstName=${data.firstName}&lastName=${data.lastName}&address=${data.address}&zip=${data.zip}`, config)
    // axios.post(`https://web.idologylive.com/api/idiq.svc?username=${USERNAME}&password=${PASSWORD}&firstName=${req.body.firstName}&lastName=${req.body.lastName}&address=${req.body.address}&zip=${req.body.zipCode}`)
      .then (res => {
        console.log(res.data)
      })
      .catch(error => {
        console.log(error)
      })
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
  rootRef.child('idology').child(username).set({
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
      // console.log(questions, questions.length)
      // var questionOne = result.response.questions[0].question[0]
      // var promptOne = questionOne.prompt[0]
      for (i = 0; i < questions.length; i++) {
        console.log(questions[i], "number : ", i)
      }
      res.status(200)
        .json({questions});
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
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    res.status(200).send(decoded);
  });
}

module.exports = {
  getAllIdentities: getAllIdentities,
  getSingleIdentity: getSingleIdentity,
  createIdentity: createIdentity,
  readUserData: readUserData,
  token: token,
  parseToken: parseToken,
  sendQuestions: sendQuestions
};

/*
============
  RESOURCES
=============
http://mherman.org/blog/2016/03/13/designing-a-restful-api-with-node-and-postgres/
*/
