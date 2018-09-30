const ipfsAPI = require('ipfs-api');

//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })


function ipfsGetFile(req, res, next) {
  //Getting the uploaded file via hash code.
  //This hash is returned hash of addFile router.
  // const validCID = 'QmQhM65XyqJ52QXWPz2opaGkALgH8XXhPn8n8nff4LDE6C'
  const validCID = 'QmbJWAESqCsf4RFCqEY7jecCashj8usXiyDNfKtZCwwzGb'
  ipfs.files.get(validCID, function (err, files) {
    files.forEach((file) => {
      console.log(file.path)
      console.log(file.content.toString('utf8'))
    })
  })
}


function ipfsAddFile(req, res, next) {
  //Addfile router for adding file a local file to the IPFS network without any local node
  console.log(req.body)
  let testBuffer = new Buffer(JSON.stringify(req.body));
  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {
      console.log(err);
    }
    res.send(file);
    console.log(file)
  })
}
/*
fetch('http://10.0.3.2:3000/addfile',
     {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json'i
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
  ipfsAddFile: ipfsAddFile
}
