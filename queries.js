var promise = require('bluebird');
let env = require('./app');
var util = require('util');
var parseString = require('xml2js').parseString;

var ApiKeys = require('./firebase')
var firebase = require('firebase')
firebase.initializeApp(ApiKeys.FirebaseConfig);
const rootRef = firebase.database().ref();

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var DATABASE_URL = "postgres://127.0.0.1:5432/hercules_node";

var config = {
    host: '127.0.0.1',
    database: 'hercules_node',
    user: 'postgres',
    password: 'secret',
    port: 5432
};

if (env.environment === 'development'){
  var db = pgp(DATABASE_URL);
} else {
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
var axios = require('axios');
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


function createIdentity(req, res, next) {
  console.log(req.body);
  //Submit answers with : https://web.idologylive.com/api/idliveq-answers.svc
  axios.post(`https://web.idologylive.com/api/idiq.svc?username=${USERNAME}&password=${PASSWORD}&firstName=${data.firstName}&lastName=${data.lastName}&address=${data.address}&zip=${data.zipCode}`)
  // axios.post(`https://web.idologylive.com/api/idiq.svc?username=${USERNAME}&password=${PASSWORD}&firstName=${req.body.firstName}&lastName=${req.body.lastName}&address=${req.body.address}&zip=${req.body.zipCode}`)
    .then (res => {
      console.log(res.data)
    })
    .catch(error => {
      console.log(error)
    })
  writeUserData(req.body.edgeAccount, req.body.firstName, req.body.lastName, req.body.address, req.body.zipCode)

  db.none('insert into identity(edgeAccount, firstName, lastName, address, zipCode, epochTimestamp)' +
      'values(${edgeAccount}, ${firstName}, ${lastName}, ${address}, ${zipCode},'+ Date.now() +')',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one identity'
        });
    })
    .catch(function (err) {
      return next(err);
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


function tokenize() {
  var jwt = require('jsonwebtoken');
  var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
  console.log(token)
  return token
}

function getAllPuppies(req, res, next) {
  db.any('select * from pups')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL puppies'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function getSinglePuppy(req, res, next) {
  var pupID = parseInt(req.params.id);
  db.one('select * from pups where id = $1', pupID)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE puppy'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function createPuppy(req, res, next) {
  /* TEST WITH CURL
  $ curl --data "name=Whisky&breed=annoying&age=3&sex=f" \
  http://127.0.0.1:8000/api/puppies
  */
  req.body.age = parseInt(req.body.age);
  db.none('insert into pups(name, breed, age, sex)' +
      'values(${name}, ${breed}, ${age}, ${sex})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one puppy'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function updatePuppy(req, res, next) {
  db.none('update pups set name=$1, breed=$2, age=$3, sex=$4 where id=$5',
    [req.body.name, req.body.breed, parseInt(req.body.age),
      req.body.sex, parseInt(req.params.id)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated puppy'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function removePuppy(req, res, next) {
  var pupID = parseInt(req.params.id);
  db.result('delete from pups where id = $1', pupID)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} puppy`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getAllPuppies: getAllPuppies,
  getSinglePuppy: getSinglePuppy,
  createPuppy: createPuppy,
  updatePuppy: updatePuppy,
  removePuppy: removePuppy,

  getAllIdentities: getAllIdentities,
  getSingleIdentity: getSingleIdentity,
  createIdentity: createIdentity,
  readUserData: readUserData,
  tokenize: tokenize
};

/*
============
  RESOURCES
=============
http://mherman.org/blog/2016/03/13/designing-a-restful-api-with-node-and-postgres/
*/
