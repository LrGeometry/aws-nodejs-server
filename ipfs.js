const ipfsAPI = require('ipfs-api');
var request = require('request')

//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })


function ipfsGetFile(req, res, next) {
  let assets = [];
  // const validCID = 'QmQhM65XyqJ52QXWPz2opaGkALgH8XXhPn8n8nff4LDE6C'
  const validCID = req.query[0];

  ipfs.files.get(validCID, function (err, files) {
    if (err) { return console.error(err) }
    files.forEach((file) => {
      // console.log(file.content, 'file')
      assets.push(JSON.parse(file.content))
    })
    // console.log(files.toString('utf8'));
    // files.forEach((file) => {
    // console.log("hash path: ", file.path)
    // console.log(file.content.toString('utf8'))
    // console.log(JSON.parse(file.content))
    // assets.push(JSON.parse(file.content));
    res.send(assets)
  })
}

function ipfsAddCsvFile(body, res) {
  var obj = {}
  obj.key = 'csv'
  obj.hash = null
  let csvData = new Buffer(JSON.stringify(body));
  ipfs.files.add(csvData, function (err, file) {
    if (err) { console.log(err) };
    obj.hash = file[0].hash
    res.send(obj)
    console.log("Success IPFS csv upload ", obj.hash)
  })
}


function ipfsAddFile(req, res, next) {
  //Addfile router for adding file a local file to the IPFS network without any local node
  var cleanedBody = JSON.parse(Object.keys(req.body)[0])
  console.log(cleanedBody, "cleanedBody in ipfsAddFile") // { key: 'newAsset', data: req.body }

  var obj = {}
  obj.key = cleanedBody.key // {key: 'properties'}
  obj.hash = null // {key: 'properties', hash: null}
  let testBuffer = new Buffer(JSON.stringify(cleanedBody.data));

  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {console.log(err)};
    obj.hash = file[0].hash // {key: 'properties', hash: 'QmU1D1eAeSLC5Dt4wVRR'}
    res.send(obj);
    console.log("Success IPFS upload", cleanedBody, obj.hash)
  })
}

module.exports = {
  ipfsGetFile: ipfsGetFile,
  ipfsAddFile: ipfsAddFile,
  ipfsAddCsvFile:ipfsAddCsvFile
}
