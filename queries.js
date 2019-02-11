var environment = require('./app');
var util = require('util');
var parseString = require('xml2js').parseString;
var jwt = require('jsonwebtoken');
var FIXIE_URL = process.env.FIXIE_URL;
var request = require('request')
const uuidv4 = require('uuid/v4');
const fs = require('fs');

var admin = require("firebase-admin");
var serviceAccount = require("./firebase.json");
admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
 databaseURL: process.env.FIREBASE_DBURL
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

var idologyTemplate = {
      'username' : process.env.USERNAME,
      'password' : process.env.PASSWORD,
      'firstName' : '',
      'lastName' : '',
      'address': '',
      'zip' : '',
    }
// var idologyTemplate = {
//   'username' : process.env.USERNAME,
//   'password' : process.env.PASSWORD,
//   'firstName' : 'JOHN',
//   'lastName' : 'SMITH',
//   'address': '222333 peachtree place',
//   'zip' : '30318',
// }

function createIdentity(req, res, next) {
  console.log(req.body)

  let formResponses = req.body

  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
    for (var key in idologyTemplate) {
      if (idologyTemplate.hasOwnProperty(key) && formResponses[key]) {
        idologyTemplate[key] = formResponses[key]
          }
      }
    request.post({
      proxy: FIXIE_URL,
      url: 'https://web.idologylive.com/api/idiq.svc',
      form: idologyTemplate
    }, function(error, response, body){
      if (error) {
        console.log(error)
        res.send(false)
      }
      parseString(body, function (err, result) {
        if (err) {console.log(err)}
        console.log(result, "chance result")

        if (result.response.error) { res.send(false) } // catches invalid login: { response: { error: [ 'Invalid username and password' ] } }
        try {
          let verdict = result.response.results[0].key[0] //this is buggy on marks machine
          if (verdict === 'result.match' ){
            writeUserData(formResponses.edgeAccount, formResponses.organizationName, formResponses.firstName, formResponses.lastName, formResponses.zip, formResponses.address)
            res.send(true)
          } else {
            res.send(false)
          }
        } catch (err) {
          console.log(err)
          res.send(false)
        }
      })
    });
  })
  .catch(err => {
    logError("HERC: Failed to authenticate token", err)
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
    logError("HERC: Failed to authenticate token", err)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
  })
}


function writeUserData(username, organizationName, firstName, lastName, zip, address) {
  var id = uuidv4()
  /* TODO: Return the UUID to the front, store it in redux, encode it in the authToken */
  console.log("UUID: ", id)
  rootRef.child('idology').child(username).set({
    id: id,
    organizationName: organizationName,
    username: username,
    firstName: firstName,
    lastName : lastName,
    zip: zip,
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
    logError("HERC: Failed to authenticate token", err)
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
}


function csvParser(req, res, next) {
  var token = req.headers['authorization'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  firebase.auth().signInWithCustomToken(token)
  .then(user_login => {
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
    if (environment == 'development'){ console.log("DICTIONARY: \n", dict) }
    var ipfs = require('./ipfs');
    ipfs.ipfsAddCsvFile(dict, res)
  })
  .catch(err => {
    logError("HERC: Failed to authenticate token", err)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  })
}


function logError(message){

  var text = fs.readFileSync('error_logs.txt').toString();

  var data = message + ' ' + new Date().toUTCString() + '\n' + text;

  fs.writeFile('error_logs.txt', data, async function(err, data){
      if (err) console.log(err);
      console.log("Successfully Written Log Error to File.");
      let errorMessage = await fs.readFile('error_logs.txt', "utf8")
      console.log(errorMessage)
  });
}

function latestApk(req, res){
  if (!req.params.version) throw err;
  var version = req.params.version
  var latestVersion = "0.9.5" // hardcoding for now. In the future, this should be a global variable.
  return version == latestVersion ? res.status(200).send(true) : res.status(200).send(false)
}

module.exports = {
  token: token,
  logError: logError,
  latestApk: latestApk
};
