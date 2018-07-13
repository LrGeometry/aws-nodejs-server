var promise = require('bluebird');
let julie = require('./app');
console.log("ITCROWD", julie)
var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var DATABASE_URL = "postgres://localhost:5432/hercules_node";

const cn = {
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: true
};

const db = pgp(DATABASE_URL);


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
  var pupID = parseInt(req.params.id);
  db.one('select * from identity where id = $1', pupID)
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


function createIdentity(req, res, next) {
  /* TEST WITH CURL
  $ curl --data "name=Whisky&breed=annoying&age=3&sex=f" \
  http://127.0.0.1:3000/api/puppies
  */
  req.body.age = parseInt(req.body.age);
  db.none('insert into identity((edge_account, first_name, last_name, address, zip_code, date_received)' +
      'values(${edge_account}, ${first_name}, ${last_name}, ${address}, ${zip_code}, ${date_received})',
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
  http://127.0.0.1:3000/api/puppies
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
};

/*
============
  RESOURCES
=============
http://mherman.org/blog/2016/03/13/designing-a-restful-api-with-node-and-postgres/
*/
