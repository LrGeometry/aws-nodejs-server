var firebase = require("firebase");
const ipfsClient = require("ipfs-api");
var queries = require("./queries");
var fs = require("fs");
//Connceting to the ipfs network via infura gateway
const ipfs = ipfsClient("ipfs.infura.io", "5001", { protocol: "https" });
const rootRef = firebase.database().ref();
const axios = require("axios");

function ipfsUnhash(req, res, next) {
  // const validCID = 'QmQhM65XyqJ52QXWPz2opaGkALgH8XXhPn8n8nff4LDE6C'
  const validCID = "QmP8r5PQgLQtJ9tTTzU78NcF7jMbMNXVm7s5f7p4qPtshh";

  ipfs.files.get(validCID, function (err, results) {
    if (err) {
      return console.error(err);
    }
    console.log("******", JSON.parse(results[0].content));
  });
}

function ipfsGetFile(req, res, next) {
  var token = req.headers["authorization"];
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });
  firebase
    .auth()
    .signInWithCustomToken(token)
    .then(user_login => {
      let assets = [];
      // const validCID = 'QmQhM65XyqJ52QXWPz2opaGkALgH8XXhPn8n8nff4LDE6C'
      const validCID = req.query[0];

      ipfs.files.get(validCID, function (err, files) {
        if (err) {
          return console.error("Error in ipfsGetFile(): ", err);
        }
        files.forEach(file => {
          // console.log(file.content, 'file')
          assets.push(JSON.parse(file.content));
        });
        // console.log(files.toString('utf8'));
        // files.forEach((file) => {
        // console.log("hash path: ", file.path)
        // console.log(file.content.toString('utf8'))
        // console.log(JSON.parse(file.content))
        // assets.push(JSON.parse(file.content));
        res.send(assets);
      });
    })
    .catch(err => {
      queries.logError("HERC: Failed to authenticate token; ipfsGetFile", err);
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    });
}

function ipfsAddCsvFile(body, res) {
  // TODO: find the req.headers inside of [res], then close this func off
  var obj = {};
  obj.key = "csv";
  obj.hash = null;
  let csvData = new Buffer(JSON.stringify(body));
  ipfs.files.add(csvData, function (err, file) {
    if (err) {
      console.log(err);
    }
    obj.hash = file[0].hash;

    let convertHashToLongURL = "https://ipfs.io/ipfs/" + obj.hash;

    let data = JSON.stringify({
      target: convertHashToLongURL,
      reuse: false
    });

    axios
    .post("https://kutt.it/api/url/submit", data, {
      headers: {
        // "x-api-key": "LacD3AF30VeWHGI8NUgUMilWX5Ijfdph9xPRvslv",
        "x-api-key": "fIiVxGQ8H11xvaBlJcCEFQULwveQ7eXV4OLuthcr",
        "Content-Type": "application/json"
      }
    })
    .then(response => (
      console.log("response from kutt.it ", response.data),
      obj.customUrl = response.data.shortUrl))
    .then(
      response => (
        console.log("Successful IPFS csv upload and Custom URL generated ", obj),
        res.send(obj)
      )
    )
    .catch(err => console.log(err));
  });
}

function ipfsAddFile(req, res, next) {
  var token = req.headers["authorization"];
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });
  firebase
    .auth()
    .signInWithCustomToken(token)
    .then(user_login => {
      //Addfile router for adding file a local file to the IPFS network without any local node
      try {
        var cleanedBody = JSON.parse(Object.keys(req.body)[0]);
      } catch (err) {
        queries.logError(
          "HERC: Invalid JSON, possible malicious code. ipfsAddFile",
          err
        ); /*TODO: must error out elegantly for end user */
      }

      var obj = {};
      obj.key = cleanedBody.key; // {key: 'properties'}
      obj.hash = null; // {key: 'properties', hash: null}
      let testBuffer = new Buffer(JSON.stringify(cleanedBody.data));
      ipfs.files.add(testBuffer, function (err, file) {
        if (err) {
          console.log("Error in ipfsAddFile(): ", err);
          return res
            .status(500)
            .send({ message: "Failed to add file to IPFS", error: err });
        }
        obj.hash = file[0].hash; // {key: 'properties', hash: 'QmU1D1eAeSLC5Dt4wVRR'}

                
        let convertHashToLongURL = "https://ipfs.io/ipfs/" + obj.hash;

        let data = JSON.stringify({
          target: convertHashToLongURL,
          reuse: false
        });

        axios
        .post("https://kutt.it/api/url/submit", data, {
          headers: {
            // "x-api-key": "LacD3AF30VeWHGI8NUgUMilWX5Ijfdph9xPRvslv",
            "x-api-key": "fIiVxGQ8H11xvaBlJcCEFQULwveQ7eXV4OLuthcr",
            "Content-Type": "application/json"
          }
        })
        .then(response => (
          console.log("response from kutt", response.data),
          obj.customUrl = response.data.shortUrl))
        .then(
          response => (
            console.log("successful upload to IPFS and custom link generated! ", obj),
            res.send(obj)
          )
        )
        .catch(err => console.log(err));
      });
    })
    .catch(err => {
      queries.logError("HERC: Failed to authenticate token; ipfsAddFile", err);
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    });
}

function ipfsAddImage(req, res, next) {
  fs.readFile(req.file.path, function (err, data) {
    if (err) throw err;
    ipfs.files.add(data, (err, result) => {
      // Upload buffer to IPFS
      if (err) {
        console.error(err);
        return;
      }
      let url = `https://ipfs.io/ipfs/${result[0].hash}`;
      console.log(`Url --> ${url}`);
      rootRef
        .child("AGLD_TEST_DB")
        .child("TEST_ASSET_ID")
        .child("images")
        .set({ url, hash: result[0].hash });
    });
  });

  fs.access(req.file.path, error => {
    if (!error) {
      fs.unlink(req.file.path, function (error) {
        console.error(error);
      });
      res.sendStatus(200);
    } else {
      console.error(error);
      res.sendStatus(500).send(error);
    }
  });

  /*
{ fieldname: 'agld_image',
  originalname: 'lifegoals.png',
  encoding: '7bit',
  mimetype: 'image/png',
  destination: 'uploads/',
  filename: '4f2aa905fcbff8d531625eda6ad19363',
  path: 'uploads/4f2aa905fcbff8d531625eda6ad19363',
  size: 306446 }
*/
}

async function ipfsUploadDocument(req, res, next) {
  //*** this function expects base64 content ***
  var token = req.headers["authorization"];
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });
  firebase
    .auth()
    .signInWithCustomToken(token)
    .then(user_login => {
      //Addfile router for adding file a local file to the IPFS network without any local node
      // console.log(req.body);
      try {
        var cleanedBody = JSON.parse(Object.keys(req.body)[0]);

        // console.log("HERC: cleanedBody in ipfsAddFile", cleanedBody) // { key: 'newAsset', data: req.body }
      } catch (err) {
        queries.logError(
          "HERC: Invalid JSON, possible malicious code. ipfsAddFile",
          err
        ); /*TODO: must error out elegantly for end user */
      }

      var content = cleanedBody.data.content;

      var obj = {};
      obj.key = cleanedBody.key; // {key: 'properties'}
      obj.hash = null; // {key: 'properties', hash: null}
      // let testBuffer = new Buffer( JSON.stringify(cleanedBody.data), 'base64' );
      var testBuffer = new Buffer(content, "base64");
      ipfs.files.add(testBuffer, function (err, file) {
        if (err) {
          console.log("Error in ipfsAddFile(): ", err);
          return res
            .status(500)
            .send({ message: "Failed to add file to IPFS", error: err });
        }
        obj.hash = file[0].hash; // {key: 'properties', hash: 'QmU1D1eAeSLC5Dt4wVRR'}
        let convertHashToLongURL = "https://ipfs.io/ipfs/" + obj.hash;

        let data = JSON.stringify({
          target: convertHashToLongURL,
          reuse: false
        });

        axios
          .post("https://kutt.it/api/url/submit", data, {
            headers: {
              // "x-api-key": "LacD3AF30VeWHGI8NUgUMilWX5Ijfdph9xPRvslv",
              "x-api-key": "fIiVxGQ8H11xvaBlJcCEFQULwveQ7eXV4OLuthcr",
              "Content-Type": "application/json"
            }
          })
          .then(response => (obj.customUrl = response.data.shortUrl))
          .then(
            response => (
              console.log("this is the object being sent to client", obj),
              res.send(obj)
            )
          )
          .catch(err => console.log(err));
      });
    })
    .catch(err => {
      queries.logError("HERC: Failed to authenticate token; ipfsAddFile", err);
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    });
}

function ipfsUploadImage(req, res, next) {
  //*** this function expects base64 content ***
  var token = req.headers["authorization"];
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });
  firebase
    .auth()
    .signInWithCustomToken(token)
    .then(user_login => {
      //Addfile router for adding file a local file to the IPFS network without any local node
      try {
        var cleanedBody = JSON.parse(Object.keys(req.body)[0]);
        // console.log("HERC: cleanedBody in ipfsAddFile", cleanedBody) // { key: 'newAsset', data: req.body }
      } catch (err) {
        queries.logError(
          "HERC: Invalid JSON, possible malicious code. ipfsAddFile",
          err
        ); /*TODO: must error out elegantly for end user */
      }

      var content = cleanedBody.data;

      var obj = {};
      obj.key = cleanedBody.key; // {key: 'properties'}
      obj.hash = null; // {key: 'properties', hash: null}
      // let testBuffer = new Buffer( JSON.stringify(cleanedBody.data), 'base64' );
      var testBuffer = new Buffer(content, "base64");
      ipfs.files.add(testBuffer, function (err, file) {
        if (err) {
          console.log("Error in ipfsAddFile(): ", err);
          return res
            .status(500)
            .send({ message: "Failed to add file to IPFS", error: err });
        }
        obj.hash = file[0].hash; // {key: 'properties', hash: 'QmU1D1eAeSLC5Dt4wVRR'}
        
        let convertHashToLongURL = "https://ipfs.io/ipfs/" + obj.hash;

        let data = JSON.stringify({
          target: convertHashToLongURL,
          reuse: false
        });

        axios
          .post("https://kutt.it/api/url/submit", data, {
            headers: {
              // "x-api-key": "LacD3AF30VeWHGI8NUgUMilWX5Ijfdph9xPRvslv",
              "x-api-key": "fIiVxGQ8H11xvaBlJcCEFQULwveQ7eXV4OLuthcr",
              "Content-Type": "application/json"
            }
          })
          .then(response => (
            console.log("response from kutt", response.data),
            obj.customUrl = response.data.shortUrl))
          .then(
            response => (
              console.log("successfully uploaded an Image to IPFS and custom link generated! ", obj),
              res.send(obj)
            )
          )
          .catch(err => console.log(err));
      });
    })
    .catch(err => {
      queries.logError("HERC: Failed to authenticate token; ipfsAddFile", err);
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    });
}

module.exports = {
  ipfsAddCsvFile: ipfsAddCsvFile,
  ipfsAddImage: ipfsAddImage,
  ipfsUnhash: ipfsUnhash,
  ipfsGetFile: ipfsGetFile,
  ipfsAddFile: ipfsAddFile,
  ipfsUploadDocument: ipfsUploadDocument,
  ipfsUploadImage: ipfsUploadImage
};
