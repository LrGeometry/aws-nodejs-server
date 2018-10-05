var environment = require('./app');
var util = require('util');
var parseString = require('xml2js').parseString;
var jwt = require('jsonwebtoken');
var FIXIE_URL = process.env.FIXIE_URL;
var request = require('request')
const uuidv4 = require('uuid/v4');
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

  jwt.verify(token, process.env.ENCRYPTION_KEY, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    console.log("Decoded: ", decoded);

    // parseXMLResponse(process.env.xml);

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
    });
}

function numDaysBetween(d1, d2){
  var diff = Math.abs(d1 - d2);
  console.log("Days in between.... ", diff / (1000 * 60 * 60 * 24));
  return diff / (1000 * 60 * 60 * 24)
}

function checkIfUserSubmittedIdologyWithinLastThreeMonths(req, res, next) {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.ENCRYPTION_KEY, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    console.log("Decoded: ", decoded);

    return rootRef
      .child('idology')
      .child(decoded.username)
      .once('value', function(snapshot) {
      if (snapshot.exists()) {
        var d1 = snapshot.val().epochTimestamp
        var d2 = Date.now()
        // var d3 = new Date(2018, 6, 1) // Uncomment this line if you want to test when numDaysBetween > 90
        if (numDaysBetween(d1, d2) < 90) {
          res.status(200)
            .json({
              status: 'true',
              message: 'User, ' + decoded.username + ', is up-to-date.'
            });
        } else {
          res.status(200)
            .json({
              status: 'false',
              message: 'User, ' + decoded.username + ', is not up-to-date.'
            });
        }
      } else {
        res.status(200)
          .json({
            status: 'false',
            message: 'User, ' + decoded.username + ', is not up-to-date.'
          });
      }
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
  console.log("Request Body: ",req.body)
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
  console.log("Made it into the Token: ", token)

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


function csvParser() {
  var id = uuidv4()
  var Papa = require('papaparse');
  const fs = require('fs');
  var filename = "Gold-Reference-Chip-Average-Test-8-31-18.csv"; //TODO: Make the filename variable dynamic
  const file = fs.createReadStream("csv-reports/" + filename );
  Papa.parse(file, {
  	complete: function(results) {
      var dict = {};
      var acceptedKeys = ['Name', 'Class', 'Date', 'Time', 'Duration', 'Grade']
      var elements = ['Al','Ni','Cu','Rh','Pd','Ag','Cd','Sn','Sb','Pt','Au','Pb']
      var data = results.data
      var dataKeys = data[0]
      var dataValues = data[data.length - 1 ]
      for (i = 0; i < dataKeys.length; i++){
        if (acceptedKeys.includes(dataKeys[i]) || elements.includes(dataKeys[i])){
          dict[dataKeys[i]] = dataValues[i]
        }
      }
      // console.log("DICTIONARY: \n", dict)

      rootRef.child('csvParser').child(id).set(dict, function() {
        return rootRef
          .child('csvParser')
          .child(id)
          .once('value')
          .then(function(snapshot) {
            console.log(snapshot.val())
          });
      });

  	}
  });
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
