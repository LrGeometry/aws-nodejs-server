var environment = require('./app');
var util = require('util');
var parseString = require('xml2js').parseString;
var jwt = require('jsonwebtoken');
var FIXIE_URL = process.env.FIXIE_URL;
var request = require('request')
const uuidv4 = require('uuid/v4');
const importEnv = require('import-env');

var admin = require("firebase-admin");
var serviceAccount = require("./firebase.json");
admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
 databaseURL: "https://hercone-8025f.firebaseio.com"
});

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

/*
* TODO: Write a function that iterates through array, append to a string
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
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    request.post({
      proxy: FIXIE_URL,
      url: 'https://web.idologylive.com/api/idiq.svc',
      form: data
    }, function(error, response, body){
      console.log(body)
    });
    // parseXMLResponse(process.env.xml);
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

    writeUserData(req.body.edgeAccount, req.body.organizationName, req.body.firstName, req.body.lastName, req.body.address, req.body.zipCode)

    var parseString = require('xml2js').parseString;
    parseString(process.env.xml, function (err, result) {
      var questions = result.response.questions[0].question
      res.status(200)
      .json({questions});
    });

  })
  .catch(err => {
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  })

}

function numDaysBetween(d1, d2){
  var diff = Math.abs(d1 - d2);
  console.log("Days in between.... ", diff / (1000 * 60 * 60 * 24));
  return diff / (1000 * 60 * 60 * 24)
}

function checkIfUserSubmittedIdologyWithinLastThreeMonths(req, res, next) {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    return rootRef
    .child('idology')
    .child(user_login.user.uid)
    .once('value', function(snapshot) {
      if (snapshot.exists()) {
        var d1 = snapshot.val().epochTimestamp
        var d2 = Date.now()
        // var d3 = new Date(2018, 6, 1) // Uncomment this line if you want to test when numDaysBetween > 90
        if (numDaysBetween(d1, d2) < 90) {
          res.status(200)
          .json({
            status: 'true',
            message: 'User, ' + user_login.user.uid + ', is up-to-date.'
          });
        } else {
          res.status(200)
          .json({
            status: 'false',
            message: 'User, ' + user_login.user.uid + ', is not up-to-date.'
          });
        }
      } else {
        res.status(200)
        .json({
          status: 'false',
          message: 'User, ' + user_login.user.uid + ', is not up-to-date.'
        });
      }
    });
  })
  .catch(err => {
    console.log(err, "error decoding token")
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
  })
}


function writeUserData(username, organizationName, firstName, lastName, zipCode, address) {
  var id = uuidv4()
  /* TODO: Return the UUID to the front, store it in redux, encode it in the authToken */
  console.log("UUID: ", id)
  rootRef.child('idology').child(username).set({
    id: id,
    organizationName: organizationName,
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
        console.log("Wrote User Data: ", snapshot.val())
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
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    request.post({
      proxy: FIXIE_URL,
      url: 'https://web.idologylive.com/api/idliveq-answers.svc',
      form: data
    }, function(error, response, body){
      console.log(body)
    });
  })
  .catch(err => {
    console.log(err)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
  })
    // TODO: Make a post request to IDOLOGY: https://web.idologylive.com/api/idliveq-answers.svc
    // TODO: use decoded to grab UUID/username. update firebase with datetime of submission and boolean value
}


function token(req, res, next) {
  let uid = req.params.username
  let additionalClaims = {
    premiumAccount: true
  }
  admin.auth().createCustomToken(uid)
    .then((customToken) => {
      console.log("Made it into the Token: ", customToken)
      res.status(200).json(customToken);
    })
    .catch(err => { console.log(err) })

  // var token = jwt.sign({ data: 'some_payload', username: username }, process.env.ENCRYPTION_KEY, {
  //   expiresIn: 86400 //expires in 24 hours
  // });
  // console.log("Made it into the Token: ", token)

}

function parseToken(req, res, next) {
  // var token = req.headers['authorization'];
  let token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTUzOTkwNTA1OSwiZXhwIjoxNTM5OTA4NjU5LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay15d2RvdUBoZXJjb25lLTgwMjVmLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGsteXdkb3VAaGVyY29uZS04MDI1Zi5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6ImhlcmNzdGFjayJ9.NBSCJN8LgGP2LxC7TL_F51v1gb_oe7rf040HyZnxBUEdQRqd1-npP5rrQg4GkGj0YiSKSacILiPvHXur4ug25KFLsa_aAAZI2ch1YY53khepMztIRIq09V9iAE4Bueso6E4lrvPXryaGHZj5YvOnCdY2LYV6lsRhleah1PYovxl9_wNci8Yl8mRS_2GtcxIMPyJC5x7wyjUiKIUoKwDmwtxAoJEA7oVgAcKhdjtEqblE3w_TWrMwXFc0IgDtVv5EL2OrokvgIYfDzSWghCFWLYItofloSvL-n2SxTDQ0EwxaQ6O79EXtigCsB-Rw3gdvukDYtdZQcNOEp-fnkos74A'
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    console.log("decoded token:", user_login)
    res.status(200).send(user_login);
  })
  .catch(err => {
    console.log(err, "error decoding token")
    res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
  })

  // var token = req.headers['authorization'];
  // if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  //
  // jwt.verify(token, process.env.ENCRYPTION_KEY, function(err, decoded) {
  //   console.log("TOKEN: ", token)
  //   if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  //
  //   res.status(200).send(decoded);
  // });
}


function csvParser(req, res, next) {
  let cleanedBody = Object.keys(req.body)[0]//string
  let data = cleanedBody.split('"')[7].split("\r\n")
  var dict = {};
  var acceptedKeys = ['Name', 'Class', 'Date', 'Time', 'Duration', 'Grade']
  var elements = ['Al','Ni','Cu','Rh','Pd','Ag','Cd','Sn','Sb','Pt','Au','Pb']
  var dataKeys = data[0].split(",") // first row
  var dataValues = data[data.length - 2 ].split(",") // last row
  for (i = 0; i < dataKeys.length; i++){
    if (acceptedKeys.includes(dataKeys[i]) || elements.includes(dataKeys[i])){
      dict[dataKeys[i]] = dataValues[i]
    }
  }
  console.log("DICTIONARY: \n", dict)
  var ipfs = require('./ipfs');
  ipfs.ipfsAddCsvFile(dict, res)
}


module.exports = {
  createIdentity: createIdentity,
  readUserData: readUserData,
  checkIfUserSubmittedIdologyWithinLastThreeMonths: checkIfUserSubmittedIdologyWithinLastThreeMonths,
  token: token,
  parseToken: parseToken,
  sendQuestions: sendQuestions,
  submitAnswers: submitAnswers,
  csvParser: csvParser
};
