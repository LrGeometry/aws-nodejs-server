const ipfsAPI = require('ipfs-api');
var request = require('request')

//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })


function ipfsGetFile(req, res, next) {
  let assets = [];
  // const validCID = 'QmQhM65XyqJ52QXWPz2opaGkALgH8XXhPn8n8nff4LDE6C'
  const validCID = req.query[0];
  ipfs.files.get(validCID, function (err, files) {
    files.forEach((file) => {
      // console.log(file, 'file')
      assets.push((Object.keys(JSON.parse(file.content))))
    })
    // console.log(files.toString('utf8'));
    // files.forEach((file) => {
    // console.log("hash path: ", file.path)
    // console.log(file.content.toString('utf8'))
    // console.log(JSON.parse(file.content))
    // assets.push(JSON.parse(file.content));
    res.json(assets)
  })
}


function ipfsAddFile(req, res, next) {
  //Addfile router for adding file a local file to the IPFS network without any local node
  var cleanedBody = JSON.parse(Object.keys(req.body)[0])
  console.log(cleanedBody, "cleanedBody in ipfsAddFile")
  var obj = {}
  obj.key = cleanedBody.key // {key: 'properties'}
  obj.hash = null // {key: 'properties', hash: null}
  let testBuffer = new Buffer(JSON.stringify(cleanedBody.data));
  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {console.log(err)};
    obj.hash = file[0].hash // {key: 'properties', hash: 'QmU1D1eAeSLC5Dt4wVRR'}
    res.send(obj);
    console.log("Success", cleanedBody, file)
  })
}

function testipfs(req, res, next) {
  console.log("ehllo world")
  res.send("hello world")
}
/*
fetch('http://10.0.3.2:3000/addfile',
     {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json'
       },
       body: JSON.stringify(dataObject)
     })
     .then((response) => response.json()
     ).then((responseJson) => {
       console.log(responseJson, 'the response')// response is object.path, object.hash
     })
     .catch((error) => {
       console.error(error)
     })
*/
module.exports = {
  ipfsGetFile: ipfsGetFile,
  ipfsAddFile: ipfsAddFile,
  testipfs: testipfs
}
