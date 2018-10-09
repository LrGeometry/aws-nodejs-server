const ipfsAPI = require('ipfs-api');
var request = require('request')

//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })


function ipfsGetFile(req, res, next) {
  //Getting the uploaded file via hash code.
  //This hash is returned hash of addFile router.
  // const validCID = 'QmQhM65XyqJ52QXWPz2opaGkALgH8XXhPn8n8nff4LDE6C'
  const validCID = 'QmZajmzgVQzAtYmPRLto2diZonUqgJ9bZpTPZv68RcFu1p'
  ipfs.files.get(validCID, function (err, files) {
    files.forEach((file) => {
      console.log("hash path: ", file.path)
      console.log(file.content.toString('utf8'))
    })
  })
}


function ipfsAddFile(req, res, next) {
  //Addfile router for adding file a local file to the IPFS network without any local node
  // console.log("IPFS req.body: ",req.body)//{ '{"Logo":null,"Name":"asdfdsf","CoreProps":{"asdfds":""},"hercId":62}': ''
  var cleanedBody = JSON.stringify(req.body)//{"{\"Logo\":null,\"Name\":\"werwer\",\"CoreProps\":{\"wwerwe\":\"\"},\"hercId\":63}":""}
  let testBuffer = new Buffer(cleanedBody);
  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {
      console.log(err);
    }
    res.send(file);
    console.log(file)
  })
}

function testipfs(req, res, next) {
  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
  var dataObject = {alpha: "cordelia"}
  request.post({url: 'http://localhost:8000/api/ipfs/add', headers: headers, form: dataObject}, function (err, httpResponse, body) {
    console.log("IPFS test response: ", body)
    // var response = JSON.parse(body)
    // var hash = response[0].hash
    // var path = response[0].path
  })
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
